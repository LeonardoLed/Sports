/* Rutas de imágenes y torneos: viven en logos-config.js (archivo aparte).
   Si ese archivo no está presente (p.ej. en la vista previa del chat),
   caemos en objetos vacíos y el dashboard usa los respaldos normales. */
const TEAM_LOGOS = window.TEAM_LOGOS || {};
const RIVAL_LOGOS = window.RIVAL_LOGOS || {};
const resolveRivalLogo = window.resolveRivalLogo || ((name)=>RIVAL_LOGOS[name] || RIVAL_LOGOS[normalizeKey(name)] || `logos/rivales/${normalizeKey(name)}.png`);
const resolveTournamentLogo = window.resolveTournamentLogo || ((name)=>`logos/torneos/${normalizeKey(name)}.png`);
const resolveTeamLogo = window.resolveTeamLogo || ((id,name)=>TEAM_LOGOS[id] || `logos/equipos/${normalizeKey(name||id)}.png`);
const TOURNAMENTS_CONFIG = window.TOURNAMENTS || {};
const BACKGROUND_IMAGE = window.BACKGROUND_IMAGE || '';

// Bandera del país al que pertenece cada equipo — SVG dibujado a mano
// (no depende de fuentes emoji, así que se ve igual en cualquier sistema).
const FLAG_SVG = {
  es: `<svg viewBox="0 0 30 20" width="22" height="15"><rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/></svg>`,
  mx: `<svg viewBox="0 0 30 20" width="22" height="15"><rect width="10" height="20" fill="#006341"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce1126"/><circle cx="15" cy="10" r="2.4" fill="#8b5a2b"/></svg>`,
  sa: `<svg viewBox="0 0 30 20" width="22" height="15"><rect width="30" height="20" fill="#0a5c36"/><rect x="6" y="8.5" width="14" height="1.6" fill="#fff"/><circle cx="22" cy="9.3" r="1.4" fill="#fff"/></svg>`,
  pt: `<svg viewBox="0 0 30 20" width="22" height="15"><rect width="30" height="20" fill="#ff0000"/><rect width="12" height="20" fill="#006600"/><circle cx="12" cy="10" r="4" fill="#ffcc00" stroke="#ff0000" stroke-width="0.6"/></svg>`,
  us: `<svg viewBox="0 0 30 20" width="22" height="15">
        <rect width="30" height="20" fill="#fff"/>
        ${[0,1,2,3,4,5,6].map(i=>`<rect y="${i*20/13}" width="30" height="${20/13}" fill="#b22234"/>`).join('')}
        <rect width="14" height="10.8" fill="#3c3b6e"/>
      </svg>`,
};
const TEAM_FLAG = {
  real_madrid: FLAG_SVG.es,
  pumas: FLAG_SVG.mx,
  al_nassr: FLAG_SVG.sa,
  sel_mex: FLAG_SVG.mx,
  sel_por: FLAG_SVG.pt,
  cowboys: FLAG_SVG.us,
};

const STORAGE_SCHEMA_VERSION = 3;
const STORAGE_KEY = 'ratiosports:data:v2';
const LEGACY_STORAGE_KEYS = ['ratiosports_matches_v13_fixed','ratiosports_matches_v5_excel'];
const TITLES_STORAGE_KEY = 'ratiosports_title_status_v1';
const MONTHS = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const CUM_DAYS = [0,31,59,90,120,151,181,212,243,273,304,334];

/* =========================================================
   SEMANAS DEPORTIVAS — no son semanas de calendario de 7 días.
   Son rangos de fechas irregulares definidos a mano (igual que en
   el Excel fuente: RatioSports.xlsx), agrupando partidos entre
   pausas/fechas FIFA/descansos reales, no cada 7 días exactos.
   Esta lista es el punto de partida (extraída del Excel) y es
   100% editable desde la pestaña "Semanas" en partidos.html —
   se puede agregar, editar o borrar una semana en cualquier momento.
   ========================================================= */
