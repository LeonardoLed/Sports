/* Fachada central de partidos. PostgreSQL/Supabase es la fuente de verdad
   cuando está configurado. localStorage conserva una copia espejo para lectura
   de emergencia; si una escritura a Supabase falla NO se crea una copia local
   divergente. Sin configuración de Supabase, funciona en modo fallback local. */
window.MatchService={
  all:()=>matches.slice(),
  byTeam:(teamId)=>matches.filter(m=>m.team===teamId),
  add:async(match)=>{
    if(window.DatabaseService?.isConfigured()) await DatabaseService.upsertMatch(match);
    matches.push(match);
    await persist();
    return match;
  },
  remove:async(id)=>{
    if(window.DatabaseService?.isConfigured()) await DatabaseService.deleteMatch(id);
    matches=matches.filter(m=>m.id!==id);
    await persist();
  },
  replaceAll:async(list)=>{
    matches=list.slice();
    await persist();
  }
};
