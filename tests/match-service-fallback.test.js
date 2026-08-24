const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'..','assets/js/services/match-service.js'),'utf8');
async function run(){
  async function test(name,fn){try{await fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,'\n ',e.message);process.exitCode=1}}

  await test('unconfigured mode writes to local fallback',async()=>{
    let persisted=0;
    const ctx={window:{DatabaseService:{isConfigured:()=>false}},matches:[],persist:async()=>{persisted++}};
    vm.createContext(ctx);vm.runInContext(code,ctx);
    await ctx.window.MatchService.add({id:'x'});
    assert.strictEqual(ctx.matches.length,1);assert.strictEqual(persisted,1);
  });

  await test('configured failed DB write does not diverge locally',async()=>{
    let persisted=0;
    const ctx={window:{DatabaseService:{isConfigured:()=>true,upsertMatch:async()=>{throw new Error('db down')}}},matches:[],persist:async()=>{persisted++}};
    ctx.DatabaseService=ctx.window.DatabaseService;
    vm.createContext(ctx);vm.runInContext(code,ctx);
    await assert.rejects(()=>ctx.window.MatchService.add({id:'x'}),/db down/);
    assert.strictEqual(ctx.matches.length,0);assert.strictEqual(persisted,0);
  });

  await test('configured successful DB delete updates mirror only after DB succeeds',async()=>{
    let deleted=false,persisted=0;
    const db={isConfigured:()=>true,deleteMatch:async(id)=>{deleted=id==='x'}};
    const ctx={window:{DatabaseService:db},DatabaseService:db,matches:[{id:'x'},{id:'y'}],persist:async()=>{persisted++}};
    vm.createContext(ctx);vm.runInContext(code,ctx);
    await ctx.window.MatchService.remove('x');
    assert.strictEqual(deleted,true);assert.deepStrictEqual(ctx.matches.map(x=>x.id),['y']);assert.strictEqual(persisted,1);
  });
}
run();