const DEFAULT_WEEK_DEFS = [
  {id:"w1", label:"Semana 1", startDay:1, startMonth:1, endDay:11, endMonth:1},
  {id:"w2", label:"Semana 2", startDay:12, startMonth:1, endDay:18, endMonth:1},
  {id:"w3", label:"Semana 3", startDay:19, startMonth:1, endDay:31, endMonth:1},
  {id:"w4", label:"Semana 4", startDay:1, startMonth:2, endDay:8, endMonth:2},
  {id:"w5", label:"Semana 5", startDay:9, startMonth:2, endDay:15, endMonth:2},
  {id:"w6", label:"Semana 6", startDay:16, startMonth:2, endDay:22, endMonth:2},
  {id:"w7", label:"Semana 7", startDay:23, startMonth:2, endDay:28, endMonth:2},
  {id:"w8", label:"Semana 8", startDay:1, startMonth:3, endDay:8, endMonth:3},
  {id:"w9", label:"Semana 9", startDay:9, startMonth:3, endDay:15, endMonth:3},
  {id:"w10", label:"Semana 10", startDay:16, startMonth:3, endDay:22, endMonth:3},
  {id:"w11", label:"Semana 11", startDay:23, startMonth:3, endDay:31, endMonth:3},
  {id:"w12", label:"Semana 12", startDay:1, startMonth:4, endDay:12, endMonth:4},
  {id:"w13", label:"Semana 13", startDay:13, startMonth:4, endDay:19, endMonth:4},
  {id:"w14", label:"Semana 14", startDay:20, startMonth:4, endDay:30, endMonth:4},
  {id:"w15", label:"Semana 15", startDay:1, startMonth:5, endDay:10, endMonth:5},
  {id:"w16", label:"Semana 16", startDay:11, startMonth:5, endDay:17, endMonth:5},
  {id:"w17", label:"Semana 17", startDay:18, startMonth:5, endDay:31, endMonth:5},
  {id:"w18", label:"Semana 18", startDay:1, startMonth:6, endDay:14, endMonth:6},
  {id:"w19", label:"Semana 19", startDay:15, startMonth:6, endDay:21, endMonth:6},
  {id:"w20", label:"Semana 20", startDay:22, startMonth:6, endDay:31, endMonth:6},
  {id:"w21", label:"Semana 21", startDay:1, startMonth:7, endDay:19, endMonth:7},
  {id:"w22", label:"Semana 22", startDay:20, startMonth:7, endDay:31, endMonth:7},
];

/* =========================================================
   DATA LAYER — nothing here touches the DOM.
   - TEAMS / TEAM_ICON / SEED_MATCHES: static reference data bundled
     into this file (extracted once from your Excel).
   - `matches`: the live, mutable dataset. Loaded from persistent
     storage on first run (or seeded from SEED_MATCHES if empty),
     then saved back to storage on every add/delete.
   - `titleOverrides`: { equipo: { nombreTorneo: 'ganado'|'perdido' } }
     también persistido aparte — se llena cuando marcas en el
     formulario que un partido definió un título. No pisa lo que
     tengas en TOURNAMENTS dentro de logos-config.js: si un torneo
     no tiene override guardado, se usa el status por default de
     ese archivo.
   ========================================================= */
let matches = [];
let titleOverrides = {};
let weekDefs = [];
let activeTeamFilter = 'all';
const PAGE_SIZE = 15;
const WEEK_PAGE_SIZE = 5;
let matchTableVisible = PAGE_SIZE;
let weeklyVisible = WEEK_PAGE_SIZE;
let titlesExpanded = false;

const futbolTeamIds = Object.keys(TEAMS).filter(id=>TEAMS[id].sport==='futbol');
const nflTeamIds = Object.keys(TEAMS).filter(id=>TEAMS[id].sport==='nfl');

