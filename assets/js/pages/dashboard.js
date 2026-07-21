

function renderScoreboard(){
  const s = {pj:0,pg:0,pe:0,pp:0};
  matches.forEach(m=>{
    s.pj++;
    if(m.resultado==='Ganado') s.pg++; else if(m.resultado==='Perdido') s.pp++; else s.pe++;
  });
  const scoreboardEl=document.getElementById('scoreboard');
  if(!scoreboardEl) return;
  scoreboardEl.innerHTML = `
    <div><div class="sb-num">${s.pj}</div><div class="sb-label">Jugados</div></div>
    <div><div class="sb-num">${s.pg}</div><div class="sb-label">Ganados</div><div class="sb-pct">${s.pj?Math.round(s.pg/s.pj*100):0}%</div></div>
    <div><div class="sb-num draw">${s.pe}</div><div class="sb-label">Empatados</div><div class="sb-pct">${s.pj?Math.round(s.pe/s.pj*100):0}%</div></div>
    <div><div class="sb-num loss">${s.pp}</div><div class="sb-label">Perdidos</div><div class="sb-pct">${s.pj?Math.round(s.pp/s.pj*100):0}%</div></div>
  `;
}

function renderChips(){
  const el = document.getElementById('chipbar');
  let html = `<div class="chip ${activeTeamFilter==='all'?'active':''}" data-team="all"><span class="dot" style="background:var(--accent)"></span>Todos (fútbol)</div>`;
  futbolTeamIds.forEach(id=>{
    const t = TEAMS[id];
    html += `<div class="chip ${activeTeamFilter===id?'active':''}" data-team="${id}"><span class="dot" style="background:${t.color}"></span>${escapeHtml(t.name)}</div>`;
  });
  el.innerHTML = html;
  el.querySelectorAll('.chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{ activeTeamFilter = chip.dataset.team; matchTableVisible = PAGE_SIZE; renderChips(); renderMatchTable(); document.getElementById('matchesPanel').scrollIntoView({behavior:'smooth',block:'start'}); });
  });
}





function rivalLogoOnlyHtml(name){
  const logo=resolveRivalLogo(name);
  const safeName=escapeAttribute(name||'—');
  const fallback=escapeHtml(initials(name));
  if(logo){
    return `<span class="rival-logo"><img src="${escapeAttribute(logo)}" alt="${safeName}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="rival-fallback" hidden>${fallback}</span></span>`;
  }
  return `<span class="rival-logo"><span class="rival-fallback">${fallback}</span></span>`;
}










