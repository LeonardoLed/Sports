/* Central facade for match operations. Loaded after state.js. */
window.MatchService={
  all:()=>matches.slice(),
  byTeam:(teamId)=>matches.filter(m=>m.team===teamId),
  add:async(match)=>{matches.push(match);await persist();return match;},
  remove:async(id)=>{matches=matches.filter(m=>m.id!==id);await persist();},
  replaceAll:async(list)=>{matches=list.slice();await persist();}
};
