import {createRunSummary,createInputTracker} from './summary.js';
import {createPlaytestTransport} from './transport.js';
export function createPlaytestSession({config,consent,send,uuid=()=>crypto.randomUUID(),width=()=>innerWidth}){
 let sessionId=null,run=null,summary=null,input=createInputTracker(),ended=false;
 const enabled=()=>!!config.enabled&&consent.enabled();
 const transport=createPlaytestTransport({send,consent:enabled});
 function emit(type,payload,theme=run?.themeId||'forest-freakout'){
  if(!enabled())return;
  if(!consent.identity())consent.set('accepted');
  sessionId??=uuid();
  const isMenu=type==='menu';
  transport.enqueue({schemaVersion:1,eventId:uuid(),installationId:consent.identity(),sessionId,runId:isMenu?null:run.id,type,mode:isMenu?null:run.mode,buildId:config.buildId||'dev',scoringVersion:'arcade-v1',theme,viewport:width()<600?'small':width()<1000?'medium':'large',inputType:isMenu?'unknown':input.inputType(),payload});
 }
 return {
  setConsent(value){
   if(value==='accepted'&&!config.enabled)return {accepted:false,persisted:false};
   const result=consent.set(value);
   if(!consent.enabled()){summary=null;sessionId=null;transport.stop();}
   return result;
  },
  start(value,replay=false){
   run={...value};ended=false;input=createInputTracker();summary=null;
   if(!enabled())return;
   summary=createRunSummary({runId:run.id,mode:run.mode,buildId:config.buildId||'dev',scoringVersion:'arcade-v1'});
   emit('run_start',{});if(replay)emit('replay',{});
  },
  input:(kind,runId=run?.id)=>{if(runId===run?.id)input.recordInput(kind);},
  inputType:()=>input.inputType(),
  stageStart(index){if(!summary)return;summary.record('start',{runId:run.id,stageIndex:index});emit('stage_start',{stageIndex:index});},
  record(type,payload={}){if(payload.runId&&payload.runId!==run?.id)return;summary?.record(type,{...payload,runId:run.id});},
  perk(perk){if(!summary)return;summary.record('perk',{runId:run.id,perk});emit('perk',{perk});},
  finishStage(index,result){const stage=summary?.finishStage(index,result);if(stage)emit('stage_end',stage);},
  end(value,outcome='complete'){
   if(!summary||ended||value.id!==run?.id)return;ended=true;summary.record(outcome==='exit'?'exit':'complete',{runId:run.id});
   emit('run_end',{outcome,stagesCleared:value.stagesCleared,totalScore:value.totalScore});
  },
  menu(action,theme){emit('menu',{action},theme);},
  flush:()=>transport.flush(),
  stop(){summary=null;transport.stop();},
 };
}
