/* Controlador de la página pública (index.html). Solo lectura. */

const HONOURS_PAGE = 8;
let honoursExpanded = false;
const weeklySeriesState = {g:true, e:true, p:true, pct:true};

function pctText(n,total){ return total ? Math.round(n/total*100) : 0; }

/* ---------- hero ---------- */
function renderHero(){
  const r = recordOf(matches);
  const teams = Object.keys(TEAMS).length;
  document.getElementById('heroEyebrow').textContent = `Temporada 2026 · ${teams} equipos`;
  document.getElementById('heroRecord').innerHTML = `
    <div class="rec"><div class="rec__num">${r.pj}</div><div class="rec__label">Jugados</div></div>
    <div class="rec rec--win"><div class="rec__num">${r.pg}</div><div class="rec__label">Ganados</div><div class="rec__pct">${pctText(r.pg,r.pj)}%</div></div>
    <div class="rec rec--draw"><div class="rec__num">${r.pe}</div><div class="rec__label">Empatados</div><div class="rec__pct">${pctText(r.pe,r.pj)}%</div></div>
    <div class="rec rec--loss"><div class="rec__num">${r.pp}</div><div class="rec__label">Perdidos</div><div class="rec__pct">${pctText(r.pp,r.pj)}%</div></div>`;
  document.getElementById('heroBar').innerHTML = r.pj
    ? `<span class="w" style="width:${r.pg/r.pj*100}%"></span><span class="d" style="width:${r.pe/r.pj*100}%"></span><span class="l" style="width:${r.pp/r.pj*100}%"></span>` : '';
  const last = matches.slice().sort((a,b)=>byDateDesc(a,b)||String(b.id).localeCompare(String(a.id))).slice(0,8);
  document.getElementById('heroTicker').innerHTML = last.map(m=>`
    <div class="tick tick--${resClass(m.resultado)}" title="${escapeAttr(TEAMS[m.team].name)} vs ${escapeAttr(m.rival)} · ${escapeAttr(m.torneo||'')}">
      ${teamLogoSlot(m.team)}
      <div><b>${m.gf} – ${m.gc}</b><small>vs ${escapeHtml(m.rival)} · ${m.dia} ${MONTHS[m.mes]}</small></div>
    </div>`).join('');
}

/* ---------- equipos ---------- */
function renderTeams(){
  const grid = document.getElementById('teamGrid');
  grid.innerHTML = Object.keys(TEAMS).map(id=>teamCardHtml(id, activeTeamFilter===id)).join('');
  grid.querySelectorAll('.team').forEach(card=>{
    const go = ()=>{
      const id = card.dataset.team;
      if(TEAMS[id].sport==='nfl'){ document.getElementById('nfl').scrollIntoView({behavior:'smooth'}); return; }
      activeTeamFilter = activeTeamFilter===id ? 'all' : id;
      matchTableVisible = PAGE_SIZE;
      renderTeams(); renderChips(); renderMatchTable();
      if(activeTeamFilter!=='all') document.getElementById('bitacora').scrollIntoView({behavior:'smooth'});
    };
    card.addEventListener('click',go);
    card.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } });
  });
}

/* ---------- estadísticas ---------- */
function statHtml(value,label,{tone='',hint=''}={}){
  return `<div class="stat ${tone?'stat--'+tone:''}"><div class="stat__value">${value}</div><div class="stat__label">${escapeHtml(label)}</div>${hint?`<div class="stat__hint">${escapeHtml(hint)}</div>`:''}</div>`;
}
function renderStats(){
  const o = overallStats(), a = o.all, f = o.football;
  const h = honoursFromLedger(buildTournamentLedger());
  const signed = n => `${n>=0?'+':''}${n}`;

  const general = [
    statHtml(a.pj,'Partidos jugados',{hint:`${f.pj} fútbol · ${o.nfl.pj} NFL`}),
    statHtml(a.pg,'Ganados',{tone:'win'}),
    statHtml(a.pe,'Empatados',{tone:'draw'}),
    statHtml(a.pp,'Perdidos',{tone:'loss'}),
    statHtml(`${a.pctExact.toFixed(1)}%`,'Victorias',{hint:'sobre todos los partidos'}),
    statHtml(h.tournaments,'Torneos disputados',{hint:h.inProgress?`${h.inProgress} en juego`:'ninguno en juego'}),
    statHtml(h.titles,'Títulos',{tone:'gold'}),
    statHtml(h.runners,'Subcampeonatos'),
    statHtml(h.eliminated,'Torneos perdidos',{hint:'eliminado o sin opción'}),
  ].join('');

  const football = [
    statHtml(f.gf,'Goles a favor'),
    statHtml(f.gc,'Goles en contra'),
    statHtml(signed(f.diff),'Diferencia de goles'),
    statHtml(f.gpm.toFixed(2),'Goles por partido'),
    statHtml(f.cleanSheets,'Porterías a cero',{hint:`${pctText(f.cleanSheets,f.pj)}% de los partidos`}),
    statHtml(f.blanks,'Partidos sin marcar',{hint:`${pctText(f.blanks,f.pj)}% de los partidos`}),
  ].join('');

  document.getElementById('statGroups').innerHTML = `
    <div class="stat-group"><div class="stat-group__head"><span class="stat-group__title">Todos los deportes</span></div><div class="stat-list">${general}</div></div>
    <div class="stat-group"><div class="stat-group__head"><span class="stat-group__title">Fútbol</span><span class="tag">Solo fútbol</span></div><div class="stat-list">${football}</div></div>`;
}

