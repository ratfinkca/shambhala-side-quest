export function createSubmission(runId,restored=null){
 const saved=restored?.runId===runId?structuredClone(restored):null;
 let ticket=saved?.ticket||null,payload=saved?.payload||null,expiresAt=saved?.expiresAt??null;
 const state={runId,status:saved?(saved.status==='pending'?'error':saved.status==='waiting'?'ineligible':saved.status):'waiting',code:saved?.status==='pending'?'unavailable':saved?.code||null,
 setTicket(id,result){if(id!==runId||state.status!=='waiting')return false;ticket=result?.ticket||null;const expiry=Date.parse(result?.expiresAt);expiresAt=Number.isFinite(expiry)?expiry:null;state.status=ticket?'ready':'ineligible';return !!ticket;},
 async post(value,send){
  if(!ticket||['waiting','pending','succeeded','ineligible'].includes(state.status))return;
  if(!payload&&expiresAt!==null&&expiresAt<=Date.now()){state.status='error';state.code='expired';return;}
  payload??=structuredClone({...value,runId,ticket});state.status='pending';
  try{const result=await send(structuredClone(payload));state.status=result.ok?'succeeded':'error';state.code=result.code||null;if(!result.ok&&result.code==='invalid_name')payload=null;}
  catch{state.status='error';state.code='unavailable';}
 },
 snapshot(){return structuredClone({runId,status:state.status,code:state.code,ticket,expiresAt,payload});},
 get initials(){return payload?.initials;},get displayName(){return payload?.displayName;}};return state;
}
