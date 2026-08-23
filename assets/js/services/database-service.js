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

  function toRow(m){
    const year = Number(m.year || 2026);
    const mm = String(Number(m.mes)).padStart(2,'0');
    const dd = String(Number(m.dia)).padStart(2,'0');
    const away = m.venueSide === 'away';
    const gf = Number(m.gf || 0), gc = Number(m.gc || 0);
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
      local_origin:m.originLocal || null,
      visitor_origin:m.originVisit || null,
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

  async function ensureAuthenticated(){
    const c=getClient();
    if(!c) return false;
    const {data:{session}}=await c.auth.getSession();
    if(session) return true;
    const email=window.prompt('Correo de administrador de Ratio Sports:');
    if(!email) return false;
    const password=window.prompt('Contraseña de administrador:');
    if(!password) return false;
    const {error}=await c.auth.signInWithPassword({email,password});
    if(error) throw new Error('No se pudo iniciar sesión: '+error.message);
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

  window.DatabaseService={isConfigured,getClient,listMatches,upsertMatch,deleteMatch,ensureAuthenticated,toRow,fromRow};
})();
