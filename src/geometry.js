export function isOpen(p,radius,obstacles){return !obstacles.some(o=>p.x>o.x-radius&&p.x<o.x+o.width+radius&&p.y>o.y-radius&&p.y<o.y+o.height+radius);}
export function pointInPolygon(p,points){
 let inside=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[j],b=points[i],dx=b.x-a.x,dy=b.y-a.y;
  // Include the visible shoreline; no hidden rectangular slowdown corners.
  const cross=(p.x-a.x)*dy-(p.y-a.y)*dx;
  if(Math.abs(cross)<1e-7&&p.x>=Math.min(a.x,b.x)&&p.x<=Math.max(a.x,b.x)&&p.y>=Math.min(a.y,b.y)&&p.y<=Math.max(a.y,b.y))return true;
  if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 return inside;
}
export const BASS_RADIUS=110,BASS_CORE=54;
export function speakerCones(o){
 const count=o.width>=90?2:1,width=o.width/count;
 return Array.from({length:count},(_,i)=>({x:o.x+width*(i+.5),y:o.y+o.height/2+4,radius:Math.min(19,width*.36)}));
}
export function bassFactor(p,speakers=[]){
 let factor=1;
 for(const o of speakers)for(const cone of speakerCones(o)){
  const distance=Math.hypot(p.x-cone.x,p.y-cone.y);
  if(distance<=BASS_RADIUS)factor=Math.min(factor,.2+.3*Math.max(0,distance-BASS_CORE)/(BASS_RADIUS-BASS_CORE));
 }
 return factor;
}
export function movementFactor(p,mud,slowedMs,speakers=[]){
 const terrain=slowedMs>0||mud.some(o=>o.points?pointInPolygon(p,o.points):!isOpen(p,0,[o]))?.5:1;
 return Math.min(terrain,bassFactor(p,speakers));
}
export function moveInArena(p,d,dt,{width=960,height=640,obstacles=[],speed=300}={}){
 const length=Math.hypot(d.x,d.y);if(!length)return;
 const travel=speed*Math.min(50,Math.max(0,dt))/1000,steps=Math.max(1,Math.ceil(travel/7));
 const dx=d.x/length*travel/steps,dy=d.y/length*travel/steps;
 for(let i=0;i<steps;i++){
  const x=Math.max(14,Math.min(width-14,p.x+dx));if(isOpen({x,y:p.y},14,obstacles))p.x=x;
  const y=Math.max(14,Math.min(height-14,p.y+dy));if(isOpen({x:p.x,y},14,obstacles))p.y=y;
 }
}
export function findSpawn(stage,rng=Math.random,avoid=[],preferBass=false){
 const safe=p=>isOpen(p,24,stage.obstacles)&&avoid.every(a=>Math.hypot(p.x-a.x,p.y-a.y)>(a.radius??45));
 if(preferBass&&stage.obstacles.length){
  for(let i=0;i<40;i++){
   const o=stage.obstacles[Math.min(stage.obstacles.length-1,Math.floor(rng()*stage.obstacles.length))];
   const side=Math.min(3,Math.floor(rng()*4)),offset=28+rng()*32,t=rng();
   const p=side<2?{x:side===0?o.x-offset:o.x+o.width+offset,y:o.y+t*o.height}:{x:o.x+t*o.width,y:side===2?o.y-offset:o.y+o.height+offset};
   if(p.x>=160&&p.x<=810&&p.y>=180&&p.y<=565&&safe(p)&&bassFactor(p,stage.obstacles)<1)return p;
  }
 }
 for(let i=0;i<50;i++){const p={x:160+rng()*650,y:180+rng()*385};if(safe(p))return p;}
 for(let y=180;y<=565;y+=24)for(let x=160;x<=810;x+=24){const p={x,y};if(safe(p))return p;}
 return {...stage.spawn};
}
