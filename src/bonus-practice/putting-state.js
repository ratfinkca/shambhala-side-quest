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

function segmentDistance(a,b,p){
 const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
 const t=len?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len)):0;
 return Math.hypot(a.x+dx*t-p.x,a.y+dy*t-p.y);
}

export function createPuttingPractice(){
 const physics=PUTTING_PHYSICS;
 const fresh=()=>({
  progress:0,goal:2,complete:false,collectedIds:[],visitedIds:[],greetedIds:[],carrying:null,
  holeIndex:0,strokes:0,ball:{...PUTTING_HOLES[0].tee,vx:0,vy:0},phase:'aim',elapsedMs:0,
 });
 let state=fresh(),status='ready',remainder=0,ticks=0;
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
  start(){state=fresh();status='playing';remainder=0;ticks=0;},
  pause(){if(status==='playing')status='paused';},
  resume(){if(status==='paused')status='playing';},
  finish(){if(status==='playing'||status==='paused')exhaust();},
  step(){return null;},
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
   state.holeIndex++;state.ball={...PUTTING_HOLES[state.holeIndex].tee,vx:0,vy:0};state.phase='aim';return true;
  },
 };
}
