export function createBoard(load){
 let generation=0;const cache=new Map();
 const state={mode:'rush',scoringVersion:null,rushStageId:null,status:'idle',rows:[],async select(mode,version,rushStageId){
  const venue=mode==='rush'&&typeof rushStageId==='string'?rushStageId:null;
  const current=++generation;state.mode=mode;state.scoringVersion=version;state.rushStageId=venue;state.status='loading';state.rows=[];
  const key=JSON.stringify([mode,version,venue]),hit=cache.get(key);
  const result=hit&&Date.now()-hit.at<30000?hit.result:await load({mode,scoringVersion:version,...(venue?{rushStageId:venue}:{})});
  if(result.ok)cache.set(key,{at:Date.now(),result});
  if(current!==generation)return false;
  state.status=result.ok?'ready':'error';state.rows=result.ok?result.data:[];return true;
 }};return state;
}
