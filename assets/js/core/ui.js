/* Shared presentation helpers used by both pages. */

// Iconos en un solo color (SVG con fill="currentColor"), en vez de emoji
// multicolor. El color lo controla la clase .mono-icon en CSS (una sola
// variable, así todos los iconos usan el mismo tono).
const ICONS = {
  trophy: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M6 3h12a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1c0 3.3-2.2 5.8-5 6.4A6.3 6.3 0 0 1 13 15.8V18h3v2H8v-2h3v-2.2a6.3 6.3 0 0 1-4-3.4C4.2 11.8 2 9.3 2 6a1 1 0 0 1 1-1h2V4a1 1 0 0 1 1-1zm-1 4H4c.2 1.6 1.3 2.8 2.7 3.3A8.7 8.7 0 0 1 5 7zm14 0a8.7 8.7 0 0 1-1.7 3.3C18.7 9.8 19.8 8.6 20 7h-1z"/></svg>',
  medal: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M8.5 2h2l1.5 5-2.7 2-2.3-1.6z" opacity=".55"/><path d="M15.5 2h-2l-1.5 5 2.7 2 2.3-1.6z" opacity=".55"/><circle cx="12" cy="15" r="6.5"/><circle cx="12" cy="15" r="3.4" fill="var(--panel,#fff)"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 2l7 3v5.5c0 5-3 8.6-7 10.5-4-1.9-7-5.5-7-10.5V5z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9.2"/><ellipse cx="12" cy="12" rx="3.8" ry="9.2"/><line x1="2.8" y1="12" x2="21.2" y2="12"/></svg>',
  football: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><circle cx="12" cy="12" r="9.2"/></svg>',
  flag: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4h13l-3 4 3 4H5"/></svg>',
  ball: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9.2"/><path d="M12 6.5l3.4 2.5-1.3 4-4.2 0-1.3-4z" fill="currentColor" stroke="none"/><path d="M12 6.5V3.3M15.4 9l2.8-1.9M13.9 12.5l2.6 3.6M10.1 12.5l-2.6 3.6M8.6 9 5.8 7.1"/></svg>',
};
function icon(name){ return `<span class="mono-icon">${ICONS[name]||''}</span>`; }

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
  // El catálogo solo define nombre/logo/aliases. El estado competitivo es
  // dinámico y debe salir de matches, nunca de un status hardcodeado.
  const finalMatch=findTitleMatch(team,tournament);
  if(finalMatch){
    if(finalMatch.titleStatus) return finalMatch.titleStatus;
    return finalMatch.resultado==='Ganado'?'ganado':'perdido';
  }
  return 'en_curso';
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
            <div class="team-name">${escapeHtml(t.name)} <span class="team-flag">${TEAM_FLAG[id]||''}</span>${t.sport==='nfl'?'<span class="nfl-flag">NFL</span>':''}</div>
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
          <span>${icon('trophy')} <b>${honours.titles}</b><small>Títulos</small></span>
          <span>${icon('medal')} <b>${honours.runners}</b><small>Subcampeonatos</small></span>
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

// Estilo visual de la app: "ticket" (boleto de partido, default) o "led" (marcador de estadio).
// Es independiente del claro/oscuro: cambia tipografías y paleta, no solo colores.
function applyStyle(style){
  document.documentElement.dataset.style = style;
  localStorage.setItem('ratiosports_style', style);
  const led = style==='led';
  const icon = document.getElementById('styleIcon');
  const label = document.getElementById('styleLabel');
  if(icon) icon.textContent = led ? '🎟️' : '📺';
  if(label) label.textContent = led ? 'Boleto de partido' : 'Marcador LED';
}
function toggleStyle(){ applyStyle(document.documentElement.dataset.style==='led'?'ticket':'led'); }

function applyBackgroundPhoto(){
  if(!BACKGROUND_IMAGE) return;
  const layer = document.getElementById('bgPhotoLayer');
  const img = new Image();
  img.onload = ()=>{
    const dark=document.documentElement.dataset.theme==='dark';
    layer.style.backgroundImage = dark ? `linear-gradient(rgba(15,18,16,0.18), rgba(15,18,16,0.30)), url('${BACKGROUND_IMAGE}')` : `linear-gradient(rgba(250,246,238,0.10), rgba(250,246,238,0.22)), url('${BACKGROUND_IMAGE}')`;
    layer.classList.add('active');
  };
  img.onerror = ()=>{ /* archivo aún no existe: nos quedamos con el fondo claro + balón */ };
  img.src = BACKGROUND_IMAGE;
}
