(function(){
  let currentState={configured:false,authenticated:false,admin:false,user:null};
  let subscription=null;

  function el(id){return document.getElementById(id)}
  function setMessage(message,type=''){
    const node=el('adminAuthMessage');
    if(!node) return;
    node.textContent=message||'';
    node.className='admin-auth-message'+(type?' '+type:'');
  }

  function refreshWriteControls(){
    const canWrite=Boolean(currentState.configured && currentState.authenticated && currentState.admin);
    ['addBtn','weekSaveBtn','weekResetBtn'].forEach(id=>{
      const node=el(id); if(node) node.disabled=!canWrite;
    });
    document.querySelectorAll('.del-btn,.week-edit-btn,.week-del-btn').forEach(node=>node.disabled=!canWrite);
    document.querySelectorAll('#tab-registrar > .panel').forEach(panel=>{
      if(panel.id==='adminAccessPanel') return;
      panel.classList.toggle('admin-write-locked',!canWrite);
    });
    // Keep forms readable/usable for inspection; only write actions are actually disabled.
    document.querySelectorAll('.admin-write-locked input,.admin-write-locked select').forEach(node=>node.style.pointerEvents='auto');
    return canWrite;
  }

  function renderState(state){
    currentState=state||currentState;
    const badge=el('adminStatusBadge');
    const login=el('adminLoginForm');
    const session=el('adminSession');
    const sessionEmail=el('adminSessionEmail');

    if(!currentState.configured){
      if(badge){badge.textContent='Supabase sin configurar';badge.className='admin-status-badge is-locked'}
      login?.classList.remove('hidden'); session?.classList.add('hidden');
      setMessage('Configura Project URL y Publishable key para habilitar la administración.','error');
    }else if(currentState.authenticated && currentState.admin){
      if(badge){badge.textContent='Administrador activo';badge.className='admin-status-badge is-admin'}
      login?.classList.add('hidden'); session?.classList.remove('hidden');
      if(sessionEmail) sessionEmail.textContent=currentState.user?.email||'Administrador';
      setMessage('');
    }else{
      if(badge){badge.textContent='Gestión bloqueada';badge.className='admin-status-badge is-locked'}
      login?.classList.remove('hidden'); session?.classList.add('hidden');
      if(currentState.authenticated && !currentState.admin) setMessage('Acceso denegado: esta cuenta no es el administrador autorizado.','error');
      else setMessage('Inicia sesión para habilitar altas, cambios y eliminaciones.');
    }
    refreshWriteControls();
  }

  async function refresh(){
    try{ renderState(await DatabaseService.getAuthState()); }
    catch(e){ console.error(e); renderState({configured:DatabaseService.isConfigured(),authenticated:false,admin:false,user:null}); setMessage('No se pudo verificar la sesión: '+e.message,'error'); }
  }

  async function login(){
    const email=el('adminEmail')?.value.trim()||'';
    const password=el('adminPassword')?.value||'';
    const btn=el('adminLoginBtn');
    if(btn){btn.disabled=true;btn.textContent='Verificando…'}
    setMessage('Verificando credenciales…');
    try{
      const user=await DatabaseService.signInAdmin(email,password);
      if(el('adminPassword')) el('adminPassword').value='';
      renderState({configured:true,authenticated:true,admin:true,user});
      setMessage('Acceso concedido. Ya puedes modificar Ratio Sports.','success');
    }catch(e){
      console.error(e);
      renderState({configured:DatabaseService.isConfigured(),authenticated:false,admin:false,user:null});
      setMessage(e.message||'Acceso denegado.','error');
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Iniciar sesión'}
    }
  }

  async function logout(){
    const btn=el('adminLogoutBtn'); if(btn) btn.disabled=true;
    try{await DatabaseService.signOutAdmin();renderState({configured:DatabaseService.isConfigured(),authenticated:false,admin:false,user:null});setMessage('Sesión cerrada.');}
    catch(e){console.error(e);setMessage('No se pudo cerrar la sesión: '+e.message,'error')}
    finally{if(btn) btn.disabled=false}
  }

  async function init(){
    el('adminLoginBtn')?.addEventListener('click',login);
    el('adminLogoutBtn')?.addEventListener('click',logout);
    el('adminPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter') login()});
    await refresh();
    subscription=DatabaseService.onAuthStateChange(state=>renderState(state));
  }

  window.AdminAuthUI={init,refresh,refreshWriteControls,get state(){return currentState;}};
})();
