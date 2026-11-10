import {createPuttingPractice} from './putting-state.js';
// Activity state never touches a profile, service, score, clock or browser API.
export function createBonusPractice(config){
 if(config.activity==='putt')return createPuttingPractice();
 const fresh=()=>({progress:0,goal:config.goal,complete:false,collectedIds:[],visitedIds:[],greetedIds:[],carrying:null});
 let state=fresh(),status='ready';
 const keys=(value,names)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===names.length&&names.every(name=>Object.hasOwn(value,name));
 const ids=(value,allowed,max)=>Array.isArray(value)&&value.length<=max&&new Set(value).size===value.length&&value.every(id=>allowed.includes(id));
 const pointIds=config.points.map(point=>point.id),dancerIds=config.stage.crowdAnchors.map((_,i)=>`dancer-${i}`);
 function restore(snapshot){
  if(!keys(snapshot,['version','kind','venueId','activity','status','state'])||snapshot.version!==1||snapshot.kind!=='bonus'||snapshot.venueId!==config.id||snapshot.activity!==config.activity||!['ready','playing','paused','complete','ended'].includes(snapshot.status))return false;
  const s=snapshot.state;
  if(!keys(s,Object.keys(fresh()))||!Number.isInteger(s.progress)||s.progress<0||s.progress>config.goal||s.goal!==config.goal||typeof s.complete!=='boolean'||s.complete!==(s.progress===config.goal)||(snapshot.status==='complete')!==s.complete)return false;
  if(!ids(s.collectedIds,pointIds,config.goal)||!ids(s.visitedIds,pointIds,config.goal)||!ids(s.greetedIds,dancerIds,config.goal))return false;
  if(config.activity==='trail'||config.activity==='garden'){
   if(s.visitedIds.length||s.greetedIds.length)return false;
   const held=config.activity==='garden'&&s.carrying!==null;
   if(held?(s.progress>=config.goal||s.carrying!==pointIds[s.progress]):s.carrying!==null)return false;
   if(s.collectedIds.length!==s.progress+Number(held)||s.collectedIds.some((id,i)=>id!==pointIds[i]))return false;
  }else if(config.activity==='greet'){
   if(s.carrying!==null||s.collectedIds.length||s.visitedIds.length||s.greetedIds.length!==s.progress)return false;
  }else if(config.activity==='explore'){
   if(s.carrying!==null||s.collectedIds.length||s.greetedIds.length||s.visitedIds.length!==s.progress)return false;
  }else return false;
  if(snapshot.status==='ready'&&(s.progress!==0||s.carrying!==null||s.collectedIds.length||s.visitedIds.length||s.greetedIds.length))return false;
  state=structuredClone(s);status=snapshot.status==='playing'?'paused':snapshot.status;return true;
 }
 const near=(player,point)=>player&&point&&Number.isFinite(player.x)&&Number.isFinite(player.y)&&Math.hypot(player.x-point.x,player.y-point.y)<=point.radius;
 function progress(type,id){
  state.progress++;
  if(state.progress>=state.goal){state.complete=true;status='complete';return {type:'complete',id,...(config.reward?{reward:config.reward}:{})};}
  return {type,id};
 }
 return {
  get state(){return state;},get status(){return status;},
  capture(){return {version:1,kind:'bonus',venueId:config.id,activity:config.activity,status,state:structuredClone(state)};},
  restore,
  start(){state=fresh();status='playing';},
  pause(){if(status==='playing')status='paused';},
  resume(){if(status==='paused')status='playing';},
  finish(){if(status==='playing'||status==='paused')status='ended';},
  step({player,encounters=[]}={}){
   if(status!=='playing')return null;
   if(config.activity==='greet'){
    // An overlapping collision takes precedence over a clean exit elsewhere.
    if(encounters.some(e=>e.bumped))return null;
    const clean=encounters.find(e=>e.closePass&&!state.greetedIds.includes(e.id)&&config.stage.crowdAnchors.some((_,i)=>e.id===`dancer-${i}`));
    if(!clean)return null;
    state.greetedIds.push(clean.id);return progress('greeted',clean.id);
   }
   if(config.activity==='explore'){
    const point=config.points.find(p=>!state.visitedIds.includes(p.id)&&near(player,p));
    if(!point)return null;
    state.visitedIds.push(point.id);return progress('visited',point.id);
   }
   if(config.activity==='garden'&&state.carrying){
    if(!near(player,config.bed))return null;
    const id=state.carrying;state.carrying=null;return progress('planted',id);
   }
   const point=config.points[state.progress];
   if(!point||state.collectedIds.includes(point.id)||!near(player,point))return null;
   state.collectedIds.push(point.id);
   if(config.activity==='garden'){state.carrying=point.id;return {type:'pickup',id:point.id};}
   return progress('collected',point.id);
  },
 };
}