/* ---------- torneos ---------- */
function renderHonours(){
  const ledger = buildTournamentLedger();
  const h = honoursFromLedger(ledger);
  document.getElementById('ledgerSummary').innerHTML = `
    <div class="gold"><b>${h.titles}</b><span>Títulos</span></div>
    <div><b>${h.runners}</b><span>Subcampeonatos</span></div>
    <div class="loss"><b>${h.eliminated}</b><span>Torneos perdidos</span></div>
    <div><b>${h.inProgress}</b><span>En juego</span></div>`;

  const shown = honoursExpanded ? ledger : ledger.slice(0,HONOURS_PAGE);
  const grid = document.getElementById('honourGrid');
  if(!ledger.length){ grid.innerHTML='<p class="muted">Todavía no hay torneos registrados.</p>'; }
  else grid.innerHTML = shown.map(t=>{
    const team = TEAMS[t.team], comp = tournamentLogoFor(t.torneo);
    const label = outcomeLabel(t);
    const c = t.closing;
    const lines = [];
    if(c){
      lines.push(`<div class="line vs-line"><span>${escapeHtml(c.fase||'—')} · vs</span>${rivalLogoSlot(c.rival)}<span>${escapeHtml(c.rival)}</span></div>`);
      lines.push(`<div class="line"><span class="honour__score">${formatMatchScore(c).replace(/<small>.*?<\/small>/g,'')}</span><span class="muted">${c.dia} ${MONTHS[c.mes]}</span></div>`);
    }else{
      const l = t.last;
      lines.push(`<div class="line vs-line"><span>Último: ${escapeHtml(l.fase||'—')} · vs</span>${rivalLogoSlot(l.rival)}<span>${escapeHtml(l.rival)}</span></div>`);
      lines.push(`<div class="line"><span class="muted">${l.dia} ${MONTHS[l.mes]}</span></div>`);
    }
    lines.push(`<div class="line muted">${t.record.pj} PJ · ${t.record.pg} G · ${t.record.pe} E · ${t.record.pp} P</div>`);
    return `<article class="honour is-${t.outcome}">
      <div class="honour__top"><span class="badge badge--${t.outcome}">${escapeHtml(label)}</span>${comp?`<img class="honour__comp" src="${escapeAttr(comp)}" alt="" onerror="this.style.display='none'">`:''}</div>
      <div class="honour__name">${escapeHtml(t.torneo)}</div>
      <div class="honour__team"><img src="${escapeAttr(resolveTeamLogo(t.team,team.name))}" alt="" onerror="this.style.display='none'">${escapeHtml(team.name)}</div>
      <div class="honour__foot">${lines.join('')}</div>
    </article>`;
  }).join('');

  const btn = document.getElementById('honoursMoreBtn');
  btn.classList.toggle('hidden', ledger.length<=HONOURS_PAGE);
  btn.textContent = honoursExpanded ? 'Ver menos' : `Ver todos los torneos (${ledger.length})`;
}