function renderTeamCards(){
  const grid = document.getElementById('teamGrid');
  grid.innerHTML = Object.keys(TEAMS).map(teamCardHtml).join('');
  grid.querySelectorAll('.team-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const id = card.dataset.team;
      if(TEAMS[id].sport==='nfl'){
        document.getElementById('nflTableBody').closest('.panel').scrollIntoView({behavior:'smooth', block:'start'});
        return;
      }
      activeTeamFilter = id; matchTableVisible = PAGE_SIZE; renderChips(); renderMatchTable();
      document.getElementById('matchTableBody').closest('.panel').scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
}



function tournamentBg(tt){
  if(tt.logo) return tt.logo;
  if(/champions/i.test(tt.name||'')) return 'logos/torneos/champions_league.png';
  return resolveTournamentLogo(tt.name||'');
}

function isTitleMatchRecord(m){ return Boolean(m?.titleDecision); }
function isRunnerUp(m){ return m.resultado==='Perdido' && /gran final/i.test(m.fase||''); }
function isWonTitle(m){ return m.resultado==='Ganado' && (m.titleWon || m.titleStatus==='ganado'); }
function titleCountsForTeam(teamId){
  const rows=matches.filter(m=>m.team===teamId && isTitleMatchRecord(m));
  return {titles:rows.filter(isWonTitle).length,runners:rows.filter(isRunnerUp).length};
}
function tournamentLogoFor(name){
  const map=window.TOURNAMENT_LOGOS||{};
  return map[name] || (/^UEFA Champions League/i.test(name)?'logos/torneos/champions_league.png':resolveTournamentLogo(name));
}
function isLeagueTournament(m){ return /la liga|saudi professional league/i.test(m.torneo||'') || /^jornada\s+\d+/i.test(m.fase||''); }
function titleStatusText(m){
  if(isWonTitle(m)) return 'TÍTULO';
  if(isRunnerUp(m)) return 'SUBCAMPEÓN';
  if(m.resultado==='Perdido' && isLeagueTournament(m)) return 'TORNEO PERDIDO';
  return 'ELIMINADO';
}
function opponentForTitle(m){
  const followed=TEAMS[m.team]?.name||'';
  return m.localName===followed ? m.visitName : m.localName;
}
function renderTitles(){
  const grid=document.getElementById('titleGrid');
  const sorted=matches.filter(isTitleMatchRecord).slice().sort((a,b)=>(b.mes*100+b.dia)-(a.mes*100+a.dia));
  const shown=titlesExpanded?sorted:sorted.slice(0,4);
  grid.innerHTML=shown.map(m=>{
    const t=TEAMS[m.team], teamLogo=TEAM_LOGOS[m.team]||'', comp=tournamentLogoFor(m.torneo);
    const rival=opponentForTitle(m)||m.rival||'Rival';
    const outcome=isWonTitle(m)?`Ganó ante ${rival}`:`Perdió ante ${rival}`;
    return `<article class="achievement-card ${isWonTitle(m)?'won':'lost'}">
      <span class="achievement-status">${titleStatusText(m)}</span>
      <div class="achievement-name">${escapeHtml(m.torneo)}</div>
      <div class="achievement-logo">${teamLogo?`<img src="${teamLogo}" alt="${t.name}">`:'🏆'}</div>
      <div class="achievement-team">${escapeHtml(t.name)}</div>
      <div class="achievement-opponent"><span class="achievement-rival-logo">${rivalLogoHtml(rival)}</span><span>${escapeHtml(outcome)}</span></div>
      <div class="achievement-final">${escapeHtml(m.fase||'—')}<div class="achievement-score">${formatMatchScore(m)}</div>${m.dia} ${MONTHS[m.mes]}</div>
      <span class="ball-watermark" aria-hidden="true">⚽</span>
      ${comp?`<img class="competition-logo-corner" src="${escapeAttribute(comp)}" alt="${escapeAttribute(m.torneo)}" onerror="this.style.display='none'">`:''}
    </article>`;
  }).join('');
  const won=sorted.filter(isWonTitle).length;
  const runners=sorted.filter(isRunnerUp).length;
  const btn=document.getElementById('titlesMoreBtn');
  btn.classList.toggle('hidden',sorted.length<=4);
  btn.textContent=titlesExpanded?'Ver menos':'Ver más títulos';
  document.getElementById('titleTotal').innerHTML=`<div><div class="t-num">${won}</div><div class="t-lbl">Títulos ganados</div></div><div><div class="t-num loss">${runners}</div><div class="t-lbl">Subcampeonatos</div></div>`;
}

const weeklySeriesState={g:true,e:true,p:true,pct:true};
function renderWeekly(){
  const allWeeks = buildWeeklyData();
  const chartWeeks = allWeeks;
  const detailWeeks = allWeeks.slice().reverse().slice(0, weeklyVisible);
  const wrap = document.getElementById('weeklyChartWrap');
  const body = document.getElementById('weeklyTableBody');

  const count=document.getElementById('weeklyCount');
  const moreBtn=document.getElementById('weeklyMoreBtn');
  if(!allWeeks.length){
    wrap.innerHTML = '';
    body.innerHTML = `<tr class="empty-row"><td colspan="7">Aún no hay partidos registrados.</td></tr>`;
    count.textContent=''; moreBtn.classList.add('hidden');
    return;
  }
  count.textContent=`Detalle: ${detailWeeks.length} de ${allWeeks.length} semanas`;
  moreBtn.classList.toggle('hidden',detailWeeks.length>=allWeeks.length);

  const barW = 30, gap = 12, padL = 42, padR = 24, padT = 22, padB = 30;
  const maxPj = Math.max(...chartWeeks.map(w=>w.pj), 1);
  const chartH = Math.max(120, maxPj * 26);
  const w = padL + chartWeeks.length*(barW+gap) + padR;
  const h = padT + chartH + padB;
  const unitH = chartH / maxPj;

  let bars = '';
  let linePts = [];
  chartWeeks.forEach((wk,i)=>{
    const x = padL + i*(barW+gap);
    let yCursor = padT + chartH;
    const segs = [
      {n:weeklySeriesState.g?wk.g:0, color:'var(--win)'},
      {n:weeklySeriesState.e?wk.e:0, color:'var(--draw)'},
      {n:weeklySeriesState.p?wk.p:0, color:'var(--loss)'},
    ];
    segs.forEach(seg=>{
      const segH = seg.n * unitH;
      yCursor -= segH;
      if(seg.n>0) bars += `<rect x="${x}" y="${yCursor}" width="${barW}" height="${segH}" fill="${seg.color}"/>`;
    });
    bars += `<text x="${x+barW/2}" y="${padT+chartH+18}" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#a39a86">S${wk.week}</text>`;
    const lineY = padT + chartH - (wk.pct/100)*chartH;
    linePts.push([x+barW/2, lineY]);
  });

  const gridLines = [0,25,50,75,100].map(v=>{
    const y = padT + chartH - (v/100)*chartH;
    return `<line x1="${padL-8}" y1="${y}" x2="${w-padR}" y2="${y}" stroke="#ece6d8" stroke-width="1"/>`;
  }).join('');

  const linePath = weeklySeriesState.pct?smoothPath(linePts):'';
  const lineDots = weeklySeriesState.pct?linePts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--accent-3)" stroke="#fff" stroke-width="1.4"/>`).join(''):'';

  wrap.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    ${gridLines}
    ${bars}
    ${weeklySeriesState.pct?`<path d="${linePath}" fill="none" stroke="var(--accent-3)" stroke-width="2.4"/>`:''}
    ${lineDots}
  </svg>`;

  body.innerHTML = detailWeeks.map(wk=>`
    <tr>
      <td class="mono">Semana ${wk.week}</td>
      <td>${wk.rangeLabel}</td>
      <td class="mono">${wk.pj}</td>
      <td class="mono" style="color:var(--win)">${wk.g}</td>
      <td class="mono" style="color:var(--draw)">${wk.e}</td>
      <td class="mono" style="color:var(--loss)">${wk.p}</td>
      <td class="mono">${wk.pct}%</td>
    </tr>`).join('');
}

function populateCompetitionFilter(){
  const sel=document.getElementById('competitionFilter');
  const current=sel.value || 'all';
  const names=[...new Set(matches.filter(m=>TEAMS[m.team]?.sport==='futbol').map(m=>m.torneo).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  sel.innerHTML='<option value="all">Todas las competiciones</option>'+names.map(n=>`<option value="${escapeAttribute(n)}">${escapeHtml(n)}</option>`).join('');
  sel.value=names.includes(current)?current:'all';
}




function formatMatchScore(m){
  const l=Number(m.localScore ?? (m.venueSide==='away'?m.gc:m.gf));
  const v=Number(m.visitScore ?? (m.venueSide==='away'?m.gf:m.gc));
  let left=String(l), right=String(v);
  if(m.aggregateLocal!==null && m.aggregateLocal!==undefined && m.aggregateVisit!==null && m.aggregateVisit!==undefined){
    left += `(${m.aggregateLocal})`; right += `(${m.aggregateVisit})`;
  }else if(typeof m.scoreAnnotation==='string' && /^\(\s*\d+\s*-\s*\d+\s*\)$/.test(m.scoreAnnotation.trim())){
    const nums=m.scoreAnnotation.match(/\d+/g)||[];
    if(nums.length===2){ left+=`(${nums[0]})`; right+=`(${nums[1]})`; }
  }
  let out=`${left} - ${right}`;
  if(m.penaltyLocal!==null && m.penaltyLocal!==undefined && m.penaltyVisit!==null && m.penaltyVisit!==undefined){
    out += ` <small>(${m.penaltyLocal}-${m.penaltyVisit} pen.)</small>`;
  }
  if(m.extraTime) out += ` <small>(T.E.)</small>`;
  return out;
}
function scoreDisplay(m){ return formatMatchScore(m); }

const DOMESTIC_TOURNAMENTS=[
  /la liga/i,/copa del rey/i,/supercopa de españa/i,/liga bbva mx/i,/liga mx/i,/saudi professional league/i,/nfl temporada/i
];
function isDomesticMatch(m){
  if(String(m.scope||m.alcance||'').toUpperCase()==='LOCAL') return true;
  if(String(m.scope||m.alcance||'').toUpperCase()==='INTERNACIONAL') return false;
  return DOMESTIC_TOURNAMENTS.some(rx=>rx.test(m.torneo||''));
}
function originHtml(origin,m){ return isDomesticMatch(m)?'':`<small>${origin||'—'}</small>`; }
function teamCellHtml(name,origin,m,teamId){
  const isFollowed=name===TEAMS[teamId]?.name;
  const logo=isFollowed?miniLogoHtml(teamId):rivalLogoOnlyHtml(name);
  return `<div class="ledger-team">${logo}<div><strong>${escapeHtml(name||'—')}</strong>${originHtml(origin,m)}</div></div>`;
}

function renderMatchTable(){
 const body=document.getElementById('matchTableBody'),search=(document.getElementById('searchInput').value||'').toLowerCase(),sortMode=document.getElementById('sortSelect').value,competition=document.getElementById('competitionFilter').value;
 const scope=document.getElementById('scopeFilter')?.value||'all', titleMode=document.getElementById('titleFilter')?.value||'all';
 let rows=matches.filter(m=>TEAMS[m.team]?.sport==='futbol'&&(activeTeamFilter==='all'||m.team===activeTeamFilter)&&(competition==='all'||m.torneo===competition)&&(scope==='all'||(scope==='domestic'&&isDomesticMatch(m))||(scope==='international'&&!isDomesticMatch(m)))&&(titleMode==='all'||isTitleMatchRecord(m))&&(!search||`${m.localName} ${m.visitName} ${m.originLocal} ${m.originVisit} ${m.estadio||''} ${m.ciudad||''} ${m.torneo} ${m.fase}`.toLowerCase().includes(search))).sort((a,b)=>sortMode==='recent'?(b.mes*100+b.dia)-(a.mes*100+a.dia):(a.mes*100+a.dia)-(b.mes*100+b.dia));
 const ledgerTotal=document.getElementById('ledgerTotal'); if(ledgerTotal) ledgerTotal.textContent=`${matches.filter(m=>TEAMS[m.team]?.sport==='futbol').length} partidos registrados`;
 if(!rows.length){body.innerHTML='<tr class="empty-row"><td colspan="8">No hay partidos con estos filtros.</td></tr>';document.getElementById('matchTableCount').textContent='';document.getElementById('verMasBtn').classList.add('hidden');return;}
 const visible=rows.slice(0,matchTableVisible);document.getElementById('matchTableCount').textContent=`Mostrando ${visible.length} de ${rows.length} partidos`;document.getElementById('verMasBtn').classList.toggle('hidden',visible.length>=rows.length);
 body.innerHTML=visible.map(m=>`<tr class="ledger-row">
 <td><span class="followed-team-dot" style="--team-color:${TEAMS[m.team]?.color||'#999'}" title="${escapeAttribute(TEAMS[m.team]?.name||'')}"></span></td>
 <td class="mono ledger-date">${m.dia||'—'} ${MONTHS[m.mes]||''}</td>
 <td>${teamCellHtml(m.localName,m.originLocal,m,m.team)}</td>
 <td class="score-cell">${scoreDisplay(m)}</td>
 <td>${teamCellHtml(m.visitName,m.originVisit,m,m.team)}</td>
 <td><div class="ledger-stack"><strong>${escapeHtml(m.estadio||'—')}</strong>${m.ciudad?`<small>${escapeHtml(m.ciudad)}</small>`:''}</div></td>
 <td><div class="ledger-stack competition-cell"><strong>${escapeHtml(m.torneo||'—')}</strong><small>${escapeHtml(m.fase||'—')}</small></div></td>
 <td><span class="status-tag ${resClass(m.resultado)}">${resLabel(m.resultado)}</span></td></tr>`).join('');
}
function renderNflTable(){
  const body=document.getElementById('nflTableBody');
  const rows=matches.filter(m=>TEAMS[m.team]?.sport==='nfl').slice().sort((a,b)=>(b.mes*100+b.dia)-(a.mes*100+a.dia));
  if(!rows.length){body.innerHTML='<tr class="empty-row"><td colspan="7">No hay partidos de NFL registrados todavía.</td></tr>';return;}
  body.innerHTML=rows.map(m=>{
    const isAway=m.venueSide==='away';
    const rivalOrigin=isAway?(m.originLocal||'—'):(m.originVisit||'—');
    return `<tr><td>${miniLogoHtml(m.team)}</td><td class="mono">${m.dia} ${MONTHS[m.mes]}</td><td><div class="nfl-rival">${rivalLogoHtml(m.rival)}<small class="origin-note">${rivalOrigin}</small></div></td><td class="${venueLabel(m)==='—'?'muted':''}">${escapeHtml(venueLabel(m))}</td><td>${escapeHtml(m.torneo)}${m.fase?' · '+escapeHtml(m.fase):''}</td><td class="mono">${formatMatchScore(m)}</td><td><span class="res-tag ${resClass(m.resultado)}">${resLabel(m.resultado)}</span></td></tr>`;
  }).join('');
}

function fillTeamSelect(){
  const sel = document.getElementById('f_team');
  sel.innerHTML = Object.entries(TEAMS).map(([id,t])=>`<option value="${escapeAttribute(id)}">${escapeHtml(t.name)}${t.sport==='nfl'?' (NFL)':''}</option>`).join('');
  sel.addEventListener('change', updateFieldLabels);
  updateFieldLabels();
}
function updateFieldLabels(){
  const team = document.getElementById('f_team').value;
  const isNfl = TEAMS[team] && TEAMS[team].sport==='nfl';
  document.getElementById('lbl_gf').textContent = isNfl ? 'Puntos a favor' : 'Goles a favor';
  document.getElementById('lbl_gc').textContent = isNfl ? 'Puntos en contra' : 'Goles en contra';

  const datalist = document.getElementById('torneoOptions');
  const known = TOURNAMENTS_CONFIG[team] || [];
  datalist.innerHTML = known.map(t=>`<option value="${escapeAttribute(t.name)}"></option>`).join('');
}

function updateResultPreview(){
  const gf = Number(document.getElementById('f_gf').value)||0;
  const gc = Number(document.getElementById('f_gc').value)||0;
  const hasInput = document.getElementById('f_gf').value!=='' && document.getElementById('f_gc').value!=='';
  const pill = document.getElementById('resultPreview');
  if(!hasInput){ pill.textContent='—'; pill.className='result-pill e'; return; }
  const r = computeResult(gf,gc);
  pill.textContent = resLabel(r);
  pill.className = 'result-pill ' + resClass(r);
}

function renderRecentTable(){
  const body = document.getElementById('recentTableBody');
  const recent = matches.filter(m=>m.userAdded).slice().reverse().slice(0,12);
  if(!recent.length){
    body.innerHTML = `<tr class="empty-row"><td colspan="6">Todavía no agregas marcadores nuevos.</td></tr>`;
    return;
  }
  body.innerHTML = recent.map(m=>{
    const t = TEAMS[m.team];
    const isAway=m.venueSide==='away';
    return `<tr>
      <td class="mono">${m.dia} ${MONTHS[m.mes]}</td>
      <td><span class="match-team-name"><span class="match-team-dot" style="background:${t.accent||t.color}"></span><span>${escapeHtml(t.name)}</span></span></td>
      <td>${rivalLogoHtml(m.rival)}</td>
      <td class="mono">${isAway?m.gc:m.gf} - ${isAway?m.gf:m.gc}</td>
      <td><span class="res-tag ${resClass(m.resultado)}">${resLabel(m.resultado)}</span></td>
      <td><button class="del-btn" data-id="${escapeAttribute(m.id)}">Eliminar</button></td>
    </tr>`;
  }).join('');
  body.querySelectorAll('.del-btn').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      matches = matches.filter(m=>m.id!==btn.dataset.id);
      await persist(); renderAll(); toast('Marcador eliminado');
    });
  });
}

async function handleAdd(){
  const team = document.getElementById('f_team').value;
  const rival = document.getElementById('f_rival').value.trim();
  const dia = Number(document.getElementById('f_dia').value);
  const mes = Number(document.getElementById('f_mes').value);
  const torneo = document.getElementById('f_torneo').value.trim();
  const fase = document.getElementById('f_fase').value.trim();
  const estadio = document.getElementById('f_estadio').value.trim();
  const ciudad = document.getElementById('f_ciudad').value.trim();
  const gf = document.getElementById('f_gf').value;
  const gc = document.getElementById('f_gc').value;

  if(!rival || gf==='' || gc==='' || !dia){ toast('Falta rival, día o marcador'); return; }
  const resultado = computeResult(Number(gf), Number(gc));
  const id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
  const esTitulo = document.getElementById('f_esTitulo').checked;
  const tituloResultado = document.getElementById('f_tituloResultado').value;
  matches.push({id, team, dia, mes, rival, torneo, fase, estadio, ciudad, sede:'', gf:Number(gf), gc:Number(gc), resultado, userAdded:true,
    titleDecision:esTitulo, titleStatus:esTitulo?tituloResultado:null, tournamentId:esTitulo?normalizeKey(torneo):null});
  await persist();

  if(esTitulo && torneo){
    await setTournamentStatus(team, torneo, tituloResultado);
  }

  renderAll(); toast('Marcador agregado ✓'); clearForm();
}

function clearForm(){
  ['f_rival','f_dia','f_torneo','f_fase','f_estadio','f_ciudad','f_gf','f_gc'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f_esTitulo').checked = false;
  document.getElementById('f_tituloResultado').classList.add('hidden');
  updateResultPreview();
}

function switchTab(tab){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.getElementById('tab-seguimiento').classList.toggle('hidden', tab!=='seguimiento');
  document.getElementById('tab-registrar').classList.toggle('hidden', tab!=='registrar');
}


function renderGeneralStats(){
  const football=matches.filter(m=>TEAMS[m.team]?.sport==='futbol');
  const pj=football.length, pg=football.filter(m=>m.resultado==='Ganado').length, pe=football.filter(m=>m.resultado==='Empatado').length, pp=football.filter(m=>m.resultado==='Perdido').length;
  const gf=football.reduce((a,m)=>a+(Number(m.gf)||0),0), gc=football.reduce((a,m)=>a+(Number(m.gc)||0),0);
  const titleRows=matches.filter(isTitleMatchRecord), titles=titleRows.filter(isWonTitle).length, runners=titleRows.filter(isRunnerUp).length;
  const tournaments=new Set(titleRows.map(m=>m.tournamentId||normalizeKey(m.torneo))).size;
  const el=document.getElementById('generalStats'); if(!el)return;
  const items=[
    ['🏆',titles,'Títulos ganados'],['🥈',runners,'Subcampeonatos'],['◉',tournaments,'Torneos competidos'],['⚽',pj,'Partidos jugados'],
    ['●',pg,'Partidos ganados','win'],['●',pe,'Partidos empatados','draw'],['●',pp,'Partidos perdidos','loss'],
    ['GF',gf,'Goles a favor'],['GC',gc,'Goles en contra'],['DG',`${gf-gc>=0?'+':''}${gf-gc}`,'Diferencia de goles'],
    ['%',`${pj?(pg/pj*100).toFixed(1):'0.0'}%`,'Porcentaje de victorias'],['G/P',pj?(gf/pj).toFixed(2):'0.00','Goles por partido']
  ];
  el.innerHTML=items.map(([i,v,label,tone=''])=>`<button class="general-stat ${tone}" type="button" aria-label="${label}: ${v}" data-tooltip="${label}"><span>${i}</span><strong>${v}</strong></button>`).join('');
}
function renderExtraStats(){
  const football=matches.filter(m=>TEAMS[m.team]?.sport==='futbol');
  const gf=football.reduce((a,m)=>a+(Number(m.gf)||0),0), gc=football.reduce((a,m)=>a+(Number(m.gc)||0),0);
  const clean=football.filter(m=>Number(m.gc)===0).length;
  const avg=football.length?(gf/football.length).toFixed(2):'0.00';
  const extraStatsEl=document.getElementById('extraStats'); if(!extraStatsEl)return;
  extraStatsEl.innerHTML=`
    <div class="extra-stat"><strong>${avg}</strong><span>Goles por partido</span></div>
    <div class="extra-stat"><strong>${clean}</strong><span>Porterías en cero</span></div>
    <div class="extra-stat"><strong>${gf-gc>=0?'+':''}${gf-gc}</strong><span>Diferencia de goles</span></div>
    <div class="extra-stat"><strong>${football.length?Math.round(football.filter(m=>m.resultado==='Ganado').length/football.length*100):0}%</strong><span>Win rate fútbol</span></div>`;
}

function renderAll(){
  populateCompetitionFilter();
  renderScoreboard();
  renderGeneralStats();
  renderChips();
  renderTeamCards();
  renderTitles();
  renderWeekly();
  renderMatchTable();
  renderNflTable();
  renderRecentTable();
}



async function init(){
  applyTheme(localStorage.getItem('ratiosports_theme') || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  fillTeamSelect();
  applyBackgroundPhoto();
  await loadMatches();
  await loadTitleOverrides();
  renderAll();
  document.querySelectorAll('.tab-btn[data-tab]').forEach(b=>b.addEventListener('click', ()=>switchTab(b.dataset.tab)));
  document.getElementById('searchInput').addEventListener('input', ()=>{ matchTableVisible = PAGE_SIZE; renderMatchTable(); });
  document.getElementById('sortSelect').addEventListener('change', ()=>{ matchTableVisible = PAGE_SIZE; renderMatchTable(); });
  document.getElementById('competitionFilter').addEventListener('change', ()=>{ matchTableVisible = PAGE_SIZE; renderMatchTable(); });
  document.getElementById('scopeFilter').addEventListener('change', ()=>{ matchTableVisible = PAGE_SIZE; renderMatchTable(); });
  document.getElementById('titleFilter').addEventListener('change', ()=>{ matchTableVisible = PAGE_SIZE; renderMatchTable(); });
  document.getElementById('clearFiltersBtn').addEventListener('click', ()=>{ document.getElementById('searchInput').value=''; document.getElementById('competitionFilter').value='all'; document.getElementById('scopeFilter').value='all'; document.getElementById('titleFilter').value='all'; activeTeamFilter='all'; matchTableVisible=PAGE_SIZE; renderAll(); });
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  const sidebarToggle=document.getElementById('sidebarToggle');
  if(sidebarToggle){
    const collapsed=localStorage.getItem('ratiosports_sidebar_collapsed')==='1';
    document.body.classList.toggle('sidebar-collapsed',collapsed);
    sidebarToggle.addEventListener('click',()=>{const next=!document.body.classList.contains('sidebar-collapsed');document.body.classList.toggle('sidebar-collapsed',next);localStorage.setItem('ratiosports_sidebar_collapsed',next?'1':'0');});
  }
  document.querySelectorAll('.tabbar a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const target=document.querySelector(a.getAttribute('href'));if(target) target.scrollIntoView({behavior:'smooth',block:'start'});}));
  document.querySelectorAll('.tabbar a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.tabbar a').forEach(x=>x.classList.remove('active'));a.classList.add('active');}));
  document.getElementById('verMasBtn').addEventListener('click', ()=>{ matchTableVisible += PAGE_SIZE; renderMatchTable(); });
  
  document.querySelectorAll('.tabbar a[href^="#"]').forEach(link=>{
    link.addEventListener('click',ev=>{
      const target=document.querySelector(link.getAttribute('href'));
      if(!target)return;
      ev.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
      document.querySelectorAll('.tabbar .tab-btn').forEach(x=>x.classList.remove('active'));
      link.classList.add('active');
    });
  });

  document.getElementById('weeklyMoreBtn').addEventListener('click', ()=>{ weeklyVisible += WEEK_PAGE_SIZE; renderWeekly(); });
  document.querySelectorAll('#weeklyToggles [data-series]').forEach(btn=>btn.addEventListener('click',()=>{
    const key=btn.dataset.series; weeklySeriesState[key]=!weeklySeriesState[key];
    btn.classList.toggle('active',weeklySeriesState[key]); renderWeekly();
  }));
  document.getElementById('titlesMoreBtn').addEventListener('click',()=>{titlesExpanded=!titlesExpanded;renderTitles();});
  document.getElementById('f_gf').addEventListener('input', updateResultPreview);
  document.getElementById('f_gc').addEventListener('input', updateResultPreview);
  document.getElementById('addBtn').addEventListener('click', handleAdd);
  document.getElementById('clearBtn').addEventListener('click', clearForm);
  document.getElementById('f_esTitulo').addEventListener('change', (e)=>{
    document.getElementById('f_tituloResultado').classList.toggle('hidden', !e.target.checked);
  });
}
init();
