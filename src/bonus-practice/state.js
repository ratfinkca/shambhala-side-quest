// Activity state never touches a profile, service, score, clock or browser API.
export function createBonusPractice(config){
 const fresh=()=>({progress:0,goal:config.goal,complete:false,collectedIds:[],visitedIds:[],greetedIds:[],carrying:null});
 let state=fresh(),status='ready';
 const near=(player,point)=>player&&point&&Number.isFinite(player.x)&&Number.isFinite(player.y)&&Math.hypot(player.x-point.x,player.y-point.y)<=point.radius;
 function progress(type,id){
  state.progress++;
  if(state.progress>=state.goal){state.complete=true;status='complete';return {type:'complete',id,...(config.reward?{reward:config.reward}:{})};}
  return {type,id};
 }
 return {
  get state(){return state;},get status(){return status;},
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