/* ---------- semanas ---------- */
function renderWeekly(){
  const weeks = buildWeeklyData();
  const wrap = document.getElementById('weeklyChartWrap');
  const body = document.getElementById('weeklyTableBody');
  const count = document.getElementById('weeklyCount');
  const moreBtn = document.getElementById('weeklyMoreBtn');
  const detail = weeks.slice().reverse().slice(0,weeklyVisible);

  if(!weeks.length){
    wrap.innerHTML = '';
    body.innerHTML = '<tr><td class="empty" colspan="7">Aún no hay partidos registrados.</td></tr>';
    count.textContent=''; moreBtn.classList.add('hidden');
    return;
  }
  count.textContent = `Mostrando ${detail.length} de ${weeks.length} semanas`;
  moreBtn.classList.toggle('hidden', detail.length>=weeks.length);

  const colW=44, barW=26, padL=34, padR=44, padT=26, padB=30, chartH=220;
  const maxPj = Math.max(...weeks.map(w=>w.pj),1);
  const axisMax = Math.max(4, Math.ceil(maxPj/4)*4);       // 4 divisiones enteras
  const W = padL + weeks.length*colW + padR, H = padT + chartH + padB;
  const unit = chartH/axisMax;
  const yPct = v => padT + chartH - (v/100)*chartH;

  let grid='', bars='', pts=[], labels='', hits='';
  for(let k=0;k<=4;k++){
    const y = padT + chartH - (k/4)*chartH;
    grid += `<line class="${k===0?'axis':'grid'}" x1="${padL}" x2="${W-padR}" y1="${y}" y2="${y}"/>`;
    grid += `<text class="tick-pj" x="${padL-8}" y="${y+4}" text-anchor="end">${axisMax*k/4}</text>`;
    if(weeklySeriesState.pct) grid += `<text class="ypct" x="${W-padR+8}" y="${y+4}">${k*25}%</text>`;
  }
  weeks.forEach((wk,i)=>{
    const x = padL + i*colW + (colW-barW)/2;
    let y = padT + chartH;
    [['g',wk.g],['e',wk.e],['p',wk.p]].forEach(([key,n])=>{
      if(!weeklySeriesState[key] || !n) return;
      const h = n*unit; y -= h;
      bars += `<rect class="bar-${key}" x="${x}" y="${y}" width="${barW}" height="${h-1}" rx="2"/>`;
    });
    const shown = (weeklySeriesState.g?wk.g:0)+(weeklySeriesState.e?wk.e:0)+(weeklySeriesState.p?wk.p:0);
    if(shown) labels += `<text class="tick-pj" x="${x+barW/2}" y="${y-6}" text-anchor="middle">${shown}</text>`;
    labels += `<text x="${x+barW/2}" y="${padT+chartH+19}" text-anchor="middle">${escapeHtml(wk.shortLabel)}</text>`;
    pts.push([x+barW/2, yPct(wk.pct)]);
    hits += `<rect class="hit" x="${padL+i*colW}" y="${padT}" width="${colW}" height="${chartH}"><title>${escapeHtml(wk.label)} · ${escapeHtml(wk.rangeLabel)}&#10;${wk.pj} PJ: ${wk.g} G, ${wk.e} E, ${wk.p} P · ${wk.pct}% victorias</title></rect>`;
  });
  const line = weeklySeriesState.pct && pts.length>1 ? `<path class="pct-line" d="${pts.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join(' ')}" stroke-linejoin="round"/>` : '';
  const dots = weeklySeriesState.pct ? pts.map(p=>`<circle class="pct-dot" cx="${p[0]}" cy="${p[1]}" r="3.5"/>`).join('') : '';

  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Partidos ganados, empatados y perdidos por semana">${grid}${bars}${line}${dots}${labels}${hits}</svg>`;

  body.innerHTML = detail.map(wk=>`<tr>
    <td><strong>${escapeHtml(wk.label)}</strong>${wk.isAuto?' <span title="Esta semana aún no está definida en Gestión" style="color:var(--loss)">⚠</span>':''}</td>
    <td>${escapeHtml(wk.rangeLabel)}</td>
    <td class="num">${wk.pj}</td><td class="num w-num">${wk.g}</td><td class="num d-num">${wk.e}</td><td class="num l-num">${wk.p}</td>
    <td><span class="pctbar"><i><b style="width:${wk.pct}%"></b></i>${wk.pct}%</span></td></tr>`).join('');
}

