import {getTiming} from './stage-clock.js';
export const CLOCK_CHOICES=Object.freeze([
 ['generic-60-v1','Generic · 120 BPM · 60s'],['smf-living-room','Living Room · 112 BPM · 68.571s'],['smf-fractal','Fractal · 120 BPM · 64s'],['smf-grove','Grove · 132 BPM · 58.182s'],['smf-amp','AMP · 140 BPM · 54.857s'],['smf-pagoda','Pagoda · 128 BPM · 60s'],['smf-village','Village · 172 BPM · 66.977s'],
].map(([id,label])=>Object.freeze({id:id==='generic-60-v1'?id:`${id}-clock-preview-1`,label})));
function practiceStage(){return {id:'clock-lab',name:'Clock practice',target:0,spawn:{x:480,y:400},crowdAnchors:[[260,290],[450,250],[670,290],[320,480],[600,480]],obstacles:[{x:120,y:290,width:60,height:65},{x:780,y:290,width:60,height:65}],mud:[],palette:{wash:0x778899,accent:0xa6c3d5},flowSpawns:[{x:390,y:330},{x:610,y:420}]};}
export function diagnosticVoices({timing,step,phase}){
 if(phase==='ended')return [];
 const voices=[];
 if(step%timing.stepsPerBeat===0)voices.push({kind:'kick',frequency:100,endFrequency:45,duration:.12,type:'sine',volume:phase==='drop'?.08:.05});
 if(step%(timing.stepsPerBeat*4)===0)voices.push({kind:'bar',frequency:phase==='drop'?660:440,duration:.1,type:'sine',volume:.025});
 if(step%timing.stepsPerBeat===timing.stepsPerBeat/2)voices.push({kind:'hat',noise:true,filter:7500,duration:.025,volume:.012});
 return voices;
}
export function createClockPractice({createSession,choices=CLOCK_CHOICES,resolveStage=practiceStage,initialId=choices===CLOCK_CHOICES?CLOCK_CHOICES[1].id:choices[0]?.id}){
 const resolve=id=>{const choice=choices.find(c=>c.id===id);if(!choice)throw new Error('Unknown practice choice');return {timing:getTiming(choice.timingId??choice.id),stage:resolveStage(id)};};
 let selected=resolve(initialId),session=null,state='ready';
 const lab={get timing(){return selected.timing},get stage(){return selected.stage},get state(){return state},
 start(){session?.destroy();session=createSession();state='playing';session.start({stage:selected.stage,timingId:selected.timing.id});},
 select(id){selected=resolve(id);lab.start();},
 pause(){if(state==='playing'){session.pause();state='paused';}},
 resume(){if(state==='paused'){session.resume();state='playing';}},
 finish(){session?.pause();state='ended';},
 destroy(){session?.destroy();session=null;state='ready';},
 };
 return lab;
}

// One Phaser game per document: Phaser does not remove its core visibility
// listener on destroy. Round resets must reuse it rather than create another.
export function createPracticeEngine(createGame){
 let engine=null;
 return {createSession(){
  engine??=createGame();const owned=engine;
  return {start:config=>owned.start(config),pause:()=>owned.pause(),resume:()=>owned.resume(),destroy:()=>owned.pause()};
 },destroy(){engine?.destroy();engine=null;}};
}
export function handlePracticePageHide(event,{pause,dispose}){
 if(event.persisted)pause();else dispose();
}
