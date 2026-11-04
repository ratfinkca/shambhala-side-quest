const COLOURS=[0xf092d0,0x70dfca,0xb49aff,0xf3c681];
const blend=(a,b,mix)=>[16,8,0].reduce((rgb,shift)=>rgb|(Math.round(((a>>shift)&255)*(1-mix)+((b>>shift)&255)*mix)<<shift),0);
// Scenery-only liquid light. No camera/hitbox distortion or spawned particles.
export function drawCandyColours(g,m,reduced=false){
 if(m.effect!=='waves'||m.effectMs<=0)return;
 if(reduced){g.fillStyle(0xb49aff,.09).fillRect(0,0,960,640);return;}
 const age=Math.max(0,m.elapsedMs-(m.effectStartedAtMs??m.elapsedMs)),fade=Math.min(1,age/450,m.effectMs/500),t=age/1000;
 g.fillStyle(0x7f72c9,.07*fade).fillRect(0,0,960,640);
 for(let i=0;i<3;i++){
  const phase=(t*.15+i)%4,index=Math.floor(phase),colour=blend(COLOURS[index],COLOURS[(index+1)%4],phase%1);
  const x=180+i*300+Math.sin(t*.45+i)*100,y=320+Math.sin(t*.6+i*2)*140;
  for(let layer=3;layer>0;layer--)g.fillStyle(colour,.025*fade).fillEllipse(x,y,350+layer*110,280+layer*85);
 }
 for(let band=0;band<6;band++){
  const phase=(t*.15+band*.65)%4,index=Math.floor(phase),colour=blend(COLOURS[index],COLOURS[(index+1)%4],phase%1);
  const points=Array.from({length:33},(_,i)=>({x:i*30,y:45+band*110+Math.sin(i*.22+t*.8+band)*42}));
  g.lineStyle(58,colour,.065*fade).strokePoints(points);
  g.lineStyle(2,colour,.18*fade).strokePoints(points);
 }
}
