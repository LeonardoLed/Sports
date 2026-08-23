(function(){
  let client = null;
  const cfg = window.RATIO_SPORTS_DB || {};

  function isConfigured(){
    return Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase?.createClient);
  }

  function getClient(){
    if(!isConfigured()) return null;
    if(!client){
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}
      });
    }
    return client;
  }

  function fromRow(r){
    const d = new Date(String(r.match_date)+'T12:00:00');
    return {
      id:r.id, team:r.tracked_team_id, dia:d.getDate(), mes:d.getMonth()+1,
      rival:r.rival, rivalCountry:r.rival_country || '', torneo:r.competition,
      fase:r.phase || '', estadio:r.stadium || '', ciudad:r.city || '', sede:'',
      venueSide:r.venue_side, gf:r.goals_for, gc:r.goals_against, resultado:r.result,
      localName:r.local_name, visitName:r.visitor_name,
      originLocal:r.local_origin || '—', originVisit:r.visitor_origin || '—',
      localScore:r.local_score, visitScore:r.visitor_score,
      scoreAnnotation:r.score_annotation || '-', aggregateLocal:r.aggregate_local,
      aggregateVisit:r.aggregate_visitor, penaltyLocal:r.penalty_local,
      penaltyVisit:r.penalty_visitor, extraTime:Boolean(r.extra_time),
      internacional:Boolean(r.international), titleDecision:Boolean(r.title_decision),
      titleStatus:r.title_status, titleWon:Boolean(r.title_won), tournamentId:r.tournament_id,
      userAdded:Boolean(r.user_added)
    };
  }

  function missingOrigin(v){
    const x=String(v ?? '').trim();
    return !x || x==='—' || x==='-';
  }

  function deriveOrigins(m){
    const away=m.venueSide === 'away';
    const rivalCountry=String(m.rivalCountry || '').trim();
    const team=window.TEAMS?.[m.team];
    const followedCountry=team ? (team.type==='Selección' ? team.name : (team.country || '')) : '';
    let localOrigin=m.originLocal;
    let visitorOrigin=m.originVisit;
    // Persist the actual countries for new/user-managed matches whenever the
    // form provides rivalCountry. This is deliberately done at the DB boundary
    // so every caller (not just one page/form) writes a complete row.
    if(rivalCountry){
      if(away){
        if(missingOrigin(localOrigin)) localOrigin=rivalCountry;
        if(missingOrigin(visitorOrigin)) visitorOrigin=followedCountry || null;
      }else{
        if(missingOrigin(localOrigin)) localOrigin=followedCountry || null;
        if(missingOrigin(visitorOrigin)) visitorOrigin=rivalCountry;
      }
    }
    return {localOrigin:missingOrigin(localOrigin)?null:localOrigin, visitorOrigin:missingOrigin(visitorOrigin)?null:visitorOrigin};
  }

  function toRow(m){
    const year = Number(m.year || 2026);
    const mm = String(Number(m.mes)).padStart(2,'0');
    const dd = String(Number(m.dia)).padStart(2,'0');
    const away = m.venueSide === 'away';
    const gf = Number(m.gf || 0), gc = Number(m.gc || 0);
    const origins=deriveOrigins(m);
    return {
      id:m.id,
      tracked_team_id:m.team,
      match_date:`${year}-${mm}-${dd}`,
      rival:m.rival,
      rival_country:m.rivalCountry || null,
      competition:m.torneo || 'Sin competición',
      phase:m.fase || null,
      stadium:m.estadio || null,
      city:m.ciudad || null,
      venue_side:m.venueSide || 'home',
      goals_for:gf,
      goals_against:gc,
      result:m.resultado || (gf>gc?'Ganado':gf<gc?'Perdido':'Empatado'),
      local_name:m.localName || (away?m.rival:(window.TEAMS?.[m.team]?.name || m.team)),
      visitor_name:m.visitName || (away?(window.TEAMS?.[m.team]?.name || m.team):m.rival),
      local_origin:origins.localOrigin,
      visitor_origin:origins.visitorOrigin,
      local_score:away?gc:gf,
      visitor_score:away?gf:gc,
      score_annotation:m.scoreAnnotation || '-',
      aggregate_local:m.aggregateLocal ?? null,
      aggregate_visitor:m.aggregateVisit ?? null,
      penalty_local:m.penaltyLocal ?? null,
      penalty_visitor:m.penaltyVisit ?? null,
      extra_time:Boolean(m.extraTime),
      international:Boolean(m.internacional),
      title_decision:Boolean(m.titleDecision),
      title_status:m.titleStatus || null,
      title_won:Boolean(m.titleWon),
      tournament_id:m.tournamentId || null,
      user_added:Boolean(m.userAdded)
    };
  }

  async function listMatches(){
    const c=getClient();
    if(!c) return null;
    const {data,error}=await c.from('matches').select('*').order('match_date',{ascending:true}).order('id',{ascending:true});
    if(error) throw error;
    return (data||[]).map(fromRow);
  }


  function weekFromRow(r){
    return {
      id:r.id,
      label:r.label,
      startDay:Number(r.start_day),
      startMonth:Number(r.start_month),
      endDay:Number(r.end_day),
      endMonth:Number(r.end_month)
    };
  }

  function weekToRow(w){
    return {
      id:w.id,
      label:w.label,
      start_day:Number(w.startDay),
      start_month:Number(w.startMonth),
      end_day:Number(w.endDay),
      end_month:Number(w.endMonth)
    };
  }

  async function listWeeks(){
    const c=getClient();
    if(!c) return null;
    const {data,error}=await c.from('sports_weeks').select('*').order('start_month',{ascending:true}).order('start_day',{ascending:true}).order('id',{ascending:true});
    if(error) throw error;
    return (data||[]).map(weekFromRow);
  }

  function isAdminUser(user){
    const adminUserId = String(cfg.adminUserId || '').trim();
    return Boolean(user && adminUserId && String(user.id) === adminUserId);
  }

  async function getAuthState(){
    const c=getClient();
    if(!c) return {configured:false, authenticated:false, admin:false, user:null};
    const {data:{session},error}=await c.auth.getSession();
    if(error) throw error;
    const user=session?.user || null;
    return {configured:true, authenticated:Boolean(session && user), admin:isAdminUser(user), user};
  }

  async function signInAdmin(email,password){
    const c=getClient();
    if(!c) throw new Error('Supabase no está configurado.');
    if(!email || !password) throw new Error('Escribe correo y contraseña.');
    const {data,error}=await c.auth.signInWithPassword({email:String(email).trim(),password});
    if(error) throw new Error('Acceso denegado: correo o contraseña incorrectos.');
    const user=data?.user || data?.session?.user || null;
    if(!isAdminUser(user)){
      await c.auth.signOut();
      throw new Error('Acceso denegado: este usuario no tiene permisos de administrador.');
    }
    return user;
  }

  async function signOutAdmin(){
    const c=getClient();
    if(!c) return;
    const {error}=await c.auth.signOut();
    if(error) throw error;
  }

  function onAuthStateChange(callback){
    const c=getClient();
    if(!c) return {unsubscribe(){}};
    const {data}=c.auth.onAuthStateChange((_event,session)=>{
      const user=session?.user || null;
      callback({configured:true,authenticated:Boolean(session&&user),admin:isAdminUser(user),user});
    });
    return data?.subscription || {unsubscribe(){}};
  }

  async function ensureAuthenticated(){
    const state=await getAuthState();
    if(!state.configured) return false;
    if(!state.authenticated) throw new Error('Inicia sesión como administrador para guardar cambios.');
    if(!state.admin) throw new Error('Acceso denegado: esta cuenta no es el administrador autorizado.');
    return true;
  }

  async function upsertMatch(match){
    const c=getClient();
    if(!c) return false;
    if(!await ensureAuthenticated()) throw new Error('Se requiere iniciar sesión para guardar cambios.');
    const {error}=await c.from('matches').upsert(toRow(match),{onConflict:'id'});
    if(error) throw error;
    return true;
  }

  async function deleteMatch(id){
    const c=getClient();
    if(!c) return false;
    if(!await ensureAuthenticated()) throw new Error('Se requiere iniciar sesión para eliminar partidos.');
    const {error}=await c.from('matches').delete().eq('id',id);
    if(error) throw error;
    return true;
  }

  async function upsertWeek(week){
    const c=getClient();
    if(!c) return false;
    if(!await ensureAuthenticated()) throw new Error('Se requiere iniciar sesión para guardar semanas.');
    const {error}=await c.from('sports_weeks').upsert(weekToRow(week),{onConflict:'id'});
    if(error) throw error;
    return true;
  }

  async function deleteWeek(id){
    const c=getClient();
    if(!c) return false;
    if(!await ensureAuthenticated()) throw new Error('Se requiere iniciar sesión para eliminar semanas.');
    const {error}=await c.from('sports_weeks').delete().eq('id',id);
    if(error) throw error;
    return true;
  }

  async function replaceWeeks(weeks){
    const c=getClient();
    if(!c) return false;
    if(!await ensureAuthenticated()) throw new Error('Se requiere iniciar sesión para restaurar semanas.');
    const rows=(weeks||[]).map(weekToRow);
    if(rows.length){
      const {error:upsertError}=await c.from('sports_weeks').upsert(rows,{onConflict:'id'});
      if(upsertError) throw upsertError;
      const ids=rows.map(r=>r.id);
      const {error:deleteError}=await c.from('sports_weeks').delete().not('id','in',`(${ids.map(id=>'"'+String(id).replaceAll('"','\"')+'"').join(',')})`);
      if(deleteError) throw deleteError;
    }else{
      const {error}=await c.from('sports_weeks').delete().neq('id','');
      if(error) throw error;
    }
    return true;
  }

  window.DatabaseService={
    isConfigured,getClient,isAdminUser,getAuthState,signInAdmin,signOutAdmin,onAuthStateChange,ensureAuthenticated,
    listMatches,upsertMatch,deleteMatch,toRow,fromRow,
    listWeeks,upsertWeek,deleteWeek,replaceWeeks,weekToRow,weekFromRow
  };
})();
