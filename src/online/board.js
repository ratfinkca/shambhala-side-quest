export function createBoard(load){
 let generation=0;const cache=new Map();
 const state={mode:'rush',status:'idle',rows:[],async select(mode,version){
  const current=++generation;state.mode=mode;state.status='loading';state.rows=[];
  const key=mode+':'+version,hit=cache.get(key);
  const result=hit&&Date.now()-hit.at<30000?hit.result:await load({mode,scoringVersion:version});
  if(result.ok)cache.set(key,{at:Date.now(),result});
  if(current!==generation)return false;
  state.status=result.ok?'ready':'error';state.rows=result.ok?result.data:[];return true;
 }};return state;
}
