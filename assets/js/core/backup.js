
(function(){
  function install(){
    const host=document.querySelector('.header-actions')||document.querySelector('.masthead');
    if(!host||document.getElementById('backupExportBtn')) return;
    const exp=document.createElement('button'); exp.id='backupExportBtn'; exp.className='btn btn-ghost'; exp.type='button'; exp.textContent='Exportar JSON'; exp.addEventListener('click',()=>SportsCore.exportLedger());
    const imp=document.createElement('button'); imp.className='btn btn-ghost'; imp.type='button'; imp.textContent='Importar JSON';
    const input=document.createElement('input'); input.type='file'; input.accept='.json,application/json'; input.hidden=true;
    imp.addEventListener('click',()=>input.click()); input.addEventListener('change',async()=>{try{if(!input.files[0])return;await SportsCore.importLedgerFile(input.files[0]);location.reload();}catch(e){alert(e.message);}});
    host.append(exp,imp,input);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install):install();
})();
