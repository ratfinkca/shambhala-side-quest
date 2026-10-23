export function createSubmission(runId){
 let ticket=null,payload=null;const state={runId,status:'waiting',code:null,
 setTicket(id,result){if(id!==runId||state.status!=='waiting')return false;ticket=result?.ticket||null;state.status=ticket?'ready':'ineligible';return !!ticket;},
 async post(value,send){
  if(!ticket||['waiting','pending','succeeded','ineligible'].includes(state.status))return;
  payload??=structuredClone({...value,runId,ticket});state.status='pending';
  const result=await send(payload);state.status=result.ok?'succeeded':'error';state.code=result.code||null;
 },get initials(){return payload?.initials;}};return state;
}