const storageAdapter = {
  async get(key){
    if(window.storage?.get){ const res = await window.storage.get(key, false); return res?.value ?? null; }
    return localStorage.getItem(key);
  },
  async set(key,value){
    if(window.storage?.set) return window.storage.set(key, value, false);
    localStorage.setItem(key,value);
  },
  async remove(key){
    if(window.storage?.delete) return window.storage.delete(key, false);
    localStorage.removeItem(key);
  }
};

function normalizedMatch(raw, seed){
  const m={...(seed||{}),...(raw||{})};
  const teamName=TEAMS[m.team]?.name||m.team||'Equipo';
  const away=m.venueSide==='away';
  m.rival=m.rival || (away?m.localName:m.visitName) || 'Rival';
  m.localName=away?(m.localName||m.rival):(m.localName||teamName);
  m.visitName=away?(m.visitName||teamName):(m.visitName||m.rival);
  m.gf=Number.isFinite(Number(m.gf))?Number(m.gf):0;
  m.gc=Number.isFinite(Number(m.gc))?Number(m.gc):0;
  m.localScore=away?m.gc:m.gf;
  m.visitScore=away?m.gf:m.gc;
  m.resultado=m.resultado||computeResult(m.gf,m.gc);
  m.originLocal=m.originLocal||'—';
  m.originVisit=m.originVisit||'—';
  m.torneo=m.torneo||'Sin competición';
  m.fase=m.fase||'—';
  m.estadio=m.estadio||'';
  m.ciudad=m.ciudad||'';
  return m;
}

