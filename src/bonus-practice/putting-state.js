// Disposable Villagio rules. No renderer, clock service, profile or browser access.
export const MAX_STROKES=8;
export const PUTTING_PHYSICS=Object.freeze({
 ballRadius:3.5,cupRadius:6,captureSpeed:55,maxSpeed:240,minPower:.04,
 friction:90,stopSpeed:3,restitution:.72,stepMs:1000/120,maxFrameMs:1000,
});
export const PUTTING_HOLES=Object.freeze([
 {id:'green-1',center:{x:218,y:366},radiusX:130,radiusY:38,cup:{x:225,y:359},tee:{x:145,y:378}},
 {id:'green-2',center:{x:732,y:497},radiusX:142,radiusY:51,cup:{x:732,y:486},tee:{x:820,y:517}},
].map(h=>Object.freeze({...h,center:Object.freeze(h.center),cup:Object.freeze(h.cup),tee:Object.freeze(h.tee)})));

export function isOnPuttingGreen(player,holeIndex){
 const hole=PUTTING_HOLES[holeIndex];
 return !!hole&&Number.isFinite(player?.x)&&Number.isFinite(player?.y)&&
  ((player.x-hole.center.x)/hole.radiusX)**2+((player.y-hole.center.y)/hole.radiusY)**2<=1;
}
export function isPuttingCloseUp(state){return state?.phase==='aim'||state?.phase==='rolling';}

function segmentDistance(a,b,p){
 const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
 const t=len?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len)):0;
 return Math.hypot(a.x+dx*t-p.x,a.y+dy*t-p.y);
}

