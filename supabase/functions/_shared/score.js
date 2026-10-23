export const INPUTS=['mouse','touch','keyboard','mixed','unknown'];
export const MODES=['rush','festival'];
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const exact=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export function validRun(p){return exact(p,['runId','mode','scoringVersion','buildId'])&&UUID.test(p.runId)&&MODES.includes(p.mode)&&p.scoringVersion==='arcade-v1'&&typeof p.buildId==='string'&&/^[\w.-]{1,100}$/.test(p.buildId);}
export function validateScore(p,ticket){
 const fail=code=>({ok:false,code});
 if(!exact(p,['runId','ticket','initials','mode','scoringVersion','buildId','inputType','totalScore','stagesCleared','stages'])||!validRun({runId:p.runId,mode:p.mode,scoringVersion:p.scoringVersion,buildId:p.buildId})||!/^[a-f0-9]{64}$/.test(p.ticket)||!/^[A-Z0-9]{3}$/.test(p.initials)||!INPUTS.includes(p.inputType)||!integer(p.totalScore)||!integer(p.stagesCleared)||!Array.isArray(p.stages)||p.stages.length<1||p.stages.length>(p.mode==='rush'?1:3))return fail('invalid');
 let total=0,cleared=0,previous=[];
 for(let i=0;i<p.stages.length;i++){
  const s=p.stages[i];
  if(!exact(s,['stageIndex','activeMs','pickups','closePasses','score','perks','sparks','passes'])||s.stageIndex!==i||s.activeMs!==60000||![s.pickups,s.closePasses,s.score].every(integer)||!Array.isArray(s.perks)||s.perks.length!==i||new Set(s.perks).size!==i||!s.perks.every(k=>['boots','noodle','moth','bracelet'].includes(k))||!previous.every((v,j)=>s.perks[j]===v)||!Array.isArray(s.sparks)||s.sparks.length!==20||!s.sparks.every(integer)||!Array.isArray(s.passes)||s.passes.length!==2||!s.passes.every(integer))return fail('invalid');
  let points=0,pickups=0;
  s.sparks.forEach((n,index)=>{const multiplier=Math.floor(index/4)+1,drop=Math.floor(index%4/2)+1,bass=index%2+1;points+=n*10*multiplier*drop*bass;pickups+=n;});
  points+=(s.perks.includes('boots')?25:15)*(s.passes[0]+2*s.passes[1]);
  if(!Number.isSafeInteger(points)||points!==s.score||pickups!==s.pickups||s.passes[0]+s.passes[1]!==s.closePasses)return fail('invalid');
  const qualified=p.mode==='rush'||s.pickups>=[20,25,30][i];
  if(qualified)cleared++;else if(i!==p.stages.length-1)return fail('invalid');
  if(p.mode==='festival'&&qualified&&i===p.stages.length-1&&i<2)return fail('unfinished');
  previous=s.perks;total+=points;
 }
 if(total!==p.totalScore||cleared!==p.stagesCleared)return fail('invalid');
 if(ticket&&(ticket.mode!==p.mode||ticket.scoringVersion!==p.scoringVersion||ticket.runId!==p.runId||ticket.elapsedMs+5000<p.stages.length*60000))return fail('invalid_ticket');
 return {ok:true,record:p};
}
export function validBoard(rows,mode,version){return Array.isArray(rows)&&rows.length<=50&&rows.every(r=>exact(r,['initials','score','stagesCleared','inputType','mode','scoringVersion','receivedAt'])&&/^[A-Z0-9]{3}$/.test(r.initials)&&integer(r.score)&&integer(r.stagesCleared)&&r.stagesCleared<=3&&INPUTS.includes(r.inputType)&&r.mode===mode&&r.scoringVersion===version&&typeof r.receivedAt==='string'&&Number.isFinite(Date.parse(r.receivedAt)));}
