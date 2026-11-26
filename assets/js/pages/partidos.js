/* Controlador de la página de Gestión (partidos.html). Escritura protegida
   por admin-auth.js; la consulta de datos sigue siendo pública. */

const OUTCOME_OPTIONS = [
  ['en_curso','En curso'],
  ['campeon','Campeón'],
  ['subcampeon','Subcampeón (perdió la final)'],
  ['eliminado','Eliminado / torneo perdido'],
];

/* ---------- Estado de los torneos ---------- */
function renderTournamentManager(){
  const host=document.getElementById('tournamentGroups');
  const ledger=buildTournamentLedger();
  if(!ledger.length){ host.innerHTML='<p class="muted">Aún no hay torneos con partidos registrados.</p>'; window.AdminAuthUI?.refreshWriteControls(); return; }
  const byTeam={};
  ledger.forEach(t=>{ (byTeam[t.team]=byTeam[t.team]||[]).push(t); });

  host.innerHTML=Object.keys(TEAMS).filter(id=>byTeam[id]).map(id=>{
    const team=TEAMS[id];
    const rows=byTeam[id].map(t=>{
      const last=t.closing||t.last;
      const opts=OUTCOME_OPTIONS.map(([v,l])=>`<option value="${v}"${v===t.outcome?' selected':''}>${l}</option>`).join('');
      return `<div class="trow" data-team="${escapeAttr(t.team)}" data-torneo="${escapeAttr(t.torneo)}" data-current="${t.outcome}">
        <div class="trow__name"><strong>${escapeHtml(t.torneo)}</strong>
          <small>${t.record.pj} PJ · ${t.record.pg} G · ${t.record.pe} E · ${t.record.pp} P · último: ${escapeHtml(last.fase||'—')}, ${last.dia} ${MONTHS[last.mes]}</small></div>
        <span class="badge badge--${t.outcome}">${escapeHtml(outcomeLabel(t))}</span>
        <select class="select tstatus-select" aria-label="Estado de ${escapeAttr(t.torneo)}">${opts}</select>
        <button class="btn btn-sm tstatus-save" type="button">Guardar</button>
      </div>`;
    }).join('');
    return `<div class="tgroup"><div class="tgroup__head">${logoImgHtml(resolveTeamLogo(id,team.name),team.name,'mteam__logo')}<h3>${escapeHtml(team.name)}</h3></div>${rows}</div>`;
  }).join('');

  host.querySelectorAll('.tstatus-save').forEach(btn=>btn.addEventListener('click',async()=>{
    const row=btn.closest('.trow'), select=row.querySelector('.tstatus-select');
    if(select.value===row.dataset.current){ toast('Sin cambios en este torneo'); return; }
    btn.disabled=true;
    try{
      await TournamentService.setOutcome(row.dataset.team,row.dataset.torneo,select.value);
      renderAll(); toast('Torneo actualizado ✓');
    }catch(e){ console.error(e); toast('No se pudo guardar: '+e.message); btn.disabled=false; }
  }));
  window.AdminAuthUI?.refreshWriteControls();
}

