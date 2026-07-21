const escapeHtml = window.SportsCore?.escapeHtml || ((value='') => String(value));
const escapeAttr = escapeHtml;


function renderScoreboard(){
  const s = {pj:0,pg:0,pe:0,pp:0};
  matches.forEach(m=>{
    s.pj++;
    if(m.resultado==='Ganado') s.pg++; else if(m.resultado==='Perdido') s.pp++; else s.pe++;
  });
  document.getElementById('scoreboard').innerHTML = `
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
    html += `<div class="chip ${activeTeamFilter===id?'active':''}" data-team="${id}"><span class="dot" style="background:${escapeAttr(t.color)}"></span>${escapeHtml(t.name)}</div>`;
  });
  el.innerHTML = html;
  el.querySelectorAll('.chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{ activeTeamFilter = chip.dataset.team; matchTableVisible = PAGE_SIZE; renderChips(); renderMatchTable(); });
  });
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



function renderTitles(){
  const grid = document.getElementById('titleGrid');
  let cards=[]; let totalComp=0,totalWon=0;
  Object.keys(TEAMS).forEach(id=>{
    const t=TEAMS[id];
    getTeamTournaments(id).forEach(tt=>{
      const status=effectiveTournamentStatus(id,tt);
      const m=findTitleMatch(id,tt);
      if(status==='en_curso' && !m) return;
      totalComp++; if(status==='ganado') totalWon++;
      const logo=resolveTeamLogo(id, TEAMS[id]?.name);
      const state=status==='ganado'?'GANADO':status==='perdido'?'PERDIDO':'EN DISPUTA';
      const cls=status==='ganado'?'won':status==='perdido'?'lost':'';
      const finalHtml=m?`<div class="achievement-final">${escapeHtml(m.fase||'Final')} vs ${escapeHtml(m.rival)}<div class="achievement-score">${m.gf} - ${m.gc}</div>${m.dia} ${MONTHS[m.mes]}</div>`:`<div class="achievement-final">Torneo en disputa</div>`;
      cards.push(`<article class="achievement-card ${cls}" title="Vinculado por torneo + fase final">
        <span class="achievement-status">${state}</span>
        <div class="achievement-name">${escapeHtml(tt.name)}</div>
        <div class="achievement-logo">${logo?`<img src="${logo}" alt="${escapeAttr(t.name)}">`:`<span style="font-size:44px">🏆</span>`}</div>
        <div class="achievement-team">${escapeHtml(t.name)}</div>
        <div class="achievement-meta">${escapeHtml(t.type)} · ${escapeHtml(t.country)}</div>
        ${finalHtml}
      </article>`);
    });
  });
  grid.innerHTML=cards.length?cards.join(''):`<div class="muted">No hay finales vinculadas todavía.</div>`;
  document.getElementById('titleTotal').innerHTML=`<div><div class="t-num">${totalWon}</div><div class="t-lbl">Títulos ganados</div></div><div><div class="t-num" style="color:var(--text-dim)">${totalComp}</div><div class="t-lbl">Finales / torneos</div></div>`;
}

function renderWeekly(){
  const allWeeks = buildWeeklyData();
  const chartWeeks = allWeeks;
  const detailWeeks = allWeeks.slice(0, weeklyVisible);
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
      {n:wk.g, color:'var(--win)'},
      {n:wk.e, color:'var(--draw)'},
      {n:wk.p, color:'var(--loss)'},
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

  const linePath = smoothPath(linePts);
  const lineDots = linePts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--accent-3)" stroke="#fff" stroke-width="1.4"/>`).join('');

  wrap.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    ${gridLines}
    ${bars}
    <path d="${linePath}" fill="none" stroke="var(--accent-3)" stroke-width="2.4"/>
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
  sel.innerHTML='<option value="all">Todas las competiciones</option>'+names.map(n=>`<option value="${escapeAttr(n)}">${escapeHtml(n)}</option>`).join('');
  sel.value=names.includes(current)?current:'all';
}



