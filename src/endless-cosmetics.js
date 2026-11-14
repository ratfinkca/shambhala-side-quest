import {pixelLine,pixelEllipse} from './pixel-art/shapes.js';
// Fixed decorative strokes in avatar-local coordinates; never particles or collision objects.
export function drawEndlessCosmetics(g,outfit,time,reduced=false,drop=false){
 const t=reduced?0:time/1000,glow=!reduced&&drop?1:.75;
 if(outfit.flair==='aurora'){
  for(const side of [-1,1])for(let i=0;i<11;i++){
   const y=-4+i*3,x=side*(13+i*1.1)+Math.sin(t*1.3+i*.38)*2;
   const nextX=side*(14.1+i*1.1)+Math.sin(t*1.3+(i+1)*.38)*2;
   g.lineStyle(3.5,i%3===0?0xc1a6ff:i%3===1?0x87efd2:0xf1d58e,glow*.38*(1-i/15)).strokePoints(pixelLine(x,y,nextX,y+3));
  }
 }
 if(outfit.onesie==='mycelium'){
  const colours=[0x8de6d7,0xbba2f4,0xf0d28b];
  for(let i=0;i<3;i++){
   const y=-1+i*5,phase=(t*.35+i)%3,a=colours[Math.floor(phase)],b=colours[(Math.floor(phase)+1)%3],mix=phase%1;
   const colour=[16,8,0].reduce((rgb,shift)=>rgb|(Math.round(((a>>shift)&255)*(1-mix)+((b>>shift)&255)*mix)<<shift),0);
   g.lineStyle(1.3,colour,.85).strokePoints(pixelLine(-5,y,-1,y+2)).strokePoints(pixelLine(-1,y+2,4,y-1)).strokePoints(pixelLine(-1,y+2,-2,y+4));
   g.fillStyle(colour,.8).fillRect(3,y-2,2,2);
  }
 }
 if(outfit.hat==='spore'){
  const pulse=.7+Math.sin(t*1.5)*.15;
  for(const [x,y,r,c]of [[-8,-25,6,0x8cebd6],[0,-34,8,0xb9a1f4],[9,-24,5,0xf1d28a]]){
   g.lineStyle(2,0xd3e2c2).strokePoints(pixelLine(x,-17,x,y));
   g.fillStyle(c,.1+pulse*.1).fillPoints(pixelEllipse(x,y,r*2.9,r*2),true);
   g.fillStyle(c,.8+pulse*.15).fillPoints(pixelEllipse(x,y,r*2,r),true);
   g.fillStyle(0xf7f3d5).fillRect(Math.round(x-r*.25),y-1,2,2).fillRect(Math.round(x+r*.4),y,2,2);
  }
  for(let i=0;i<4;i++){
   const drift=(t*.18+i/4)%1,x=-13+i*8+Math.sin(t*.7+i)*2;
   g.fillStyle(i%2?0xc8b8f5:0xa5f0dc,.3+Math.sin(drift*Math.PI)*.3).fillRect(Math.round(x),Math.round(-29-drift*18),2,2);
  }
 }
 if(outfit.totem==='mixtape'){
  g.fillStyle(0x282a43).fillRect(4,-57,28,18);
  g.lineStyle(1.2,0xc4a4f2).strokeRect(4,-57,28,18);
  g.fillStyle(0xe8c88a).fillRect(7,-54,22,9);
  for(const x of [12,24]){
   g.fillStyle(0x34445a).fillPoints(pixelEllipse(x,-49,7,7,1,16),true);
   const a=t*.9;g.lineStyle(1,0x9be8d4).strokePoints(pixelLine(x-Math.cos(a)*2,-49-Math.sin(a)*2,x+Math.cos(a)*2,-49+Math.sin(a)*2,1));
  }
  g.lineStyle(1,0x8fe7d0).lineBetween(12,-42,24,-42);
  for(let i=0;i<5;i++){
   const x=28+Math.sin(t*(!reduced&&drop?3:1)+i*.7)*(!reduced&&drop?3:1.5);
   const nextX=28+Math.sin(t*(!reduced&&drop?3:1)+(i+1)*.7)*(!reduced&&drop?3:1.5);
   g.lineStyle(1.2,0xd4b0ed,.8).strokePoints(pixelLine(x,-39+i*2,nextX,-37+i*2,1));
  }
 }
}