/* ---------- Formulario ---------- */
function fillTeamSelect(){
  const sel=document.getElementById('f_team');
  sel.innerHTML=Object.entries(TEAMS).map(([id,t])=>`<option value="${escapeAttr(id)}">${escapeHtml(t.name)}${t.sport==='nfl'?' (NFL)':''}</option>`).join('');
  sel.addEventListener('change',updateFieldLabels);
  updateFieldLabels();
  const countries=['España','México','Arabia Saudita','Portugal','Estados Unidos','Inglaterra','Francia','Alemania','Italia','Bélgica','Croacia','Colombia','Chile','Ecuador','Panamá','Sudáfrica','Nigeria','Uzbekistán','Corea del Sur','Australia','Marruecos','Japón'];
  document.getElementById('rivalCountryOptions').innerHTML=countries.map(c=>`<option value="${escapeAttr(c)}"></option>`).join('');
}
function updateFieldLabels(){
  const team=document.getElementById('f_team').value;
  const isNfl=TEAMS[team]?.sport==='nfl';
  document.getElementById('lbl_gf').textContent=isNfl?'Puntos a favor':'Goles a favor';
  document.getElementById('lbl_gc').textContent=isNfl?'Puntos en contra':'Goles en contra';
  const names=getTeamTournaments(team).map(t=>t.name);
  document.getElementById('torneoOptions').innerHTML=[...new Set(names)].map(n=>`<option value="${escapeAttr(n)}"></option>`).join('');
}
function updateResultPreview(){
  const gfEl=document.getElementById('f_gf'), gcEl=document.getElementById('f_gc');
  const pill=document.getElementById('resultPreview');
  if(gfEl.value===''||gcEl.value===''){ pill.textContent='—'; pill.className='res res--e'; return; }
  const r=computeResult(Number(gfEl.value),Number(gcEl.value));
  pill.textContent=resLabel(r); pill.className='res res--'+resClass(r);
}
// Propone un estado de cierre razonable según fase y marcador; el usuario puede cambiarlo.
let outcomeTouched=false;
function suggestOutcome(){
  if(outcomeTouched) return;
  const fase=document.getElementById('f_fase').value, gf=document.getElementById('f_gf').value, gc=document.getElementById('f_gc').value;
  const isFinal=/final/i.test(fase) && !/semi|cuartos|octavos|dieci/i.test(fase);
  const won = gf!=='' && gc!=='' && Number(gf)>Number(gc);
  document.getElementById('f_tituloResultado').value = isFinal ? (won?'campeon':'subcampeon') : 'eliminado';
}
function toggleOutcomeField(){
  const on=document.getElementById('f_esTitulo').checked;
  document.getElementById('f_tituloWrap').classList.toggle('hidden',!on);
  if(on) suggestOutcome();
}

async function handleAdd(){
  const val=id=>document.getElementById(id).value;
  const team=val('f_team'), rival=val('f_rival').trim(), dia=Number(val('f_dia')), mes=Number(val('f_mes'));
  const torneo=val('f_torneo').trim(), fase=val('f_fase').trim(), estadio=val('f_estadio').trim(), ciudad=val('f_ciudad').trim();
  const rivalCountry=val('f_rivalCountry').trim(), venueSide=val('f_venueSide');
  const internacional=document.getElementById('f_internacional').checked;
  const extraTime=document.getElementById('f_extraTime').checked;
  const gf=val('f_gf'), gc=val('f_gc');
  const num=id=>val(id)===''?null:Number(val(id));

  if(!rival||gf===''||gc===''||!dia){ toast('Falta rival, día o marcador'); return; }
  if(dia>MONTH_LENGTHS[mes-1]){ toast(`${MONTHS[mes]} solo tiene ${MONTH_LENGTHS[mes-1]} días`); return; }
  if(Number(gf)<0||Number(gc)<0){ toast('El marcador no puede ser negativo'); return; }

  const esCierre=document.getElementById('f_esTitulo').checked;
  if(esCierre && !torneo){ toast('Escribe el torneo para poder cerrarlo'); return; }
  const outcome=esCierre?val('f_tituloResultado'):'en_curso';

  const teamName=TEAMS[team].name, away=venueSide==='away';
  const followedCountry=TEAMS[team].type==='Selección'?TEAMS[team].name:(TEAMS[team].country||'');
  const originLocal=internacional?(away?(rivalCountry||'—'):(followedCountry||'—')):'—';
  const originVisit=internacional?(away?(followedCountry||'—'):(rivalCountry||'—')):'—';
  const match={
    id:'u_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    team, dia, mes, rival, torneo, fase, estadio, ciudad, sede:'',
    gf:Number(gf), gc:Number(gc), resultado:computeResult(Number(gf),Number(gc)), userAdded:true,
    localName:away?rival:teamName, visitName:away?teamName:rival,
    localScore:away?Number(gc):Number(gf), visitScore:away?Number(gf):Number(gc),
    originLocal, originVisit, rivalCountry, internacional, venueSide,
    aggregateLocal:num('f_aggLocal'), aggregateVisit:num('f_aggVisit'),
    penaltyLocal:num('f_penLocal'), penaltyVisit:num('f_penVisit'), extraTime,
    ...outcomeFields(outcome), tournamentId:esCierre?normalizeKey(torneo):null,
  };
  try{
    // Un torneo solo puede tener UN partido de cierre: se limpian los anteriores.
    if(esCierre && isCompetitiveTournament(torneo)){
      const key=tournamentKey(team,torneo);
      for(const m of matches.filter(x=>x.team===team && tournamentKey(x.team,x.torneo)===key && isTitleMatchRecord(x))){
        await MatchService.update(m.id,{...outcomeFields('en_curso'),tournamentId:null});
      }
    }
    await MatchService.add(normalizedMatch(match,null));
  }catch(e){ console.error(e); toast('No se pudo guardar: '+e.message); return; }
  renderAll(); toast('Marcador agregado ✓'); clearForm();
}

