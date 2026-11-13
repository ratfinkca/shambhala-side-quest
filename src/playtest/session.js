import {createRunId} from '../run-id.js';
import {createRunSummary,createInputTracker} from './summary.js';
import {createPlaytestTransport} from './transport.js';
import {GENERIC_RULES,GENERIC_SCORING_VERSION} from '../../supabase/functions/_shared/edition-rules.js';
export function createPlaytestSession({config,consent,send,uuid=()=>createRunId(),width=()=>innerWidth}){
 let sessionId=null,run=null,summary=null,input=createInputTracker(),ended=false,lastFinished=-1,lastChoice=-1;
 let recovered=false;
 const enabled=()=>!recovered&&!!config.enabled&&consent.enabled();
 const transport=createPlaytestTransport({send,consent:enabled});
 function emit(type,payload,theme=run?.themeId||'forest-freakout'){
  if(!enabled())return;
  if(!consent.identity())consent.set('accepted');
  sessionId??=uuid();
  const isMenu=type==='menu';
  return transport.enqueue({schemaVersion:!isMenu&&run.mode==='endless'?2:1,eventId:uuid(),installationId:consent.identity(),sessionId,runId:isMenu?null:run.id,type,mode:isMenu?null:run.mode,buildId:config.buildId||'dev',scoringVersion:isMenu?GENERIC_SCORING_VERSION:run.scoringVersion??GENERIC_RULES.id,theme,viewport:width()<600?'small':width()<1000?'medium':'large',inputType:isMenu?'unknown':input.inputType(),payload});
 }
 return {
  setConsent(value){
   if(value==='accepted'&&!config.enabled)return {accepted:false,persisted:false};
   const result=consent.set(value);
   if(!consent.enabled()){summary=null;sessionId=null;transport.stop();}
   return result;
  },
  start(value,replay=false){
   recovered=false;run={...value};ended=false;lastFinished=-1;lastChoice=-1;input=createInputTracker();summary=null;
   if(!enabled())return;
   summary=createRunSummary({runId:run.id,mode:run.mode,buildId:config.buildId||'dev',scoringVersion:run.scoringVersion??GENERIC_RULES.id});
   emit('run_start',{});if(replay)emit('replay',{});
  },
  recover(){recovered=true;summary=null;run=null;sessionId=null;transport.stop();},
  input:(kind,runId=run?.id)=>{if(runId===run?.id)input.recordInput(kind);},
  inputType:()=>input.inputType(),
  stageStart(index,variationId){const stage={stageIndex:index,...(run?.mode==='endless'&&variationId?{variationId}:{})};if(summary?.record('start',{runId:run.id,...stage}))emit('stage_start',stage);},
  record(type,payload={}){if(payload.runId&&payload.runId!==run?.id)return;summary?.record(type,{...payload,runId:run.id});},
  perk(perk){if(!summary)return;summary.record('perk',{runId:run.id,perk});emit('perk',{perk});},
  finishStage(index,result){const stage=summary?.finishStage(index,result);if(stage){lastFinished=index;emit('stage_end',stage);}},
  choice(value,action,perk=null,replaced=null){
   if(!summary||ended||run.mode!=='endless'||value.id!==run.id||lastFinished<0||value.stageIndex!==lastFinished+1||lastChoice===lastFinished)return;
   if(emit('perk_choice',{stageIndex:lastFinished,action,perk,replaced,activePerks:[...value.perks]}))lastChoice=lastFinished;
  },
  end(value,outcome='complete'){
   if(!summary||ended||value.id!==run?.id)return;ended=true;summary.record(outcome==='exit'?'exit':'complete',{runId:run.id});
   if(run.mode==='endless')outcome=value.endedVoluntarily?'banked':outcome==='exit'?'exit':'failed';
   emit('run_end',{outcome,stagesCleared:value.stagesCleared,totalScore:value.totalScore});
  },
  menu(action,theme){emit('menu',{action},theme);},
  flush:()=>transport.flush(),
  stop(){summary=null;transport.stop();},
 };
}
