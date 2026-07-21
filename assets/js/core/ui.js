/* Shared presentation helpers used by both pages. */
const escapeHtml = window.SportsCore?.escapeHtml || ((value='') => String(value));
const escapeAttr = escapeHtml;
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=>t.classList.remove('show'), 2200);
}

function normalizeKey(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\bfc\b|\bsc\b|\bclub\b/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}

function initials(value){
  const parts=String(value||'?').trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0,2).map(p=>p[0]).join('')||'?').toUpperCase();
}

function rivalLogoHtml(name){
  const safeName = escapeHtml(name);
  const safeInitials = escapeHtml(initials(name));
  const logo = resolveRivalLogo(name);
  if(logo){
    return `<span class="rival-cell"><span class="rival-logo"><img src="${escapeAttr(logo)}" alt="${safeName}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="rival-fallback" hidden>${safeInitials}</span></span><span>${safeName}</span></span>`;
  }
  return `<span class="rival-cell"><span class="rival-logo"><span class="rival-fallback">${safeInitials}</span></span><span>${safeName}</span></span>`;
}

function tournamentSimilarity(a,b){
  const clean=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/professional/g,'pro').replace(/uefa|fifa|bbva|2025|2026|clausura|apertura/g,' ')
    .replace(/[^a-z0-9]+/g,' ').trim();
  const aa=clean(a), bb=clean(b);
  if(!aa||!bb) return 0;
  if(aa.includes(bb)||bb.includes(aa)) return 10;
  const A=new Set(aa.split(/\s+/).filter(x=>x.length>1));
  const B=new Set(bb.split(/\s+/).filter(x=>x.length>1));
  let score=0; A.forEach(x=>{if(B.has(x)) score++;});
  return score;
}

function findTitleMatch(team,tournament){
  const targetId=normalizeKey(tournament.name);
  const terms=[tournament.name, ...(tournament.matchTerms||[])];
  const finals=matches.filter(m=>m.team===team && (m.titleDecision || /gran\s+final/i.test(m.fase||'') || /^final\b/i.test(m.fase||'')));
  return finals.filter(m=>(m.tournamentId && normalizeKey(m.tournamentId)===targetId) || terms.some(term=>tournamentSimilarity(term,m.torneo)>=2))
    .sort((a,b)=>(b.mes*100+b.dia)-(a.mes*100+a.dia))[0] || null;
}

function effectiveTournamentStatus(team,tournament){
  const explicit=(titleOverrides[team]||{})[tournament.name];
  if(explicit) return explicit;
  const finalMatch=findTitleMatch(team,tournament);
  if(finalMatch) return finalMatch.resultado==='Ganado'?'ganado':'perdido';
  return tournament.status || 'en_curso';
}

function miniLogoHtml(id){
  const teamName = TEAMS[id]?.name || id;
  const logo = resolveTeamLogo(id, teamName);
  const fallback = escapeHtml(initials(teamName));
  if(logo){
    return `<div class="mini-logo-slot"><img src="${escapeAttr(logo)}" alt="${escapeAttr(teamName)}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="slot-placeholder" hidden>${fallback}</span></div>`;
  }
  return `<div class="mini-logo-slot"><span class="slot-placeholder">${fallback}</span></div>`;
}

function badgeHtml(id){
  const t = TEAMS[id];
  const logo = resolveTeamLogo(id, TEAMS[id]?.name);
  if(logo){
    return `<div class="team-badge" style="--team-color:${escapeAttr(t.color)}; --team-fg:${escapeAttr(t.accent)}">
      <img src="${escapeAttr(logo)}" alt="${escapeAttr(t.name)}" onload="this.parentElement.querySelector('.add-logo-hint').style.display='none';" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'; this.parentElement.querySelector('.add-logo-hint').style.display='flex';">
      <span class="badge-fallback" style="display:none">${escapeHtml(t.name.slice(0,1))}</span>
      
    </div>`;
  }
  return `<div class="team-badge" style="--team-color:${escapeAttr(t.color)}; --team-fg:${escapeAttr(t.accent)}">
    <span class="badge-fallback" style="display:flex">${escapeHtml(t.name.slice(0,1))}</span>
    
  </div>`;
}

