import {findSpawn,isOpen,movementFactor} from './geometry.js';

export const MYSTERY_EFFECTS={
 speed:{name:'SUGAR RUSH',hint:'Super speed · 2.5×'},
 dizzy:{name:'DIZZY',hint:'Your steering has a wobble'},
 waves:{name:'WAVY COLOURS',hint:'A different kind of scenery'},
};
export function createMystery(rng=Math.random){
 const scheduled=rng()<.8;
 return {phase:scheduled?'waiting':'absent',spawnAtMs:12000+Math.floor(rng()*28000),elapsedMs:0,effect:null,effectMs:0,wrapper:{colour:Math.floor(rng()*4),pattern:Math.floor(rng()*3)}};
}
export function advanceMystery(m,dt,ended=false){
 m.elapsedMs+=Math.max(0,dt);
 m.effectMs=Math.max(0,m.effectMs-Math.max(0,dt));
 if(m.effectMs===0)m.effect=null;
 if(m.phase==='waiting'&&m.elapsedMs>=m.spawnAtMs)m.phase='available';
 if(m.phase==='available'&&m.elapsedMs>=m.spawnAtMs+10000)m.phase='spent';
 if(ended){m.phase='spent';m.effect=null;m.effectMs=0;}
}
export function collectMystery(round,rng=Math.random){
 const m=round.mystery;
 if(round.ended||m.phase!=='available'||m.effectMs>0)return null;
 m.phase='spent';m.effect=Object.keys(MYSTERY_EFFECTS)[Math.min(2,Math.floor(rng()*3))];m.effectMs=5000;
 return m.effect;
}
export function mysterySpeed(m){return m.effect==='speed'&&m.effectMs>0?750:300;}
export function mysteryDirection(m,d,targetDistance=Infinity){
 if(m.effect!=='dizzy'||m.effectMs<=0||(!d.x&&!d.y))return d;
 // Same steering rotation for keys and destinations; taper near a destination.
 const angle=Math.sin(m.elapsedMs*.004)*.4*Math.min(1,targetDistance/40);
 return {x:d.x*Math.cos(angle)-d.y*Math.sin(angle),y:d.x*Math.sin(angle)+d.y*Math.cos(angle)};
}
export function findCandySpawn(stage,avoid,rng=Math.random){
 for(let i=0;i<12;i++){
  const p=findSpawn(stage,rng,avoid);
  if(isOpen(p,24,stage.obstacles)&&movementFactor(p,stage.mud,0,stage.obstacles)===1&&avoid.every(a=>Math.hypot(p.x-a.x,p.y-a.y)>(a.radius??45)))return p;
 }
 return null;
}
