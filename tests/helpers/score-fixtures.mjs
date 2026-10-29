export const fixture=()=>({runId:'00000000-0000-4000-8000-000000000001',ticket:'a'.repeat(64),initials:'ABC',mode:'rush',scoringVersion:'arcade-v1',buildId:'test',inputType:'mixed',totalScore:10,stagesCleared:1,stages:[{stageIndex:0,activeMs:60000,pickups:1,closePasses:0,score:10,perks:[],sparks:[1,...Array(19).fill(0)],passes:[0,0]}]});

export async function endlessFixture(){
 const {createRound,collect}=await import('../../src/game.js');
 const {createRun,startStage,finishStage,chooseUpgrade,keepPerks}=await import('../../src/run.js');
 const run=createRun('endless',fixture().runId);
 for(let i=0;i<9;i++){
  const config=startStage(run),r=createRound(config.rules);
  for(let n=0;n<(i===8?0:config.stage.target);n++)collect(r);
  r.remainingMs=0;r.ended=true;finishStage(run,r);
  if(i<4)chooseUpgrade(run,['boots','moth','noodle','bracelet'][i]);
  else if(i===4)chooseUpgrade(run,'surfer','moth');else if(i<8)keepPerks(run);
 }
 return {...fixture(),mode:'endless',totalScore:run.totalScore,stagesCleared:run.stagesCleared,stages:run.scoreStages};
}
