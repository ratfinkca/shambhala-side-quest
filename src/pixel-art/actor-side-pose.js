// The stance foot moves backwards relative to the travelling body; the other
// leg swings forwards. The second leg is always exactly half a cycle later.
const WALK=[[7,0],[2,0],[-5,0],[-7,-2],[-1,-7],[5,-4]];
const RUN=[[10,0],[2,0],[-7,-4],[-10,-7],[0,-10],[8,-6]];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function sideRigJoint(a,b,first,second,bend=1){
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
 if(d<.001)return {x:a.x+first*bend,y:a.y};
 const reach=Math.min(d,first+second-.001),along=(first*first-second*second+reach*reach)/(2*reach),height=Math.sqrt(Math.max(0,first*first-along*along));
 return {x:a.x+dx/d*along+dy/d*height*bend,y:a.y+dy/d*along-dx/d*height*bend};
}
export function sideRigPose(clip,index=0,{carrying=false}={}){
 const running=clip==='runRight',step=((index%6)+6)%6,table=running?RUN:WALK;
 return composePose(running,step,table,(running?[0,1,-2]:[0,1,-1])[step%3],carrying);
}
export function sideRigRestPose({carrying=false}={}){return {...composePose(false,0,[[2,0],[2,0],[2,0],[-2,0],[-2,0],[-2,0]],0,carrying),rest:true};}
function composePose(running,step,table,bob,carrying=false){
 const hip={x:0,y:-13+bob},shoulder={x:0,y:-24+bob};
 const limb=(phase,near=false)=>{
  const [x,y]=table[phase],foot={x,y},ankle={x,y:y-2};
  const held=carrying&&near,wrist=held?{x:10,y:-17+bob}:{x:1-x*.55,y:-17+bob-(running?Math.max(0,-y)*.25:0)},armLength=held?6.25:6;
  return {phase,foot,ankle,knee:sideRigJoint(hip,ankle,8,8),wrist,elbow:sideRigJoint(shoulder,wrist,armLength,armLength,-1),shoeAngle:y===0?0:clamp(-x*.025,-.25,.25)};
 };
 return {step,running,bob,carrying,hip,shoulder,neck:{x:1,y:-27+bob},near:limb(step,true),far:limb((step+3)%6)};
}
