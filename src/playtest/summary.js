export function createInputTracker(){
  const used=new Set();
  return {recordInput(kind){if(['mouse','touch','keyboard'].includes(kind))used.add(kind);},inputType(){return used.size>1?'mixed':used.values().next().value||'unknown';}};
}
const stageSummary=stageIndex=>({stageIndex,activeMs:0,bassMs:0,chargeMs:0,pickups:0,bumps:0,closePasses:0,clearanceBins:[0,0,0],minClearance:null,peakCombo:0,flowUses:0,bassUses:0,candies:{speed:0,dizzy:0,waves:0},score:0,qualified:false,finished:false});
export function createRunSummary({runId,mode,buildId,scoringVersion}){
  const data={runId,mode,buildId,scoringVersion,outcome:'unknown',stages:[],perks:[]};let current;
  return {
    record(type,payload={}){
      if(payload.runId!==runId||data.outcome!=='unknown')return;
      if(type==='start'){
        if(!Number.isInteger(payload.stageIndex)||payload.stageIndex!==data.stages.length||payload.stageIndex>2)return;
        current=stageSummary(payload.stageIndex);data.stages.push(current);return;
      }
      if(type==='exit'||type==='complete'){data.outcome=type;return;}
      if(type==='perk'&&['boots','noodle','moth','bracelet'].includes(payload.perk)&&!data.perks.includes(payload.perk)){data.perks.push(payload.perk);return;}
      if(!current||current.finished)return;
      if(type==='tick')for(const key of ['activeMs','bassMs','chargeMs']){const n=payload[key];if(Number.isFinite(n)&&n>=0)current[key]=Math.min(60000,current[key]+n);}
      if(type==='pickup'){current.pickups++;current.peakCombo=Math.max(current.peakCombo,payload.chain||0);}
      if(type==='bump')current.bumps++;
      if(type==='bass')current.bassUses++;
      if(type==='flow')current.flowUses++;
      if(type==='candy'&&Object.hasOwn(current.candies,payload.effect))current.candies[payload.effect]++;
      if(type==='closepass'&&Number.isFinite(payload.clearance)&&payload.clearance>=0&&payload.clearance<=21){
        const d=payload.clearance;current.closePasses++;current.clearanceBins[d<7?0:d<14?1:2]++;current.minClearance=Math.min(current.minClearance??21,d);
      }
    },
    finishStage(index,{score=0,qualified=false}={}){
      if(!current||current.stageIndex!==index||current.finished)return null;
      current.finished=true;current.score=score;current.qualified=qualified;return structuredClone(current);
    },
    snapshot:()=>structuredClone(data),
  };
}
