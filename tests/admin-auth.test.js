const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'..','assets','js','services','database-service.js'),'utf8');
function buildClient({session=null,loginUser=null,loginError=null}={}){
  let signedOut=false;
  return {
    auth:{
      getSession:async()=>({data:{session},error:null}),
      signInWithPassword:async()=>({data:{user:loginUser,session:loginUser?{user:loginUser}:null},error:loginError}),
      signOut:async()=>{signedOut=true;return {error:null}},
      onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})
    },
    get signedOut(){return signedOut}
  };
}
function load(client){
  const ctx={window:{RATIO_SPORTS_DB:{supabaseUrl:'x',supabaseAnonKey:'y',adminUserId:'8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2'},supabase:{createClient:()=>client}},console};
  vm.createContext(ctx);vm.runInContext(code,ctx);return ctx.window.DatabaseService;
}
(async()=>{
  const admin={id:'8e5aaf5a-4039-4668-b1a1-cdee0e0d47c2',email:'admin@test.com'};
  const normal={id:'11111111-1111-1111-1111-111111111111',email:'user@test.com'};

  let D=load(buildClient({session:{user:admin}}));
  let state=await D.getAuthState();
  assert.strictEqual(state.authenticated,true);assert.strictEqual(state.admin,true);
  assert.strictEqual(await D.ensureAuthenticated(),true);

  const normalClient=buildClient({session:{user:normal}});D=load(normalClient);
  state=await D.getAuthState();assert.strictEqual(state.admin,false);
  await assert.rejects(()=>D.ensureAuthenticated(),/administrador autorizado/);

  const loginClient=buildClient({loginUser:normal});D=load(loginClient);
  await assert.rejects(()=>D.signInAdmin('user@test.com','x'),/no tiene permisos de administrador/);
  assert.strictEqual(loginClient.signedOut,true);

  D=load(buildClient({loginError:{message:'Invalid login credentials'}}));
  await assert.rejects(()=>D.signInAdmin('bad@test.com','bad'),/Acceso denegado/);
  console.log('PASS admin authentication contract');
})().catch(e=>{console.error(e);process.exit(1)});
