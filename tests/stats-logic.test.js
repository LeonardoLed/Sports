/* Reglas de estadísticas y torneos, ejecutadas contra los datos semilla reales. */
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const r=f=>fs.readFileSync(path.join(__dirname,'..','assets/js',f),'utf8');
const normalizeKeySrc=`function normalizeKey(v){return String(v||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/\\bfc\\b|\\bsc\\b|\\bclub\\b/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');}`;
const ctx={console}; ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(r('data/sports-data.js')+'\n'+normalizeKeySrc+'\n'+r('core/state.js')+`
function load(list){ matches=list.map(m=>normalizedMatch(m,m)); weekDefs=DEFAULT_WEEK_DEFS.map(w=>({...w})); }
load(SEED_MATCHES);`,ctx);
const run=code=>vm.runInContext(code,ctx);
function test(name,fn){try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,'\n ',e.message);process.exitCode=1}}

test('NFL cuenta en partidos, victorias y % de victorias',()=>{
  const o=run('overallStats()');
  assert.strictEqual(o.all.pj,106); assert.strictEqual(o.football.pj,105); assert.strictEqual(o.nfl.pj,1);
  assert.strictEqual(o.all.pj,o.all.pg+o.all.pe+o.all.pp);
  assert.strictEqual(o.all.pp,o.football.pp+o.nfl.pp);
});
test('estadísticas de gol y porterías a cero son solo de fútbol',()=>{
  const f=run('overallStats().football');
  assert.strictEqual(f.cleanSheets,46);                       // el Cowboys (gc=34) no suma ni resta
  assert.strictEqual(run('statsForTeam("cowboys").cleanSheets'),null);
  run(`load(SEED_MATCHES.concat([{id:'nfl0',team:'cowboys',dia:5,mes:1,rival:'Z',torneo:'NFL Temporada',fase:'Week 19',gf:24,gc:0,venueSide:'home'}]))`);
  assert.strictEqual(run('overallStats().football.cleanSheets'),46);  // una blanqueada de NFL no es portería a cero
  assert.strictEqual(run('overallStats().all.pj'),107);
  run('load(SEED_MATCHES)');
});
test('el resultado del partido sale del marcador, no de la serie',()=>{
  assert.strictEqual(run(`matches.find(m=>m.id==='m29_pumas').resultado`),'Ganado');
});
test('la gráfica semanal y el total general coinciden',()=>{
  const w=run('buildWeeklyData()');
  assert.strictEqual(w.reduce((a,x)=>a+x.pj,0),106);
  assert.strictEqual(w.filter(x=>x.isAuto).length,0);
});
test('semana 20 no se traslapa con la 21',()=>{
  const n=run(`weekDefs.filter(w=>overlappingWeekDefs(w,w.id).length).length`);
  assert.strictEqual(n,0);
});
test('un torneo perdido sin final queda como eliminado',()=>{
  const t=run(`buildTournamentLedger().find(t=>t.team==='real_madrid'&&t.torneo==='Copa del Rey')`);
  assert.strictEqual(t.outcome,'eliminado');
  assert.strictEqual(run(`outcomeLabel(buildTournamentLedger().find(t=>t.torneo==='La Liga'))`),'Torneo perdido');
});
test('cada equipo y torneo cuenta una vez (Mundial = 2 torneos)',()=>{
  assert.strictEqual(run(`buildTournamentLedger().filter(t=>/Mundial/.test(t.torneo)).length`),2);
  assert.strictEqual(run(`honoursFromLedger(buildTournamentLedger()).tournaments`),11);
});
test('amistosos y fechas FIFA no son torneos',()=>{
  assert.strictEqual(run(`isCompetitiveTournament('Partido de Preparación')`),false);
  assert.strictEqual(run(`isCompetitiveTournament('Fecha FIFA')`),false);
});
test('final ganada por penales (empate a 90) cuenta como título',()=>{
  run(`load(SEED_MATCHES.concat([{id:'f1',team:'pumas',dia:9,mes:8,rival:'Y',torneo:'Copa X',fase:'Gran Final',gf:1,gc:1,venueSide:'home',titleDecision:true,titleStatus:'ganado',titleWon:true}]))`);
  assert.strictEqual(run(`buildTournamentLedger().find(t=>t.torneo==='Copa X').outcome`),'campeon');
  run('load(SEED_MATCHES)');
});
test('dayOfYear no acepta fechas imposibles',()=>{
  assert.strictEqual(run('dayOfYear(6,31)'),run('dayOfYear(6,30)'));
});

test('ubicación: México = América del Norte, salvo en el Mundial (federación)',()=>{
  assert.strictEqual(run(`originLabel('México','CONCACAF Champions Cup')`),'América del Norte');
  assert.strictEqual(run(`originLabel('México','Partido de Preparación')`),'América del Norte');
  assert.strictEqual(run(`originLabel('México','Copa Mundial FIFA USA-MEX-CAN 2026')`),'CONCACAF');
  assert.strictEqual(run(`originLabel('Inglaterra','Copa Mundial FIFA USA-MEX-CAN 2026')`),'UEFA');
  assert.strictEqual(run(`originLabel('Europa','Copa Mundial FIFA USA-MEX-CAN 2026')`),'UEFA');
  assert.strictEqual(run(`originLabel('UEFA','Copa Mundial FIFA USA-MEX-CAN 2026')`),'UEFA');
  assert.strictEqual(run(`originLabel('España','UEFA Champions League 2025-2026')`),'Europa');
  assert.strictEqual(run(`originLabel('Arabia Saudita','AFC Champions League Two')`),'Asia');
  assert.strictEqual(run(`originLabel('Corea del Sur','Copa Mundial FIFA USA-MEX-CAN 2026')`),'AFC');
  assert.strictEqual(run(`originLabel('NFC Este','NFL Temporada')`),'NFC Este');
  assert.strictEqual(run(`originLabel('—','x')`),'');
});
