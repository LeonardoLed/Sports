const fs=require('fs'), vm=require('vm'), assert=require('assert');
const path=require('path');
const code=fs.readFileSync(path.join(__dirname,'..','assets','js','services','database-service.js'),'utf8');
const ctx={window:{RATIO_SPORTS_DB:{supabaseUrl:'https://x.supabase.co',supabaseAnonKey:'anon'},TEAMS:{real_madrid:{name:'Real Madrid'}}}, console};
ctx.window.supabase={createClient:()=>({})};
vm.createContext(ctx); vm.runInContext(code,ctx);
const D=ctx.window.DatabaseService;
function test(name,fn){try{fn(); console.log('PASS',name)}catch(e){console.error('FAIL',name,'\n ',e.message);process.exitCode=1}}

test('isConfigured true with URL/key/client',()=>assert.strictEqual(D.isConfigured(),true));
test('home score maps GF/GC to local/visitor',()=>{
 const r=D.toRow({id:'x',team:'real_madrid',year:2026,mes:8,dia:22,rival:'Pumas',torneo:'Amistoso',venueSide:'home',gf:3,gc:1,resultado:'Ganado'});
 assert.strictEqual(r.local_score,3);assert.strictEqual(r.visitor_score,1);assert.strictEqual(r.local_name,'Real Madrid');assert.strictEqual(r.visitor_name,'Pumas');
});
test('away score swaps local/visitor correctly',()=>{
 const r=D.toRow({id:'x',team:'real_madrid',year:2026,mes:8,dia:22,rival:'Pumas',torneo:'Amistoso',venueSide:'away',gf:3,gc:1,resultado:'Ganado'});
 assert.strictEqual(r.local_score,1);assert.strictEqual(r.visitor_score,3);assert.strictEqual(r.local_name,'Pumas');assert.strictEqual(r.visitor_name,'Real Madrid');
});
test('automatic result is computed if omitted',()=>{
 assert.strictEqual(D.toRow({id:'x',team:'real_madrid',mes:8,dia:22,rival:'P',gf:0,gc:2}).result,'Perdido');
});
test('date is zero padded',()=>assert.strictEqual(D.toRow({id:'x',team:'real_madrid',year:2027,mes:2,dia:3,rival:'P',gf:0,gc:0}).match_date,'2027-02-03'));
test('roundtrip preserves core fields',()=>{
 const m={id:'r1',team:'real_madrid',year:2026,mes:8,dia:22,rival:'Barcelona',rivalCountry:'España',torneo:'La Liga',fase:'J1',estadio:'Bernabéu',ciudad:'Madrid',venueSide:'away',gf:2,gc:1,resultado:'Ganado',scoreAnnotation:'(4-3)',aggregateLocal:4,aggregateVisit:3,penaltyLocal:5,penaltyVisit:4,extraTime:true,internacional:false,titleDecision:true,titleStatus:'ganado',titleWon:true,tournamentId:'la_liga',userAdded:true};
 const out=D.fromRow(D.toRow(m));
 for(const k of ['id','team','mes','dia','rival','rivalCountry','torneo','fase','estadio','ciudad','venueSide','gf','gc','resultado','scoreAnnotation','aggregateLocal','aggregateVisit','penaltyLocal','penaltyVisit','extraTime','internacional','titleDecision','titleStatus','titleWon','tournamentId','userAdded']) assert.deepStrictEqual(out[k],m[k],k);
});