export function createPuttingPractice(){
 const physics=PUTTING_PHYSICS;
 const fresh=()=>({
  progress:0,goal:2,complete:false,collectedIds:[],visitedIds:[],greetedIds:[],carrying:null,
  holeIndex:0,strokes:0,ball:{...PUTTING_HOLES[0].tee,vx:0,vy:0},phase:'walking',elapsedMs:0,
 });
 let state=fresh(),status='ready',remainder=0,ticks=0;
 const keys=(value,names)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===names.length&&names.every(name=>Object.hasOwn(value,name));
 function restore(snapshot){
  if(!keys(snapshot,['version','kind','status','state','remainderMs','ticks'])||snapshot.version!==1||snapshot.kind!=='putting'||!['ready','playing','paused','complete','ended'].includes(snapshot.status))return false;
  const s=snapshot.state;
  if(!keys(s,Object.keys(fresh()))||s.goal!==2||!Number.isInteger(s.progress)||s.progress<0||s.progress>2||!Number.isInteger(s.holeIndex)||s.holeIndex<0||s.holeIndex>=PUTTING_HOLES.length||!Number.isInteger(s.strokes)||s.strokes<s.progress||s.strokes>MAX_STROKES||!['walking','aim','rolling','between','won','lost'].includes(s.phase))return false;
  if(typeof s.complete!=='boolean'||s.complete!==(s.phase==='won')||(snapshot.status==='complete')!==s.complete||(snapshot.status==='ended')!==(s.phase==='lost'))return false;
  if(!Array.isArray(s.collectedIds)||s.collectedIds.length||!Array.isArray(s.greetedIds)||s.greetedIds.length||s.carrying!==null||!Array.isArray(s.visitedIds)||s.visitedIds.length!==s.progress||s.visitedIds.some((id,i)=>id!==PUTTING_HOLES[i].id))return false;
  if(!Number.isInteger(snapshot.ticks)||snapshot.ticks<0||snapshot.ticks>7*24*60*60*120||!Number.isFinite(s.elapsedMs)||s.elapsedMs!==snapshot.ticks*1000/120||!Number.isFinite(snapshot.remainderMs)||snapshot.remainderMs<0||snapshot.remainderMs>=physics.stepMs)return false;
  const b=s.ball,h=PUTTING_HOLES[s.holeIndex];
  if(!keys(b,['x','y','vx','vy'])||!Object.values(b).every(Number.isFinite))return false;
  const speed=Math.hypot(b.vx,b.vy),inside=((b.x-h.center.x)/(h.radiusX-physics.ballRadius))**2+((b.y-h.center.y)/(h.radiusY-physics.ballRadius))**2;
  if(inside>1.000001||speed>physics.maxSpeed+1e-8||(s.phase!=='rolling'&&speed!==0))return false;
  if(s.strokes===0&&(b.x!==h.tee.x||b.y!==h.tee.y))return false;
  if(s.phase==='rolling'&&(speed<=physics.stopSpeed||s.progress!==s.holeIndex||s.strokes<s.holeIndex+1))return false;
  if(s.phase==='aim'&&(s.progress!==s.holeIndex||s.strokes<s.holeIndex||s.strokes>=MAX_STROKES))return false;
  if(s.phase==='walking'&&(s.progress!==s.holeIndex||s.strokes<s.holeIndex||s.strokes>=MAX_STROKES||b.x!==h.tee.x||b.y!==h.tee.y))return false;
  if(s.phase==='between'&&(s.holeIndex!==0||s.progress!==1||s.strokes<1||s.strokes>=MAX_STROKES||b.x!==h.cup.x||b.y!==h.cup.y))return false;
  if(s.phase==='won'&&(s.holeIndex!==1||s.progress!==2||s.strokes<2||b.x!==h.cup.x||b.y!==h.cup.y))return false;
  if(s.phase==='lost'&&(s.progress!==s.holeIndex&&!(s.holeIndex===0&&s.progress===1&&s.strokes===MAX_STROKES)))return false;
  // Existing v1 checkpoints began directly on the first green. Keep those
  // legitimate ready/aim snapshots while new visits begin in the whole venue.
  if(snapshot.status==='ready'&&(!['walking','aim'].includes(s.phase)||s.strokes||s.progress||s.holeIndex||s.elapsedMs||snapshot.remainderMs||b.x!==h.tee.x||b.y!==h.tee.y))return false;
  state=structuredClone(s);remainder=snapshot.remainderMs;ticks=snapshot.ticks;status=snapshot.status==='playing'?'paused':snapshot.status;return true;
 }
 function exhaust(){
  state.phase='lost';status='ended';state.ball.vx=0;state.ball.vy=0;
  return {type:'exhausted',strokes:state.strokes};
 }
 function sink(hole){
  state.ball={...hole.cup,vx:0,vy:0};state.progress++;state.visitedIds.push(hole.id);
  if(state.progress===state.goal){
   state.complete=true;state.phase='won';status='complete';
   return {type:'complete',id:hole.id,reward:'Golden Chicken Totem',strokes:state.strokes};
  }
  if(state.strokes>=MAX_STROKES)return exhaust();
  state.phase='between';return {type:'holed',id:hole.id,strokes:state.strokes};
 }
 function stepBall(){
  const h=PUTTING_HOLES[state.holeIndex],b=state.ball,dt=physics.stepMs/1000;
  const old={x:b.x,y:b.y},speed=Math.hypot(b.vx,b.vy),nextSpeed=Math.max(0,speed-physics.friction*dt);
  const distance=(speed+nextSpeed)*.5*dt,ux=speed?b.vx/speed:0,uy=speed?b.vy/speed:0;
  b.x+=ux*distance;b.y+=uy*distance;b.vx=ux*nextSpeed;b.vy=uy*nextSpeed;
  if(nextSpeed<=physics.captureSpeed&&segmentDistance(old,b,h.cup)<=physics.cupRadius)return sink(h);

  // Inset the playable ellipse by the ball radius, then reflect at its normal.
  // At120Hz the maximum travel is2 world pixels, below either cup or ball radius.
  const rx=h.radiusX-physics.ballRadius,ry=h.radiusY-physics.ballRadius;
  const dx=b.x-h.center.x,dy=b.y-h.center.y,q=(dx/rx)**2+(dy/ry)**2;
  if(q>1){
   const scale=(1-1e-7)/Math.sqrt(q);b.x=h.center.x+dx*scale;b.y=h.center.y+dy*scale;
   const nx=(b.x-h.center.x)/(rx*rx),ny=(b.y-h.center.y)/(ry*ry),length=Math.hypot(nx,ny),ux=nx/length,uy=ny/length;
   const outward=b.vx*ux+b.vy*uy;
   if(outward>0){b.vx=(b.vx-2*outward*ux)*physics.restitution;b.vy=(b.vy-2*outward*uy)*physics.restitution;}
  }
  if(Math.hypot(b.vx,b.vy)<=physics.stopSpeed){
   b.vx=0;b.vy=0;
   if(state.strokes>=MAX_STROKES)return exhaust();
   state.phase='aim';return {type:'settled',strokes:state.strokes};
  }
  return null;
 }
 return {
  get state(){return state;},get status(){return status;},
  capture(){return {version:1,kind:'putting',status,state:structuredClone(state),remainderMs:remainder,ticks};},
  restore,
  start(){state=fresh();status='playing';remainder=0;ticks=0;},
  pause(){if(status==='playing')status='paused';},
  resume(){if(status==='paused')status='playing';},
  finish(){if(status==='playing'||status==='paused')exhaust();},
  step({player}={}){
   if(status!=='playing'||state.phase!=='walking'||!isOnPuttingGreen(player,state.holeIndex))return null;
   state.phase='aim';return {type:'green-entered',id:PUTTING_HOLES[state.holeIndex].id};
  },
  shoot(vector){
   if(status!=='playing'||state.phase!=='aim'||state.strokes>=MAX_STROKES||!Number.isFinite(vector?.x)||!Number.isFinite(vector?.y))return null;
   const magnitude=Math.hypot(vector.x,vector.y);
   if(!Number.isFinite(magnitude)||magnitude<physics.minPower)return null;
   const speed=Math.min(1,magnitude)*physics.maxSpeed;
   state.ball.vx=vector.x/magnitude*speed;state.ball.vy=vector.y/magnitude*speed;
   state.strokes++;state.phase='rolling';
   return {type:'shot',id:PUTTING_HOLES[state.holeIndex].id,strokes:state.strokes};
  },
  advance(deltaMs){
   if(status!=='playing'||!Number.isFinite(deltaMs)||deltaMs<=0)return null;
   // Normal frames are consumed in full; anomalous >1s gaps are deliberately
   // capped so a missed page-hide event cannot simulate an unbounded backlog.
   remainder+=Math.min(deltaMs,physics.maxFrameMs);let event=null;
   while(remainder+1e-8>=physics.stepMs&&status==='playing'){
    remainder=Math.max(0,remainder-physics.stepMs);state.elapsedMs=++ticks*1000/120;
    if(state.phase==='rolling')event=stepBall()||event;
   }
   if(status!=='playing')remainder=0;
   return event;
  },
  nextHole(){
   if(status!=='playing'||state.phase!=='between'||state.holeIndex>=PUTTING_HOLES.length-1||state.strokes>=MAX_STROKES)return false;
   state.holeIndex++;state.ball={...PUTTING_HOLES[state.holeIndex].tee,vx:0,vy:0};state.phase='walking';return true;
  },
 };
}
