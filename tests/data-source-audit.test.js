const fs=require('fs'), assert=require('assert'), path=require('path');
const root=path.join(__dirname,'..');
const state=fs.readFileSync(path.join(root,'assets/js/core/state.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'assets/js/core/ui.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'assets/js/pages/dashboard.js'),'utf8');
const partidos=fs.readFileSync(path.join(root,'assets/js/pages/partidos.js'),'utf8');
function test(name,fn){try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,'\n ',e.message);process.exitCode=1}}

test('Supabase empty table remains authoritative',()=>{
  assert(state.includes('const dbMatches=await DatabaseService.listMatches()'));
  assert(state.includes("if(!Array.isArray(dbMatches)) throw new Error"));
  assert(!state.includes('dbMatches.length'));
  assert(state.includes("matchDataSource='supabase'"));
  assert(state.includes('matchesLoaded=true'));
});

test('localStorage is only read fallback after Supabase attempt',()=>{
  const dbPos=state.indexOf('if(dbConfigured)');
  const fallbackPos=state.indexOf('if(!matchesLoaded)');
  assert(dbPos>=0 && fallbackPos>dbPos);
});

test('fallback restores complete snapshot without re-merging seed',()=>{
  assert(state.includes('storedMatches.length'));
  assert(state.includes('storedMatches.map(m=>normalizedMatch'));
  assert(!state.includes('...SEED_MATCHES,...storedMatches'));
});

test('tournament status derives from matches only',()=>{
  const start=state.indexOf('function buildTournamentLedger');
  const end=state.indexOf('\nfunction ',start+10);
  const fn=state.slice(start,end);
  assert(fn.includes('matches.forEach'));
  assert(!fn.includes('titleOverrides'));
  assert(!fn.includes('TOURNAMENTS_CONFIG'));
});

const dynamicFunctions=[
  [state,'statsForTeam'],[state,'buildWeeklyData'],[state,'buildTournamentLedger'],[state,'overallStats'],
  [dashboard,'renderHero'],[dashboard,'renderStats'],[dashboard,'renderHonours'],[dashboard,'renderMatchTable'],[dashboard,'renderNflTable'],
  [partidos,'renderTournamentManager'],[partidos,'renderRecentTable']
];
for(const [src,name] of dynamicFunctions){
  test(`${name} consumes live matches`,()=>{
    const start=src.indexOf(`function ${name}`); assert(start>=0,`${name} not found`);
    const next=src.indexOf('\nfunction ',start+10); const fn=src.slice(start,next<0?src.length:next);
    assert(/matches|overallStats|buildTournamentLedger|buildWeeklyData|statsForTeam/.test(fn),`${name} does not consume live data`);
    assert(!fn.includes('SEED_MATCHES'),`${name} references seed directly`);
  });
}

test('pages load matches before first renderAll',()=>{
  for(const [name,src] of [['dashboard',dashboard],['partidos',partidos]]){
    const init=src.indexOf('async function init()');
    const load=src.indexOf('await loadMatches()',init);
    const render=src.indexOf('renderAll()',load);
    assert(init>=0&&load>init&&render>load,`${name} render order invalid`);
  }
});