function storageEnvelope(){
  return { schemaVersion:STORAGE_SCHEMA_VERSION, updatedAt:new Date().toISOString(), matches, titleOverrides, weekDefs };
}
function migrateStoredData(raw){
  if(Array.isArray(raw)) return {schemaVersion:1,matches:raw,titleOverrides:{},weekDefs:DEFAULT_WEEK_DEFS.map(w=>({...w}))};
  if(!raw || typeof raw!=='object') return {schemaVersion:STORAGE_SCHEMA_VERSION,matches:[],titleOverrides:{},weekDefs:DEFAULT_WEEK_DEFS.map(w=>({...w}))};
  if(raw.schemaVersion===STORAGE_SCHEMA_VERSION && Array.isArray(raw.weekDefs)) return raw;
  return {
    schemaVersion:STORAGE_SCHEMA_VERSION,
    matches:Array.isArray(raw.matches)?raw.matches:[],
    titleOverrides:raw.titleOverrides||{},
    // Si venimos de un esquema viejo (v2) que no tenía semanas deportivas,
    // sembramos las semanas por default extraídas del Excel — así nadie
    // pierde su bitácora al actualizar, solo se agregan las semanas.
    weekDefs:Array.isArray(raw.weekDefs) && raw.weekDefs.length ? raw.weekDefs : DEFAULT_WEEK_DEFS.map(w=>({...w})),
  };
}
function validateMatch(m){
  return !!m && typeof m==='object' && typeof m.team==='string' && Number.isFinite(Number(m.mes)) && Number.isFinite(Number(m.dia));
}
async function loadMatches(){
  const seedMap=Object.fromEntries(SEED_MATCHES.map(m=>[m.id,m]));
  let saved=null;
  try{
    const current=await storageAdapter.get(STORAGE_KEY);
    if(current) saved=migrateStoredData(JSON.parse(current));
    if(!saved){
      for(const key of LEGACY_STORAGE_KEYS){
        const legacy=await storageAdapter.get(key);
        if(legacy){ saved=migrateStoredData(JSON.parse(legacy)); break; }
      }
    }
  }catch(e){ console.warn('No se pudieron cargar datos guardados',e); }
  const storedMatches=(saved?.matches||[]).filter(validateMatch);
  const manual=storedMatches.filter(m=>m.userAdded && !seedMap[m.id]).map(m=>normalizedMatch(m,null));
  matches=SEED_MATCHES.map(m=>normalizedMatch(m,m)).concat(manual);
  titleOverrides=saved?.titleOverrides||{};
  weekDefs=(saved?.weekDefs && saved.weekDefs.length) ? saved.weekDefs : DEFAULT_WEEK_DEFS.map(w=>({...w}));
  await persist();
}
async function persist(){
  try{ await storageAdapter.set(STORAGE_KEY, JSON.stringify(storageEnvelope())); }
  catch(e){ console.error('storage error', e); }
}
async function loadTitleOverrides(){ return titleOverrides; }
async function persistTitleOverrides(){ return persist(); }
async function setTournamentStatus(team, torneoName, status){
  if(!torneoName) return;
  if(!titleOverrides[team]) titleOverrides[team] = {};
  titleOverrides[team][torneoName] = status;
  await persist();
}
function exportLedger(){
  const blob=new Blob([JSON.stringify(storageEnvelope(),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download=`ratio-sports-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
  URL.revokeObjectURL(url);
}
async function importLedgerFile(file){
  const parsed=migrateStoredData(JSON.parse(await file.text()));
  if(!Array.isArray(parsed.matches) || !parsed.matches.every(validateMatch)) throw new Error('El archivo no contiene una bitácora válida.');
  matches=parsed.matches.map(m=>normalizedMatch(m,null)); titleOverrides=parsed.titleOverrides||{};
  weekDefs=(parsed.weekDefs && parsed.weekDefs.length) ? parsed.weekDefs : DEFAULT_WEEK_DEFS.map(w=>({...w}));
  await persist();
}
// Junta el status por default (logos-config.js) con lo que el usuario
// haya capturado desde el formulario (titleOverrides), y agrega
// cualquier torneo nuevo que el usuario haya escrito y no estuviera
// en la config original.
function getTeamTournaments(team){
  const base = (TOURNAMENTS_CONFIG[team] || []).map(t=>({...t}));
  const seen = new Set(base.map(t=>normalizeKey(t.name)));
  matches.filter(m=>m.team===team && m.torneo && !/amistoso|preparación|fecha fifa/i.test(m.torneo)).forEach(m=>{
    const key=normalizeKey(m.torneo);
    if(!seen.has(key)){
      base.push({name:m.torneo, logo:'', status:'en_curso', matchTerms:[m.torneo]});
      seen.add(key);
    }
  });
  const overrides = titleOverrides[team] || {};
  base.forEach(t=>{ if(overrides[t.name]) t.status = overrides[t.name]; });
  Object.keys(overrides).forEach(name=>{
    if(!base.find(t=>t.name===name)) base.push({name,logo:'',status:overrides[name],matchTerms:[name]});
  });
  return base;
}

/* =========================================================
   LOGIC LAYER — pure functions, no DOM access.

   AUTOMATIZACIÓN: nada aquí se "llena a mano". statsForTeam() y
   buildWeeklyData() recalculan TODO desde cero cada vez que se
   llaman, leyendo directo del arreglo `matches` (el que vive en
   storage). No hay números guardados aparte ni que sincronizar:
   - Tarjetas de equipo -> statsForTeam(id) recorre `matches`,
     filtra por equipo y suma PJ/PG/PE/PP/GF/GC en el momento.
   - Stats por semana -> buildWeeklyData() recorre TODOS los
     partidos, calcula a qué semana del año cae cada uno
     (weekOfYear) y agrupa G/E/P por semana.
   Como renderAll() se llama después de cada alta/baja de un
   marcador (handleAdd / botón Eliminar), las tarjetas y la
   gráfica semanal quedan actualizadas solas — no hace falta
   tocar ningún otro lugar del código al agregar un partido.
   ========================================================= */
function resClass(r){ return r==='Ganado' ? 'g' : r==='Perdido' ? 'p' : 'e'; }
function resLabel(r){ return r==='Ganado' ? 'Ganó' : r==='Perdido' ? 'Perdió' : 'Empató'; }
function computeResult(gf,gc){ return gf>gc ? 'Ganado' : gf<gc ? 'Perdido' : 'Empatado'; }
function dayOfYear(mes,dia){ return (CUM_DAYS[mes-1]||0) + Number(dia||1); }
function weekOfYear(mes,dia){ return Math.floor((dayOfYear(mes,dia)-1)/7)+1; }
function venueLabel(m){
  if(m.estadio && m.ciudad) return `${m.estadio} · ${m.ciudad}`;
  if(m.estadio) return m.estadio;
  if(m.ciudad) return m.ciudad;
  if(m.sede) return m.sede;
  return '—';
}

function isTitleMatchRecord(m){ return Boolean(m.titleDecision); }
function isRunnerUp(m){ return m.resultado==='Perdido' && /gran final/i.test(m.fase||''); }
function isWonTitle(m){ return m.resultado==='Ganado' && (m.titleWon || m.titleStatus==='ganado'); }
function titleCountsForTeam(teamId){
  const rows=matches.filter(m=>m.team===teamId && isTitleMatchRecord(m));
  return {titles:rows.filter(isWonTitle).length,runners:rows.filter(isRunnerUp).length};
}

/* =========================================================
   CRUD de semanas deportivas — usado por el mini-módulo de
   administración en partidos.js (pestaña "Semanas"). Cada semana
   es un rango [startMonth/startDay .. endMonth/endDay] que se
   compara contra la fecha de cada partido usando dayOfYear(), así
   que puede tener cualquier longitud (no necesariamente 7 días) e
   incluso cruzar de un mes a otro.
   ========================================================= */
function weekDefRange(w){
  return { start: dayOfYear(w.startMonth,w.startDay), end: dayOfYear(w.endMonth,w.endDay) };
}
function sortedWeekDefs(){
  return weekDefs.slice().sort((a,b)=>weekDefRange(a).start - weekDefRange(b).start);
}
function findWeekDef(mes,dia){
  const doy = dayOfYear(mes,dia);
  return weekDefs.find(w=>{ const r=weekDefRange(w); return doy>=r.start && doy<=r.end; }) || null;
}
// Semanas ya existentes que se traslaparían con este rango (para avisar
// en la UI antes de guardar, sin bloquear — el usuario puede tener un
// motivo válido para traslapar, p.ej. corrigiendo un rango previo).
function overlappingWeekDefs(def, excludeId){
  const {start,end} = weekDefRange(def);
  return weekDefs.filter(w=>{
    if(w.id===excludeId) return false;
    const r=weekDefRange(w);
    return start<=r.end && end>=r.start;
  });
}
async function addWeekDef(def){
  const id = 'w_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  weekDefs.push({id, label:def.label, startDay:Number(def.startDay), startMonth:Number(def.startMonth), endDay:Number(def.endDay), endMonth:Number(def.endMonth)});
  await persist();
  return id;
}
async function updateWeekDef(id, changes){
  const w = weekDefs.find(x=>x.id===id);
  if(!w) return;
  if(changes.label!==undefined) w.label=changes.label;
  if(changes.startDay!==undefined) w.startDay=Number(changes.startDay);
  if(changes.startMonth!==undefined) w.startMonth=Number(changes.startMonth);
  if(changes.endDay!==undefined) w.endDay=Number(changes.endDay);
  if(changes.endMonth!==undefined) w.endMonth=Number(changes.endMonth);
  await persist();
}
async function deleteWeekDef(id){
  weekDefs = weekDefs.filter(w=>w.id!==id);
  await persist();
}
async function resetWeekDefsToDefault(){
  weekDefs = DEFAULT_WEEK_DEFS.map(w=>({...w}));
  await persist();
}
function weekRangeLabel(w){ const r=weekDefRange(w); return fmtDayRange(r.start,r.end); }
function shortWeekLabel(label){ const m=/(\d+)/.exec(label||''); return m ? 'S'+m[1] : String(label||'?').slice(0,3).toUpperCase(); }

function statsForTeam(teamId){
  const rows = matches.filter(m=>m.team===teamId);
  const s = {pj:0,pg:0,pe:0,pp:0,gf:0,gc:0};
  rows.forEach(m=>{
    s.pj++; s.gf+=Number(m.gf); s.gc+=Number(m.gc);
    if(m.resultado==='Ganado') s.pg++;
    else if(m.resultado==='Perdido') s.pp++;
    else s.pe++;
  });
  s.pct = s.pj ? Math.round((s.pg/s.pj)*100) : 0;
  s.diff = s.gf - s.gc;
  s.rows = rows.slice().sort((a,b)=>(a.mes*100+a.dia)-(b.mes*100+b.dia));
  return s;
}

function buildWeeklyData(){
  const byKey = {};
  matches.forEach(m=>{
    const def = findWeekDef(m.mes, m.dia);
    // Si el partido no cae en ninguna semana definida (p.ej. porque aún
    // no se ha dado de alta esa semana), lo agrupamos con la vieja
    // fórmula de calendario como respaldo temporal y lo marcamos como
    // "isAuto" para que la UI avise que esa semana falta por definir.
    const key = def ? def.id : `auto_${weekOfYear(m.mes,m.dia)}`;
    if(!byKey[key]){
      byKey[key] = { key, def, label: def ? def.label : `Semana ${weekOfYear(m.mes,m.dia)} (sin definir)`, matches:[], g:0, e:0, p:0 };
    }
    const bucket = byKey[key];
    bucket.matches.push(m);
    if(m.resultado === 'Ganado') bucket.g++;
    else if(m.resultado === 'Perdido') bucket.p++;
    else bucket.e++;
  });
  return Object.values(byKey).map(w=>{
    const days = w.matches.map(m=>dayOfYear(m.mes,m.dia));
    const pj = w.matches.length;
    const rangeLabel = w.def ? weekRangeLabel(w.def) : fmtDayRange(Math.min(...days), Math.max(...days));
    const sortKey = w.def ? weekDefRange(w.def).start : Math.min(...days);
    return {...w, pj, pct:pj?Math.round((w.g/pj)*100):0, rangeLabel, shortLabel:shortWeekLabel(w.label), isAuto:!w.def, sortKey};
  }).sort((a,b)=>a.sortKey-b.sortKey);
}
function smoothPath(pts){
  if(pts.length < 2) return '';
  if(pts.length === 2) return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for(let i=0; i<pts.length-1; i++){
    const p0 = pts[i-1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i+1];
    const p3 = pts[i+2] || p2;
    const cp1x = p1[0] + (p2[0]-p0[0])/6;
    const cp1y = p1[1] + (p2[1]-p0[1])/6;
    const cp2x = p2[0] - (p3[0]-p1[0])/6;
    const cp2y = p2[1] - (p3[1]-p1[1])/6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}
function fmtDayRange(minD, maxD){
  const toLabel = (d)=>{
    let mIdx = 0;
    for(let i=0;i<12;i++){ if(d > CUM_DAYS[i]) mIdx = i; }
    return `${d - CUM_DAYS[mIdx]} ${MONTHS[mIdx+1]}`;
  };
  return minD===maxD ? toLabel(minD) : `${toLabel(minD)} – ${toLabel(maxD)}`;
}

/* =========================================================
   RENDER LAYER — reads data/logic layers, writes to DOM.
   ========================================================= */

function escapeHtml(value=''){
  return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function escapeAttr(value=''){ return escapeHtml(value); }
function setSafeText(element,value){ if(element) element.textContent=String(value??''); }
window.SportsCore={exportLedger,importLedgerFile,escapeHtml,storageEnvelope,STORAGE_SCHEMA_VERSION};
