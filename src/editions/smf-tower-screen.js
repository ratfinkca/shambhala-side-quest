// Village tower LEDs sit behind carved timber. The wood never changes shape;
// only the light visible through these CNC-like spiral openings moves.
const WOOD=0x80502b,WOOD_FACE=0xb67a3e,WOOD_EDGE=0xf1bd75,DARK=0x06191d;
const COLOURS=[0x74edf0,0xffbc65,0xcf8ffa];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function scroll(cx,cy,mirror){
 const sides=[[],[]],steps=24;
 for(let i=0;i<=steps;i++){
  const u=i/steps,angle=-Math.PI*.72+u*Math.PI*1.78,r=.225*(1-u*.76);
  const x=cx+Math.cos(angle)*r*mirror,y=cy+Math.sin(angle)*r*.9;
  const next=angle+.01,nextRadius=r-.225*.76*.01/(Math.PI*1.78);
  const dx=(Math.cos(next)*nextRadius-Math.cos(angle)*r)*mirror,dy=(Math.sin(next)*nextRadius-Math.sin(angle)*r)*.9,length=Math.hypot(dx,dy);
  const width=.038*Math.sin(Math.PI*(.13+u*.74));
  sides[0].push({x:x-dy/length*width,y:y+dx/length*width});
  sides[1].push({x:x+dy/length*width,y:y-dx/length*width});
 }
 return [...sides[0],...sides[1].reverse()];
}
const OPENINGS=[scroll(.29,.265,1),scroll(.71,.265,-1),scroll(.29,.735,-1),scroll(.71,.735,1)];
const FACE=[{x:.035,y:.055},{x:.12,y:.02},{x:.88,y:.02},{x:.965,y:.055},{x:.965,y:.945},{x:.88,y:.98},{x:.12,y:.98},{x:.035,y:.945}];
function clipY(points,edge,keepAbove){
 const out=[];
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],insideA=keepAbove?a.y>=edge:a.y<=edge,insideB=keepAbove?b.y>=edge:b.y<=edge;
  if(insideA)out.push(a);
  if(insideA!==insideB){const t=(edge-a.y)/(b.y-a.y);out.push({x:a.x+(b.x-a.x)*t,y:edge});}
 }
 return out;
}
function mixColour(a,b,t){
 let colour=0;
 for(const shift of [16,8,0])colour|=Math.round(((a>>shift)&255)*(1-t)+((b>>shift)&255)*t)<<shift;
 return colour;
}
export function drawTowerScreen(g,p,turn,energy,index=0){
 if(!p||![p.x,p.y,p.w,p.h].every(Number.isFinite)||p.w<=0||p.h<=0)return;
 turn=Number.isFinite(turn)?turn:0;energy=clamp(Number.isFinite(energy)?energy:.7,.25,1.35);
 const scale=points=>points.map(point=>({x:p.x+point.x*p.w,y:p.y+point.y*p.h}));
 // Opaque warm timber covers the former bare rectangular LED inset. Bevels
 // and scroll cutouts connect visually to the carvings above and below it.
 g.fillStyle(WOOD,1).fillRect(p.x,p.y,p.w,p.h);
 g.fillStyle(WOOD_FACE,1).fillPoints(scale(FACE),true);
 g.lineStyle(Math.min(p.w,p.h)*.028,WOOD_EDGE,.8).strokePoints(scale(FACE),true);
 const phase=turn*.7+index*.58;
 OPENINGS.forEach((opening,i)=>{
  const points=scale(opening),wave=.5+.5*Math.sin(phase+i*.9),a=COLOURS[(index+i)%3],b=COLOURS[(index+i+1)%3];
  g.fillStyle(DARK,1).fillPoints(points,true);
  // The coloured field and travelling highlight are both bounded by the
  // opening polygon; no glow wash covers the wooden face or neighbours.
  g.fillStyle(mixColour(a,b,wave),clamp((.43+wave*.28)*energy,.15,.9)).fillPoints(points,true);
  const band=.5+.52*Math.sin(phase*.8+i*.7),clipped=clipY(clipY(opening,band-.09,true),band+.09,false);
  if(clipped.length>=3)g.fillStyle(0xe9fff0,clamp(.42*energy,0,.6)).fillPoints(scale(clipped),true);
  g.lineStyle(Math.min(p.w,p.h)*.025,0x553019,.95).strokePoints(points,true);
 });
 // A narrow wooden spine remains in front of every lighting state.
 g.lineStyle(Math.min(p.w,p.h)*.035,WOOD_EDGE,.65).lineBetween(p.x+p.w*.5,p.y+p.h*.06,p.x+p.w*.5,p.y+p.h*.94);
}