/* ---------- bitácora ---------- */
const DOMESTIC_TOURNAMENTS=[/la liga/i,/copa del rey/i,/supercopa de españa/i,/liga bbva mx/i,/liga mx/i,/saudi professional league/i,/nfl temporada/i];
function isDomesticMatch(m){
  if(m.internacional===true) return false;
  const scope=String(m.scope||m.alcance||'').toUpperCase();
  if(scope==='LOCAL') return true;
  if(scope==='INTERNACIONAL') return false;
  return DOMESTIC_TOURNAMENTS.some(rx=>rx.test(m.torneo||''));
}
function populateCompetitionFilter(){
  const sel=document.getElementById('competitionFilter'), current=sel.value||'all';
  const names=[...new Set(matches.filter(isFootballMatch).map(m=>m.torneo).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  sel.innerHTML='<option value="all">Todas las competiciones</option>'+names.map(n=>`<option value="${escapeAttr(n)}">${escapeHtml(n)}</option>`).join('');
  sel.value=names.includes(current)?current:'all';
}
function renderChips(){
  const el=document.getElementById('chipbar');
  const chip=(id,label,color)=>`<button type="button" class="chip${activeTeamFilter===id?' is-active':''}" data-team="${escapeAttr(id)}"><i style="--c:${escapeAttr(color)}"></i>${escapeHtml(label)}</button>`;
  el.innerHTML = chip('all','Todos',  'var(--ink)') + futbolTeamIds.map(id=>chip(id,TEAMS[id].name,teamStripe(TEAMS[id]))).join('');
  el.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{
    activeTeamFilter=c.dataset.team; matchTableVisible=PAGE_SIZE; renderTeams(); renderChips(); renderMatchTable();
  }));
}
function ledgerTeamCell(name,origin,m){
  const followed = name===TEAMS[m.team]?.name;
  const sub = m.internacional===true && origin && origin!=='—' ? originLabel(origin,m.torneo) : '';
  return mteamHtml({name, logoHtml: followed?teamLogoSlot(m.team):rivalLogoSlot(name), sub, me:followed});
}
function renderMatchTable(){
  const body=document.getElementById('matchTableBody');
  const q=(document.getElementById('searchInput').value||'').trim().toLowerCase();
  const sortMode=document.getElementById('sortSelect').value;
  const comp=document.getElementById('competitionFilter').value;
  const scope=document.getElementById('scopeFilter').value;
  const titleMode=document.getElementById('titleFilter').value;

  const rows=matches.filter(m=>isFootballMatch(m)
    && (activeTeamFilter==='all'||m.team===activeTeamFilter)
    && (comp==='all'||m.torneo===comp)
    && (scope==='all'||(scope==='domestic'?isDomesticMatch(m):!isDomesticMatch(m)))
    && (titleMode==='all'||isTitleMatchRecord(m))
    && (!q||`${m.localName} ${m.visitName} ${m.originLocal} ${m.originVisit} ${m.estadio||''} ${m.ciudad||''} ${m.torneo} ${m.fase}`.toLowerCase().includes(q))
  ).sort(sortMode==='recent'?byDateDesc:byDateAsc);

  const total=matches.filter(isFootballMatch).length;
  document.getElementById('ledgerTotal').textContent=`${total} partidos de fútbol registrados`;
  const countEl=document.getElementById('matchTableCount'), moreBtn=document.getElementById('verMasBtn');
  if(!rows.length){
    body.innerHTML='<tr><td class="empty" colspan="8">No hay partidos con estos filtros.</td></tr>';
    countEl.textContent=''; moreBtn.classList.add('hidden'); return;
  }
  const visible=rows.slice(0,matchTableVisible);
  countEl.textContent=`Mostrando ${visible.length} de ${rows.length} partidos`;
  moreBtn.classList.toggle('hidden',visible.length>=rows.length);

  body.innerHTML=visible.map(m=>`<tr>
    <td><span class="dot-team" style="--c:${escapeAttr(teamStripe(TEAMS[m.team]||{}))}" title="${escapeAttr(TEAMS[m.team]?.name||'')}"></span></td>
    <td class="date">${escapeHtml(m.dia)} ${escapeHtml(MONTHS[m.mes]||'')}</td>
    <td>${ledgerTeamCell(m.localName,m.originLocal,m)}</td>
    <td class="score">${formatMatchScore(m)}</td>
    <td>${ledgerTeamCell(m.visitName,m.originVisit,m)}</td>
    <td><div class="stack"><strong>${escapeHtml(m.estadio||'—')}</strong>${m.ciudad?`<small>${escapeHtml(m.ciudad)}</small>`:''}</div></td>
    <td><div class="stack"><strong>${escapeHtml(m.torneo||'—')}</strong><small>${escapeHtml(m.fase||'—')}</small></div></td>
    <td><span class="res res--${resClass(m.resultado)}">${resLabel(m.resultado)}</span></td></tr>`).join('');
}
function renderNflTable(){
  const body=document.getElementById('nflTableBody');
  const rows=matches.filter(isNflMatch).sort(byDateDesc);
  if(!rows.length){ body.innerHTML='<tr><td class="empty" colspan="7">No hay partidos de NFL registrados todavía.</td></tr>'; return; }
  body.innerHTML=rows.map(m=>{
    const away=m.venueSide==='away';
    const origin=away?m.originLocal:m.originVisit;
    return `<tr>
      <td>${teamLogoSlot(m.team)}</td>
      <td class="date">${m.dia} ${MONTHS[m.mes]}</td>
      <td>${rivalCellHtml(m.rival, m.internacional===true?originLabel(origin,m.torneo):'')}</td>
      <td class="${venueLabel(m)==='—'?'muted':''}">${escapeHtml(venueLabel(m))}</td>
      <td>${escapeHtml(m.torneo)}${m.fase?' · '+escapeHtml(m.fase):''}</td>
      <td class="score">${formatMatchScore(m)}</td>
      <td><span class="res res--${resClass(m.resultado)}">${resLabel(m.resultado)}</span></td></tr>`;
  }).join('');
}