function teamCardHtml(id){
  const t = TEAMS[id];
  const s = statsForTeam(id);
  const last8 = s.rows.slice(-8).reverse();
  const pctG = s.pj ? Math.round(s.pg / s.pj * 100) : 0;
  const pctE = s.pj ? Math.round(s.pe / s.pj * 100) : 0;
  const pctP = s.pj ? Math.round(s.pp / s.pj * 100) : 0;
  const honours = titleCountsForTeam(id);
  return `
    <div class="team-card team-card-v16" style="--team-color:${escapeAttr(t.color)}" data-team="${escapeAttr(id)}">
      ${resolveTeamLogo(id, TEAMS[id]?.name) ? `<img class="watermark" src="${escapeAttr(resolveTeamLogo(id, TEAMS[id]?.name))}" alt="" onerror="this.style.display='none'">` : ``}

      <div class="team-card-v16-head">
        <div class="team-card-identity">
          ${badgeHtml(id)}
          <div class="team-v16-title">
            <div class="team-name">${escapeHtml(t.name)} <span class="team-flag">${escapeHtml(TEAM_FLAG[id]||'')}</span>${t.sport==='nfl'?'<span class="nfl-flag">NFL</span>':''}</div>
            <div class="team-meta">${escapeHtml(t.type)} · ${escapeHtml(t.country)}</div>
          </div>
        </div>

        <div class="team-v16-record" aria-label="Resumen de resultados">
          <div class="record-pj"><strong>${s.pj}</strong><span>PJ</span></div>
          <div class="record-line win"><strong>${s.pg}</strong><span>G</span><small>${pctG}%</small></div>
          <div class="record-line draw"><strong>${s.pe}</strong><span>E</span><small>${pctE}%</small></div>
          <div class="record-line loss"><strong>${s.pp}</strong><span>P</span><small>${pctP}%</small></div>
        </div>
      </div>

      <div class="team-v16-core">
        <div class="gf-gc-row team-v16-goals">
          <span>${t.sport==='nfl'?'PF':'GF'} <b>${s.gf}</b></span>
          <span>${t.sport==='nfl'?'PC':'GC'} <b>${s.gc}</b></span>
          <span>DG <b>${s.diff>=0?'+':''}${s.diff}</b></span>
        </div>

        <div class="pct-track" aria-label="Distribución de resultados">
          <span title="Ganados ${escapeAttr(pctG)}%" style="width:${pctG}%; background:var(--win)"></span>
          <span title="Empatados ${pctE}%" style="width:${pctE}%; background:var(--draw)"></span>
          <span title="Perdidos ${pctP}%" style="width:${pctP}%; background:var(--loss)"></span>
        </div>

        <div class="team-honours">
          <span>🏆 <b>${honours.titles}</b><small>Títulos</small></span>
          <span>🥈 <b>${honours.runners}</b><small>Subcampeonatos</small></span>
        </div>

        <div class="team-v16-form-label">Forma reciente · últimos 8</div>
        <div class="form-strip">
          ${last8.length ? last8.map(m=>`<span class="form-pip ${resClass(m.resultado)}" title="${escapeAttr(m.rival)} · ${escapeAttr(resLabel(m.resultado))}">${m.resultado==='Ganado'?'G':m.resultado==='Perdido'?'P':'E'}</span>`).join('') : '<span class="muted" style="font-size:11px;">Sin partidos aún</span>'}
        </div>

        <div class="team-v16-eff">Efectividad <b>${s.pct}%</b></div>
      </div>
    </div>
  `;
}

function titleTeamLogoHtml(id, icon){
  const t=TEAMS[id];
  const logo=resolveTeamLogo(id, TEAMS[id]?.name);
  if(logo){
    return `<div class="title-team-logo" style="--team-color:${escapeAttr(t.color)};--team-fg:${t.accent}"><img src="${escapeAttr(logo)}" alt="${escapeAttr(t.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span class="logo-fallback" style="display:none">${escapeHtml(t.name.slice(0,1))}</span><span class="trophy-mini">${icon}</span></div>`;
  }
  return `<div class="title-team-logo" style="--team-color:${escapeAttr(t.color)};--team-fg:${t.accent}"><span class="logo-fallback">${escapeHtml(t.name.slice(0,1))}</span><span class="trophy-mini">${icon}</span></div>`;
}

function applyTheme(theme){
  document.documentElement.dataset.theme=theme;
  localStorage.setItem('ratiosports_theme',theme);
  const dark=theme==='dark';
  document.getElementById('themeIcon').textContent=dark?'☀️':'🌙';
  document.getElementById('themeLabel').textContent=dark?'Modo claro':'Modo oscuro';
  applyBackgroundPhoto();
}

function toggleTheme(){ applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'); }

function applyBackgroundPhoto(){
  if(!BACKGROUND_IMAGE) return;
  const layer = document.getElementById('bgPhotoLayer');
  const img = new Image();
  img.onload = ()=>{
    const dark=document.documentElement.dataset.theme==='dark';
    layer.style.backgroundImage = dark ? `linear-gradient(rgba(15,18,16,0.38), rgba(15,18,16,0.52)), url('${BACKGROUND_IMAGE}')` : `linear-gradient(rgba(250,246,238,0.24), rgba(250,246,238,0.38)), url('${BACKGROUND_IMAGE}')`;
    layer.classList.add('active');
  };
  img.onerror = ()=>{ /* archivo aún no existe: nos quedamos con el fondo claro + balón */ };
  img.src = BACKGROUND_IMAGE;
}
