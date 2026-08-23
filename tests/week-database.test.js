const fs=require('fs'), vm=require('vm'), assert=require('assert');
const src=fs.readFileSync('assets/js/services/database-service.js','utf8');
let calls=[];
function query(table){
  const q={
    select(){calls.push(['select',table]);return q;},
    order(){return q;},
    upsert(data){calls.push(['upsert',table,data]);return Promise.resolve({error:null});},
    delete(){calls.push(['delete',table]);return q;},
    eq(k,v){calls.push(['eq',table,k,v]);return Promise.resolve({error:null});},
    neq(k,v){calls.push(['neq',table,k,v]);return Promise.resolve({error:null});},
    not(k,op,v){calls.push(['not',table,k,op,v]);return Promise.resolve({error:null});},
    then(resolve){resolve({data:[],error:null});}
  }; return q;
}
const sandbox={window:{RATIO_SPORTS_DB:{supabaseUrl:'x',supabaseAnonKey:'y'},supabase:{createClient:()=>({from:query,auth:{getSession:async()=>({data:{session:{}}})}})}}};
vm.createContext(sandbox);vm.runInContext(src,sandbox);
const db=sandbox.window.DatabaseService;
(async()=>{
  const row=db.weekToRow({id:'w23',label:'Semana 23',startDay:1,startMonth:8,endDay:9,endMonth:8});
  assert.deepStrictEqual(JSON.parse(JSON.stringify(row)),{id:'w23',label:'Semana 23',start_day:1,start_month:8,end_day:9,end_month:8});
  const week=db.weekFromRow(row); assert.strictEqual(week.startMonth,8); assert.strictEqual(week.endDay,9);
  await db.listWeeks(); assert(calls.some(c=>c[0]==='select'&&c[1]==='sports_weeks'));
  await db.upsertWeek(week); assert(calls.some(c=>c[0]==='upsert'&&c[1]==='sports_weeks'));
  await db.deleteWeek('w23'); assert(calls.some(c=>c[0]==='delete'&&c[1]==='sports_weeks'));
  console.log('PASS sports_weeks database contract');
})().catch(e=>{console.error(e);process.exit(1)});
