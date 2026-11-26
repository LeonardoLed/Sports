/* Helpers de presentación compartidos por las dos páginas.
   No calculan estadísticas: eso vive en core/state.js. */

// Iconos de un solo color (SVG con currentColor) para que hereden el tono del contexto.
const ICONS = {
  trophy: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M6 3h12a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1c0 3.3-2.2 5.8-5 6.4A6.3 6.3 0 0 1 13 15.8V18h3v2H8v-2h3v-2.2a6.3 6.3 0 0 1-4-3.4C4.2 11.8 2 9.3 2 6a1 1 0 0 1 1-1h2V4a1 1 0 0 1 1-1zm-1 4H4c.2 1.6 1.3 2.8 2.7 3.3A8.7 8.7 0 0 1 5 7zm14 0a8.7 8.7 0 0 1-1.7 3.3C18.7 9.8 19.8 8.6 20 7h-1z"/></svg>',
  medal: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M8.5 2h2l1.5 5-2.7 2-2.3-1.6z" opacity=".55"/><path d="M15.5 2h-2l-1.5 5 2.7 2 2.3-1.6z" opacity=".55"/><circle cx="12" cy="15" r="6.5"/><circle cx="12" cy="15" r="3.4" fill="var(--surface,#fff)"/></svg>',
  sun: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/></svg>',
};
function icon(name){ return `<span class="mono-icon">${ICONS[name]||''}</span>`; }

function toast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=>t.classList.remove('show'), 2600);
}

function normalizeKey(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\bfc\b|\bsc\b|\bclub\b/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}
function initials(value){
  const parts=String(value||'?').trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0,2).map(p=>p[0]).join('')||'?').toUpperCase();
}

/* ---------- logos ---------- */
function logoImgHtml(src,name,cls){
  const fallback=escapeHtml(initials(name));
  if(!src) return `<span class="${cls}"><span>${fallback}</span></span>`;
  return `<span class="${cls}"><img src="${escapeAttr(src)}" alt="${escapeAttr(name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>${fallback}</span></span>`;
}
function rivalLogoSlot(name){ return logoImgHtml(resolveRivalLogo(name),name,'mteam__logo'); }
function teamLogoSlot(id){ const n=TEAMS[id]?.name||id; return logoImgHtml(resolveTeamLogo(id,n),n,'mteam__logo'); }

// Equipo o rival con su logo, en una línea. `sub` es texto secundario opcional.
function mteamHtml({name,logoHtml,sub='',me=false}){
  return `<div class="mteam${me?' is-me':''}">${logoHtml}<div><strong>${escapeHtml(name||'—')}</strong>${sub?`<small>${escapeHtml(sub)}</small>`:''}</div></div>`;
}
function rivalCellHtml(name,sub=''){ return mteamHtml({name,logoHtml:rivalLogoSlot(name),sub}); }

function tournamentLogoFor(name){
  const map=window.TOURNAMENT_LOGOS||{};
  return map[name] || (/^UEFA Champions League/i.test(name)?'logos/torneos/champions_league.png':resolveTournamentLogo(name));
}

/* Los colores de equipo muy claros (Real Madrid es blanco) no se ven como borde
   sobre fondo claro: en ese caso se usa el color de acento del equipo. */
function teamStripe(t){
  const hex=String(t.color||'#999').replace('#','');
  const n=parseInt(hex.length===3?hex.replace(/(.)/g,'$1$1'):hex,16);
  const lum=(0.299*((n>>16)&255)+0.587*((n>>8)&255)+0.114*(n&255))/255;
  return lum>0.82 ? (t.accent||'#12161c') : t.color;
}

/* ---------- marcador ---------- */
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
  let out=`${left} – ${right}`;
  const notes=[];
  if(m.penaltyLocal!==null && m.penaltyLocal!==undefined && m.penaltyVisit!==null && m.penaltyVisit!==undefined) notes.push(`pen. ${m.penaltyLocal}-${m.penaltyVisit}`);
  if(m.extraTime) notes.push('t. extra');
  if(notes.length) out += `<small>${notes.join(' · ')}</small>`;
  return out;
}