function renderMatchTable(){
  const body = document.getElementById('matchTableBody');
  const search = (document.getElementById('searchInput').value || '').toLowerCase();
  const sortMode = document.getElementById('sortSelect').value;
  const competition = document.getElementById('competitionFilter').value;

  let rows = matches.filter(m=>{
    if(TEAMS[m.team].sport!=='futbol') return false;
    if(activeTeamFilter!=='all' && m.team!==activeTeamFilter) return false;
    if(competition!=='all' && m.torneo!==competition) return false;
    if(search){
      const hay = `${m.rival} ${m.torneo} ${m.fase} ${m.estadio||''} ${m.ciudad||''}`.toLowerCase();
      if(!hay.includes(search)) return false;
    }
    return true;
  });
  rows = rows.slice().sort((a,b)=>{
    const av=a.mes*100+a.dia, bv=b.mes*100+b.dia;
    return sortMode==='recent' ? bv-av : av-bv;
  });

  if(!rows.length){
    body.innerHTML = `<tr class="empty-row"><td colspan="7">No hay partidos que coincidan con el filtro.</td></tr>`;
    document.getElementById('matchTableCount').textContent = '';
    document.getElementById('verMasBtn').classList.add('hidden');
    return;
  }

  const total = rows.length;
  const visibleRows = rows.slice(0, matchTableVisible);
  const btn = document.getElementById('verMasBtn');
  document.getElementById('matchTableCount').textContent = `Mostrando ${visibleRows.length} de ${total} partidos`;
  btn.classList.toggle('hidden', visibleRows.length >= total);

  body.innerHTML = visibleRows.map(m=>{
    const t = TEAMS[m.team];
    return `<tr>
      <td class="mono">${m.dia} ${MONTHS[m.mes]}</td>
      <td><span class="match-team-name"><span class="match-team-dot" style="background:${escapeAttr(t.accent||t.color)}"></span><span>${escapeHtml(t.name)}</span></span></td>
      <td>${rivalLogoHtml(m.rival)}</td>
      <td class="${venueLabel(m)==='—'?'muted':''}">${escapeHtml(venueLabel(m))}</td>
      <td>${escapeHtml(m.torneo)}${m.fase?' · '+escapeHtml(m.fase):''}</td>
      <td class="mono">${isAway?m.gc:m.gf} - ${isAway?m.gf:m.gc}</td>
      <td><span class="res-tag ${resClass(m.resultado)}">${resLabel(m.resultado)}</span></td>
    </tr>`;
  }).join('');
}

function renderNflTable(){
  const body = document.getElementById('nflTableBody');
  let rows = matches.filter(m=>TEAMS[m.team].sport==='nfl');
  rows = rows.slice().sort((a,b)=>(b.mes*100+b.dia)-(a.mes*100+a.dia));
  if(!rows.length){
    body.innerHTML = `<tr class="empty-row"><td colspan="7">No hay partidos de NFL registrados todavía.</td></tr>`;
    return;
  }
  body.innerHTML = rows.map(m=>`
    <tr>
      <td>${miniLogoHtml(m.team)}</td>
      <td class="mono">${m.dia} ${MONTHS[m.mes]}</td>
      <td>${rivalLogoHtml(m.rival)}</td>
      <td class="${venueLabel(m)==='—'?'muted':''}">${escapeHtml(venueLabel(m))}</td>
      <td>${escapeHtml(m.torneo)}${m.fase?' · '+escapeHtml(m.fase):''}</td>
      <td class="mono">${isAway?m.gc:m.gf} - ${isAway?m.gf:m.gc}</td>
      <td><span class="res-tag ${resClass(m.resultado)}">${resLabel(m.resultado)}</span></td>
    </tr>`).join('');
}