function clearForm(){
  ['f_rival','f_rivalCountry','f_dia','f_torneo','f_fase','f_estadio','f_ciudad','f_gf','f_gc','f_aggLocal','f_aggVisit','f_penLocal','f_penVisit'].forEach(id=>document.getElementById(id).value='');
  ['f_esTitulo','f_internacional','f_extraTime'].forEach(id=>document.getElementById(id).checked=false);
  document.getElementById('f_venueSide').value='home';
  document.getElementById('f_tituloResultado').value='campeon';
  outcomeTouched=false; toggleOutcomeField(); updateResultPreview();
}

/* ---------- Últimos partidos ---------- */
function renderRecentTable(){
  const body=document.getElementById('recentTableBody');
  const rows=matches.slice().sort((a,b)=>byDateDesc(a,b)||String(b.id).localeCompare(String(a.id))).slice(0,15);
  if(!rows.length){ body.innerHTML='<tr><td class="empty" colspan="9">Todavía no hay partidos.</td></tr>'; return; }
  body.innerHTML=rows.map(m=>{
    const t=TEAMS[m.team]||{}, away=m.venueSide==='away';
    const me=mteamHtml({name:t.name,logoHtml:teamLogoSlot(m.team),me:true});
    const rival=rivalCellHtml(m.rival);
    const o=matchOutcome(m);
    return `<tr>
      <td><span class="dot-team" style="--c:${escapeAttr(teamStripe(t))}" title="${escapeAttr(t.name||'')}"></span></td>
      <td class="date">${m.dia} ${MONTHS[m.mes]}</td>
      <td>${away?rival:me}</td><td class="score">${formatMatchScore(m)}</td><td>${away?me:rival}</td>
      <td><div class="stack"><strong>${escapeHtml(m.torneo||'—')}</strong><small>${escapeHtml(m.fase||'—')}</small></div></td>
      <td><span class="res res--${resClass(m.resultado)}">${resLabel(m.resultado)}</span></td>
      <td>${o?`<span class="badge badge--${o}">${escapeHtml(outcomeLabel({outcome:o,closing:m}))}</span>`:''}</td>
      <td><button class="btn btn-sm btn-danger del-btn" data-id="${escapeAttr(m.id)}" type="button">Eliminar</button></td></tr>`;
  }).join('');
  body.querySelectorAll('.del-btn').forEach(btn=>btn.addEventListener('click',async()=>{
    if(!confirm('¿Eliminar este partido? No se puede deshacer.')) return;
    try{ await MatchService.remove(btn.dataset.id); renderAll(); toast('Partido eliminado'); }
    catch(e){ console.error(e); toast('No se pudo eliminar: '+e.message); }
  }));
}

function renderAll(){
  renderTournamentManager();
  renderWeeksAdmin();
  renderRecentTable();
  updateFieldLabels();
  window.AdminAuthUI?.refreshWriteControls();
}

async function init(){
  initTheme();
  fillTeamSelect();
  await loadMatches();
  await window.AdminAuthUI?.init();
  renderAll();
  document.getElementById('f_gf').addEventListener('input',()=>{ updateResultPreview(); suggestOutcome(); });
  document.getElementById('f_gc').addEventListener('input',()=>{ updateResultPreview(); suggestOutcome(); });
  document.getElementById('f_fase').addEventListener('input',suggestOutcome);
  document.getElementById('f_tituloResultado').addEventListener('change',()=>{ outcomeTouched=true; });
  document.getElementById('f_esTitulo').addEventListener('change',toggleOutcomeField);
  document.getElementById('addBtn').addEventListener('click',handleAdd);
  document.getElementById('clearBtn').addEventListener('click',clearForm);
  initWeeksAdmin();
}
init();