/* ---------- tarjeta de equipo ---------- */
function teamLogoBig(id){
  const t=TEAMS[id], logo=resolveTeamLogo(id,t.name);
  const fb=escapeHtml(t.name.slice(0,1));
  return `<div class="team__logo"><img src="${escapeAttr(logo)}" alt="${escapeAttr(t.name)}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>${fb}</span></div>`;
}
function teamCardHtml(id,selected=false){
  const t=TEAMS[id], s=statsForTeam(id), h=titleCountsForTeam(id);
  const last8=s.rows.slice(-8).reverse();
  const pg=s.pj?s.pg/s.pj*100:0, pe=s.pj?s.pe/s.pj*100:0, pp=s.pj?s.pp/s.pj*100:0;
  const pf=t.sport==='nfl'?'PF':'GF', pc=t.sport==='nfl'?'PC':'GC';
  const honours=[
    h.titles?`<span>${icon('trophy')}<b>${h.titles}</b> ${h.titles===1?'título':'títulos'}</span>`:'',
    h.runners?`<span>${icon('medal')}<b>${h.runners}</b> ${h.runners===1?'subcampeonato':'subcampeonatos'}</span>`:'',
    h.eliminated?`<span><b>${h.eliminated}</b> ${h.eliminated===1?'torneo perdido':'torneos perdidos'}</span>`:'',
    h.inProgress?`<span><b>${h.inProgress}</b> en juego</span>`:'',
  ].filter(Boolean).join('');
  return `<article class="team${selected?' is-selected':''}" style="--team:${escapeAttr(teamStripe(t))};--team-fg:${escapeAttr(t.accent||'#fff')}" data-team="${escapeAttr(id)}" tabindex="0" role="button" aria-label="${escapeAttr(t.name)}">
    <div class="team__head">
      ${teamLogoBig(id)}
      <div>
        <div class="team__name">${escapeHtml(t.name)}${t.sport==='nfl'?'<span class="tag">NFL</span>':''}</div>
        <div class="team__meta">${TEAM_FLAG[id]||''}<span>${escapeHtml(t.type)} · ${escapeHtml(t.country)}</span></div>
      </div>
    </div>
    <div class="team__record" aria-label="Partidos jugados, ganados, empatados y perdidos">
      <div><b>${s.pj}</b><span>PJ</span></div>
      <div class="w"><b>${s.pg}</b><span>G</span></div>
      <div class="d"><b>${s.pe}</b><span>E</span></div>
      <div class="l"><b>${s.pp}</b><span>P</span></div>
    </div>
    <div class="team__bar" aria-hidden="true"><i class="w" style="width:${pg}%"></i><i class="d" style="width:${pe}%"></i><i class="l" style="width:${pp}%"></i></div>
    <div class="team__facts">
      <span>${pf} <b>${s.gf}</b></span>
      <span>${pc} <b>${s.gc}</b></span>
      <span>Dif. <b>${s.diff>=0?'+':''}${s.diff}</b></span>
      ${s.isFootball?`<span>Porterías a cero <b>${s.cleanSheets}</b></span>`:''}
      <span>Victorias <b>${s.pct}%</b></span>
    </div>
    <div class="team__form">
      <span class="team__form-label">Últimos ${last8.length||8}</span>
      ${last8.length?last8.map(m=>`<span class="pip pip--${resClass(m.resultado)}" title="${escapeAttr(m.rival)} · ${escapeAttr(resLabel(m.resultado))}">${m.resultado==='Ganado'?'G':m.resultado==='Perdido'?'P':'E'}</span>`).join(''):'<span class="muted" style="font-size:12px">Sin partidos aún</span>'}
    </div>
    ${honours?`<div class="team__honours">${honours}</div>`:''}
  </article>`;
}

/* ---------- tema: noche (CR7 oscuro) · gris (claro) · color ---------- */
const THEMES=['noche','gris','color'];
const LEGACY_THEMES={dark:'noche',light:'gris'};
function applyTheme(theme){
  theme=LEGACY_THEMES[theme]||theme;
  if(!THEMES.includes(theme)) theme='noche';
  document.documentElement.dataset.theme=theme;
  try{ localStorage.setItem('ratiosports_theme',theme); }catch(e){}
  document.querySelectorAll('[data-theme-btn]').forEach(b=>{
    const on=b.dataset.themeBtn===theme;
    b.classList.toggle('is-active',on); b.setAttribute('aria-pressed',on?'true':'false');
  });
}
function initTheme(){
  let saved=null;
  try{ saved=localStorage.getItem('ratiosports_theme'); }catch(e){}
  applyTheme(saved||document.documentElement.dataset.theme||'noche');
  document.querySelectorAll('[data-theme-btn]').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.themeBtn)));
}