function fillTeamSelect(){
  const sel = document.getElementById('f_team');
  sel.innerHTML = Object.entries(TEAMS).map(([id,t])=>`<option value="${escapeAttr(id)}">${escapeHtml(t.name)}${t.sport==='nfl'?' (NFL)':''}</option>`).join('');
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
  datalist.innerHTML = known.map(t=>`<option value="${escapeAttr(t.name)}"></option>`).join('');
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
  const body=document.getElementById('recentTableBody');
  const recent=matches.filter(m=>m.userAdded).slice().reverse().slice(0,12);
  if(!recent.length){body.innerHTML=`<tr class="empty-row"><td colspan="10">Todavía no agregas marcadores nuevos.</td></tr>`;return;}
  body.innerHTML=recent.map(m=>{
    const t=TEAMS[m.team],isAway=m.venueSide==='away';
    const localName=isAway?m.rival:t.name, visitName=isAway?t.name:m.rival;
    return `<tr>
      <td><span class="followed-team-dot" style="--team-color:${escapeAttr(t.color)}" title="${escapeAttr(t.name)}"></span></td>
      <td class="mono">${m.dia} ${MONTHS[m.mes]}</td>
      <td>${isAway?rivalLogoHtml(m.rival):miniLogoHtml(m.team)} ${escapeHtml(localName)}</td>
      <td class="mono">${isAway?m.gc:m.gf} - ${isAway?m.gf:m.gc}</td>
      <td>${isAway?miniLogoHtml(m.team):rivalLogoHtml(m.rival)} ${escapeHtml(visitName)}</td>
      <td>${escapeHtml(venueLabel(m))}</td><td>${escapeHtml(m.torneo||'—')}</td><td>${escapeHtml(m.fase||'—')}</td>
      <td><span class="res-tag ${resClass(m.resultado)}">${resLabel(m.resultado)}</span></td>
      <td><button class="del-btn" data-id="${escapeAttr(m.id)}">Eliminar</button></td></tr>`;
  }).join('');
  body.querySelectorAll('.del-btn').forEach(btn=>btn.addEventListener('click',async()=>{matches=matches.filter(m=>m.id!==btn.dataset.id);await persist();renderAll();toast('Marcador eliminado');}));
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
  const aggLocal = document.getElementById('f_aggLocal').value;
  const aggVisit = document.getElementById('f_aggVisit').value;
  const penLocal = document.getElementById('f_penLocal').value;
  const penVisit = document.getElementById('f_penVisit').value;
  const extraTime = document.getElementById('f_extraTime').checked;

  if(!rival || gf==='' || gc==='' || !dia){ toast('Falta rival, día o marcador'); return; }
  const resultado = computeResult(Number(gf), Number(gc));
  const id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
  const esTitulo = document.getElementById('f_esTitulo').checked;
  const tituloResultado = document.getElementById('f_tituloResultado').value;
  const venueSide = document.getElementById('f_venueSide')?.value || 'home';
  const teamName=TEAMS[team].name;
  const localName=venueSide==='away'?rival:teamName;
  const visitName=venueSide==='away'?teamName:rival;
  const localScore=venueSide==='away'?Number(gc):Number(gf);
  const visitScore=venueSide==='away'?Number(gf):Number(gc);
  matches.push({id, team, dia, mes, rival, torneo, fase, estadio, ciudad, sede:'', gf:Number(gf), gc:Number(gc), resultado, userAdded:true,
    localName,visitName,localScore,visitScore,originLocal:'—',originVisit:'—',
    aggregateLocal:aggLocal===''?null:Number(aggLocal),aggregateVisit:aggVisit===''?null:Number(aggVisit),
    penaltyLocal:penLocal===''?null:Number(penLocal),penaltyVisit:penVisit===''?null:Number(penVisit),extraTime,
    titleDecision:esTitulo, titleStatus:esTitulo?tituloResultado:null, titleWon:esTitulo&&tituloResultado==='ganado', tournamentId:esTitulo?normalizeKey(torneo):null, venueSide});
  await persist();

  if(esTitulo && torneo){
    await setTournamentStatus(team, torneo, tituloResultado);
  }

  renderAll(); toast('Marcador agregado ✓'); clearForm();
}

function clearForm(){
  ['f_rival','f_dia','f_torneo','f_fase','f_estadio','f_ciudad','f_gf','f_gc','f_aggLocal','f_aggVisit','f_penLocal','f_penVisit'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f_esTitulo').checked = false;
  document.getElementById('f_extraTime').checked = false;
  document.getElementById('f_tituloResultado').classList.add('hidden');
  updateResultPreview();
}

function switchTab(tab){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.getElementById('tab-seguimiento').classList.toggle('hidden', tab!=='seguimiento');
  document.getElementById('tab-registrar').classList.toggle('hidden', tab!=='registrar');
}

function renderAll(){
  populateCompetitionFilter();
  renderScoreboard();
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
  document.getElementById('clearFiltersBtn').addEventListener('click', ()=>{ document.getElementById('searchInput').value=''; document.getElementById('competitionFilter').value='all'; activeTeamFilter='all'; matchTableVisible=PAGE_SIZE; renderAll(); });
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
  document.getElementById('weeklyMoreBtn').addEventListener('click', ()=>{ weeklyVisible += WEEK_PAGE_SIZE; renderWeekly(); });
  document.getElementById('f_gf').addEventListener('input', updateResultPreview);
  document.getElementById('f_gc').addEventListener('input', updateResultPreview);
  document.getElementById('addBtn').addEventListener('click', handleAdd);
  document.getElementById('clearBtn').addEventListener('click', clearForm);
  document.getElementById('f_esTitulo').addEventListener('change', (e)=>{
    document.getElementById('f_tituloResultado').classList.toggle('hidden', !e.target.checked);
  });
}
init();
window.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>{document.getElementById("tab-seguimiento")?.classList.add("hidden");document.getElementById("tab-registrar")?.classList.remove("hidden");},0)});
