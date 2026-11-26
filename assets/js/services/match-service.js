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
  // Edita campos de un partido existente. Primero la base de datos; el espejo
  // local solo se actualiza cuando la escritura remota tuvo éxito.
  update:async(id,changes)=>{
    const idx=matches.findIndex(m=>m.id===id);
    if(idx<0) throw new Error('El partido ya no existe.');
    const next={...matches[idx],...changes};
    if(window.DatabaseService?.isConfigured()) await DatabaseService.upsertMatch(next);
    matches[idx]=next;
    await persist();
    return next;
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

/* Estado de un torneo (campeón / subcampeón / eliminado / en curso).
   No se guarda en una tabla aparte: se escribe en el partido que cerró el
   torneo, para que no haga falta una final registrada. Si el torneo ya tenía
   un partido de cierre se reutiliza; si no, se usa el último partido jugado.
   Al reabrir un torneo (en_curso) se limpian todos sus cierres. */
window.TournamentService={
  setOutcome:async(team,torneo,outcome)=>{
    if(!['campeon','subcampeon','eliminado','en_curso'].includes(outcome)) throw new Error('Estado de torneo no válido.');
    const key=tournamentKey(team,torneo);
    const rows=matches.filter(m=>m.team===team && tournamentKey(m.team,m.torneo)===key).sort(byDateAsc);
    if(!rows.length) throw new Error('No hay partidos registrados para ese torneo.');

    const closing=rows.filter(isTitleMatchRecord).pop();
    const carrier=outcome==='en_curso' ? null : (closing || rows[rows.length-1]);
    const writes=[];

    rows.forEach(m=>{
      if(m===carrier){
        writes.push({id:m.id, changes:{...outcomeFields(outcome), tournamentId:normalizeKey(torneo)}});
      }else if(m.titleDecision || m.titleStatus || m.titleWon){
        writes.push({id:m.id, changes:{...outcomeFields('en_curso'), tournamentId:null}});
      }
    });
    for(const w of writes) await window.MatchService.update(w.id,w.changes);
    return writes.length;
  }
};