/* ---------- navegación ---------- */
function initReveal(){
  if(!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-reveal');
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } }),{rootMargin:'0px 0px -8% 0px',threshold:0.04});
  document.querySelectorAll('.section').forEach(s=>io.observe(s));
}
function initScrollSpy(){
  const links=[...document.querySelectorAll('#mainNav a[href^="#"]')];
  const map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ links.forEach(l=>l.classList.remove('is-active')); map.get(e.target.id)?.classList.add('is-active'); } });
  },{rootMargin:'-45% 0px -50% 0px'});
  map.forEach((_,id)=>{ const s=document.getElementById(id); if(s) io.observe(s); });
}

function renderAll(){
  populateCompetitionFilter();
  renderHero(); renderTeams(); renderStats(); renderHonours(); renderWeekly(); renderChips(); renderMatchTable(); renderNflTable();
  const src=document.getElementById('dataSource');
  if(src) src.textContent = matchDataSource==='supabase' ? 'Datos en vivo desde la base de datos' : 'Mostrando copia local (sin conexión a la base de datos)';
}

async function init(){
  initTheme();
  await loadMatches();
  renderAll();
  const rerender=()=>{ matchTableVisible=PAGE_SIZE; renderMatchTable(); };
  ['searchInput'].forEach(id=>document.getElementById(id).addEventListener('input',rerender));
  ['sortSelect','competitionFilter','scopeFilter','titleFilter'].forEach(id=>document.getElementById(id).addEventListener('change',rerender));
  document.getElementById('clearFiltersBtn').addEventListener('click',()=>{
    document.getElementById('searchInput').value='';
    ['competitionFilter','scopeFilter','titleFilter'].forEach(id=>document.getElementById(id).value='all');
    document.getElementById('sortSelect').value='recent';
    activeTeamFilter='all'; matchTableVisible=PAGE_SIZE; renderTeams(); renderChips(); renderMatchTable();
  });
  document.getElementById('verMasBtn').addEventListener('click',()=>{ matchTableVisible+=PAGE_SIZE; renderMatchTable(); });
  document.getElementById('weeklyMoreBtn').addEventListener('click',()=>{ weeklyVisible+=WEEK_PAGE_SIZE; renderWeekly(); });
  document.getElementById('honoursMoreBtn').addEventListener('click',()=>{ honoursExpanded=!honoursExpanded; renderHonours(); });
  document.querySelectorAll('#weeklyToggles [data-series]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const k=btn.dataset.series; weeklySeriesState[k]=!weeklySeriesState[k];
      btn.classList.toggle('is-off',!weeklySeriesState[k]); renderWeekly();
    });
  });
  initScrollSpy();
  initReveal();
}
init();
