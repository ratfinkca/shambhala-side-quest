import {createRun,startStage,finishStage,keepPerks,stageFor} from '../../src/run.js';
import {createRound,collect} from '../../src/game.js';
import {createEncounter} from '../../src/festival.js';
export function recoveryFixture(count=0,scoringVersion){
 const run=createRun('endless','00000000-0000-4000-8000-000000000001','moonlit-mycelium');if(scoringVersion){run.scoringVersion=scoringVersion;if(scoringVersion!=='arcade-v3')delete run.challenge;}run.buildId='original-build';run.availablePerks=['boots','bracelet'];
 for(let i=0;i<count;i++){const c=startStage(run),r=createRound(c.rules);while(r.pickups<c.stage.target)collect(r);r.remainingMs=0;r.ended=true;finishStage(run,r);keepPerks(run);}
 const c=startStage(run),round=createRound(c.rules);round.runId=run.id;round.remainingMs=44000;collect(round);round.sincePickupMs=null;round.mystery.elapsedMs=16000;
 const scene={round,player:{x:480,y:400},sparks:Array.from({length:12},(_,i)=>({x:100+i*50,y:200})),candy:{placed:false,x:0,y:0},crowd:stageFor(run).crowdAnchors.map(()=>createEncounter())};
 delete round.rules;
 return {run,screen:{name:'playing'},scene,summary:null,resultSnapshot:null,progressReward:null,submission:null,inputType:'touch',buildId:'original-build',now:1000};
}
