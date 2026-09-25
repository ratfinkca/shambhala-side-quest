export function isOpen(p,radius,obstacles){return !obstacles.some(o=>p.x>o.x-radius&&p.x<o.x+o.width+radius&&p.y>o.y-radius&&p.y<o.y+o.height+radius);}
export function movementFactor(p,mud,slowedMs){return slowedMs>0||!isOpen(p,0,mud)?.5:1;}
export function moveInArena(p,d,dt,{width=960,height=640,obstacles=[],speed=300}={}){
 const length=Math.hypot(d.x,d.y);if(!length)return;
 const travel=speed*Math.min(50,Math.max(0,dt))/1000,steps=Math.max(1,Math.ceil(travel/7));
 const dx=d.x/length*travel/steps,dy=d.y/length*travel/steps;
 for(let i=0;i<steps;i++){
  const x=Math.max(14,Math.min(width-14,p.x+dx));if(isOpen({x,y:p.y},14,obstacles))p.x=x;
  const y=Math.max(14,Math.min(height-14,p.y+dy));if(isOpen({x:p.x,y},14,obstacles))p.y=y;
 }
}
export function findSpawn(stage,rng=Math.random,avoid=[]){
 const safe=p=>isOpen(p,24,stage.obstacles)&&avoid.every(a=>Math.hypot(p.x-a.x,p.y-a.y)>(a.radius??45));
 for(let i=0;i<50;i++){const p={x:160+rng()*650,y:180+rng()*385};if(safe(p))return p;}
 for(let y=180;y<=565;y+=24)for(let x=160;x<=810;x+=24){const p={x,y};if(safe(p))return p;}
 return {...stage.spawn};
}
