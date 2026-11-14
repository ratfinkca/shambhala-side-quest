import {findSpawn,isOpen,movementFactor,clampToArena} from './geometry.js';

export const MYSTERY_EFFECTS={
 speed:{name:'SUGAR RUSH',hint:'Super speed · 2.5×'},
 dizzy:{name:'DIZZY',hint:'Controls reversed · aim the opposite way'},
 waves:{name:'WAVY COLOURS',hint:'A different kind of scenery'},
};
export function createMystery(rng=Math.random,{rules={},durationMs=60000}={}){
 const modern=rules.pickupSchedulerVersion===1,magnet=modern&&rules.candyMagnet;
 const chance=rng(),scheduled=magnet||chance<.8;
 const start=12000+Math.floor(rng()*(magnet?12000:28000));
 const mystery={phase:scheduled?'waiting':'absent',spawnAtMs:start,elapsedMs:0,effect:null,effectMs:0,wrapper:{colour:Math.floor(rng()*4),pattern:Math.floor(rng()*3)}};
 if(modern){
  const starts=scheduled?[start,...(magnet&&chance<.5?[start+20000]:[])]:[];
  mystery.schedule={version:1,windows:starts.map(at=>[at,at+10000]),consumed:[],skipped:[],slot:0,cooldownUntilMs:0,durationMs,effectDurationMs:rules.candyDurationMs??5000};
 }
 return mystery;
}
export function advanceMystery(m,dt,ended=false){
 const previousElapsed=m.elapsedMs,previousEffect=m.effectMs;
 m.elapsedMs+=Math.max(0,dt);
 m.effectMs=Math.max(0,m.effectMs-Math.max(0,dt));
 if(m.effectMs===0)m.effect=null;
 if(m.schedule){
  if(previousEffect>0&&m.effectMs===0)m.schedule.cooldownUntilMs=previousElapsed+previousEffect+8000;
  advanceScheduledMystery(m,ended);return;
 }
 if(m.phase==='waiting'&&m.elapsedMs>=m.spawnAtMs)m.phase='available';
 if(m.phase==='available'&&m.elapsedMs>=m.spawnAtMs+10000)m.phase='spent';
 if(ended){m.phase='spent';m.effect=null;m.effectMs=0;}
}
export function collectMystery(round,rng=Math.random){
 const m=round.mystery;
 if(round.ended||m.phase!=='available'||m.effectMs>0)return null;
 if(m.schedule)m.schedule.consumed.push(m.schedule.slot);
 m.phase='spent';m.effect=Object.keys(MYSTERY_EFFECTS)[Math.min(2,Math.floor(rng()*3))];m.effectMs=round.rules?.candyDurationMs??5000;m.effectStartedAtMs=m.elapsedMs;
 if(m.schedule)m.schedule.cooldownUntilMs=m.elapsedMs+m.effectMs+8000;
 return m.effect;
}
// Each window is generated once. Consumed and skipped slots never reappear.
function advanceScheduledMystery(m,ended){
 const s=m.schedule;
 if(ended){m.phase='spent';m.effect=null;m.effectMs=0;return;}
 for(let i=s.slot;i<s.windows.length;i++){
  s.slot=i;
  if(s.consumed.includes(i)||s.skipped.includes(i))continue;
  const [start,end]=s.windows[i],opens=Math.max(start,s.cooldownUntilMs),closes=Math.min(end,s.durationMs-s.effectDurationMs);
  m.spawnAtMs=opens;
  if(closes-opens<2000||m.elapsedMs>=closes){s.skipped.push(i);continue;}
  m.phase=m.effectMs===0&&m.elapsedMs>=opens?'available':'waiting';return;
 }
 s.slot=s.windows.length;m.phase=s.windows.length?'spent':'absent';
}
export function skipMystery(m){
 if(m.schedule&&!m.schedule.skipped.includes(m.schedule.slot))m.schedule.skipped.push(m.schedule.slot);
 m.phase='spent';
}
export function mysteryRecoveryOK(m,{rules,durationMs=60000,elapsed,required=rules.pickupSchedulerVersion===1}={}){
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
 if(!object(m)||Object.keys(m).some(k=>!['phase','spawnAtMs','elapsedMs','effect','effectMs','wrapper','effectStartedAtMs','schedule'].includes(k))||!['waiting','absent','available','spent'].includes(m.phase)||!finite(m.elapsedMs,0,required?durationMs:1e9)||required&&Math.abs(m.elapsedMs-elapsed)>1||!['speed','dizzy','waves',null].includes(m.effect)||!finite(m.effectMs,0,rules.candyDurationMs)||!!m.effect!==(m.effectMs>0)||!object(m.wrapper)||Object.keys(m.wrapper).some(k=>!['colour','pattern'].includes(k))||!integer(m.wrapper.colour,0,3)||!integer(m.wrapper.pattern,0,2)||m.effectStartedAtMs!==undefined&&!finite(m.effectStartedAtMs,0,m.elapsedMs))return false;
 if(!required)return m.schedule===undefined&&integer(m.spawnAtMs,12000,39999);
 const s=m.schedule,max=rules.candyMagnet?2:1;
 if(!object(s)||Object.keys(s).some(k=>!['version','windows','consumed','skipped','slot','cooldownUntilMs','durationMs','effectDurationMs'].includes(k))||s.version!==1||s.durationMs!==durationMs||s.effectDurationMs!==rules.candyDurationMs||!Array.isArray(s.windows)||s.windows.length>max||rules.candyMagnet&&s.windows.length<1||!integer(s.slot,0,s.windows.length)||!finite(s.cooldownUntilMs,0,durationMs+8000)||!finite(m.spawnAtMs,12000,durationMs+8000))return false;
 if(!s.windows.every((pair,i)=>Array.isArray(pair)&&pair.length===2&&integer(pair[0],12000,i===0?(rules.candyMagnet?23999:39999):43999)&&pair[1]===pair[0]+10000&&(i===0||pair[0]===s.windows[0][0]+20000)))return false;
 for(const key of ['consumed','skipped'])if(!Array.isArray(s[key])||new Set(s[key]).size!==s[key].length||!s[key].every(i=>integer(i,0,s.windows.length-1)))return false;
 if(s.consumed.some(i=>s.skipped.includes(i))||(!s.consumed.length&&s.cooldownUntilMs!==0)||m.effectMs>0&&Math.abs(s.cooldownUntilMs-(elapsed+m.effectMs+8000))>1)return false;
 if(m.phase==='available'&&(m.effectMs>0||s.slot>=s.windows.length||s.consumed.includes(s.slot)||s.skipped.includes(s.slot)||elapsed<s.cooldownUntilMs))return false;
 return true;
}
export function mysterySpeed(m){return m.effect==='speed'&&m.effectMs>0?750:300;}
export function mysteryDirection(m,d){
 if(m.effect!=='dizzy'||m.effectMs<=0||(!d.x&&!d.y))return d;
 return {x:-d.x||0,y:-d.y||0};
}
export function findCandySpawn(stage,avoid,rng=Math.random){
 for(let i=0;i<12;i++){
  const p=findSpawn(stage,rng,avoid);
  if(isOpen(p,24,stage.obstacles)&&movementFactor(p,stage.mud,0,stage.obstacles)===1&&avoid.every(a=>Math.hypot(p.x-a.x,p.y-a.y)>(a.radius??45)))return p;
 }
 return null;
}

export function mysteryTarget(m,player,target,options={}){
 if(m.effect!=='dizzy'||m.effectMs<=0)return options.playBounds?clampToArena(target,options):{...target};
 // Mirror input once so destination movement still has an achievable endpoint.
 return clampToArena({x:2*player.x-target.x,y:2*player.y-target.y},options);
}
