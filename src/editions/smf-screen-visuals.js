// Original screen artwork. Normalized geometry keeps every petal and mirrored
// fold inside the measured LED inset, without a mask or extra render texture.
const TAU=Math.PI*2;
export function drawSMFScreen(g,panel,turn,energy,style='liquid'){
 const {x,y}=panel,w=panel.w??panel.width,h=panel.h??panel.height;
 const tunnel=style==='tunnel',colours=tunnel?[0x79ffe5,0xca96ff,0xd8ff8b,0x8bdfff]:[0xffcd93,0x9fe8d0,0xe9afe4,0xffe1ad];
 const strength=Math.min(1.3,Math.max(0,energy));
 g.fillStyle(tunnel?0x101c38:0x1c2631,.24).fillRect(x,y,w,h);
 const centre={x:.5+Math.sin(turn*.5)*.018,y:.5+Math.cos(turn*.4)*.018};
 const point=(angle,r)=>({x:x+(centre.x+Math.cos(angle)*r)*w,y:y+(centre.y+Math.sin(angle)*r)*h});
 if(h<14){
  for(let row=0;row<3;row++){
   const points=Array.from({length:25},(_,i)=>({x:x+w*(.03+i/24*.94),y:y+h*(.24+row*.24+Math.sin(i/24*TAU+turn+row)*.08)}));
   g.lineStyle(1.3,colours[row],.48*strength).strokePoints(points,false);
  }
  return;
 }
 for(let ring=0;ring<4;ring++){
  const radius=.12+ring*.095,rotation=turn*(tunnel?.22:.11)*(ring%2?-1:1);
  const points=Array.from({length:tunnel?25:49},(_,i)=>{
   const angle=i/(tunnel?24:48)*TAU;
   // Mirrored sectors form a sixfold tunnel or a soft, eight-petal mandala.
   const fold=tunnel?.90+.10*Math.cos(angle*6+Math.sin(turn)*.65):.86+.14*Math.cos(angle*8+Math.sin(turn*.7)*.55);
   return point(angle+rotation,radius*fold*(1+Math.sin(turn+ring*.7)*.055));
  });
  g.fillStyle(colours[ring],.025*strength).fillPoints(points,true);
  g.lineStyle(tunnel?5:4,colours[ring],.11*strength).strokePoints(points,true);
  g.lineStyle(tunnel?1.8:1.5,colours[ring],(.42+ring*.035)*strength).strokePoints(points,true);
 }
 // Repeated mirrored spokes tie the rings together, avoiding an unrelated
 // spinning graphic pasted over the stage's architecture.
 for(let spoke=0;spoke<(tunnel?6:8);spoke++){
  const a=spoke/(tunnel?6:8)*TAU+turn*(tunnel?.12:.07);
  const path=[point(a,.055),point(a+Math.sin(turn*.6)*.17,.23),point(a,.405)];
  g.lineStyle(1.2,colours[spoke%4],.25*strength).strokePoints(path,false);
 }
}
