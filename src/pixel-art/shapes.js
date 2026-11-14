// Small, editable pixel marks used for rings, wrappers and earned accessories.
// They never create physics bodies or change logical positions.
export const snapPixel=(n,step=2)=>Math.round(n/step)*step;
export function pixelEllipse(x,y,width,height,step=2,segments=32){
 const points=[];
 for(let i=0;i<=segments;i++){
  const a=i/segments*Math.PI*2,p={x:snapPixel(x+Math.cos(a)*width/2,step),y:snapPixel(y+Math.sin(a)*height/2,step)};
  const prev=points.at(-1);
  if(prev&&prev.x!==p.x&&prev.y!==p.y)points.push({x:p.x,y:prev.y});
  if(!prev||prev.x!==p.x||prev.y!==p.y)points.push(p);
 }
 return points;
}
export function pixelLine(x1,y1,x2,y2,step=2){
 const n=Math.max(1,Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1))/step)),p=[];
 for(let i=0;i<=n;i++){
  const x=snapPixel(x1+(x2-x1)*i/n,step),y=snapPixel(y1+(y2-y1)*i/n,step),last=p.at(-1);
  if(last&&last.x!==x&&last.y!==y)p.push({x,y:last.y});
  if(!last||last.x!==x||last.y!==y)p.push({x,y});
 }
 return p;
}
export function pixelHeart(g,x,y,size=2,color=0xf49bb0,alpha=1){
 const rows=['0110110','1111111','1111111','0111110','0011100','0001000'];
 g.fillStyle(color,alpha);
 rows.forEach((row,iy)=>{for(let ix=0;ix<row.length;){if(row[ix]==='0'){ix++;continue;}let end=ix+1;while(row[end]==='1')end++;g.fillRect(Math.round(x+(ix-3.5)*size),Math.round(y+(iy-3)*size),(end-ix)*size,size);ix=end;}});
 return g;
}
export function pixelStar(g,x,y,size=2,color=0xffe3a1,alpha=1){
 g.fillStyle(color,alpha).fillRect(Math.round(x-size),Math.round(y-size*3),size*2,size*6).fillRect(Math.round(x-size*3),Math.round(y-size),size*6,size*2);
 return g;
}
export function pixelLantern(g,x,y,{lit=true,scale=1,alpha=1}={}){
 const r=(dx,dy,w,h,color)=>g.fillStyle(color,alpha).fillRect(Math.round(x+dx*scale),Math.round(y+dy*scale),w*scale,h*scale);
 r(-4,-17,8,2,0xd1dec6);r(-6,-15,2,5,0xd1dec6);r(4,-15,2,5,0xd1dec6);
 r(-10,-10,20,25,0x253447);r(-8,-8,16,21,lit?0xffce80:0x395260);
 r(-11,-12,22,4,0xf4dfad);r(-11,13,22,4,0xf4dfad);
 r(-4,-8,2,21,lit?0xc78545:0x8da89e);r(3,-8,2,21,lit?0xc78545:0x8da89e);
 if(lit)r(-1,-4,3,11,0xfff2ba);
 return g;
}
export function pixelSandwich(g,x,y,size=1,alpha=1){
 const rows=[[-12,-12,23,3,0x663b2c],[-16,-9,31,4,0x663b2c],[-14,-9,27,3,0xffdf94],[-12,-6,23,3,0xe9b66b],[-10,-3,19,3,0xffdf94],[-8,0,15,3,0xe9b66b],[-6,3,11,3,0xffdf94],[-4,6,7,3,0x663b2c],[-12,-3,3,3,0xb4773e],[-6,-7,3,3,0xb4773e],[1,-8,3,3,0xb4773e],[6,-5,3,3,0xb4773e],[-14,-4,3,5,0xffca3b],[-9,2,3,6,0xffca3b],[-4,7,3,5,0xffca3b]];
 for(const [dx,dy,w,h,color]of rows)g.fillStyle(color,alpha).fillRect(Math.round(x+dx*size),Math.round(y+dy*size),w*size,h*size);
 return g;
}
export function pixelCheese(g,x,y,size=1,alpha=1){
 g.fillStyle(0x76492e,alpha).fillRect(x-17*size,y-7*size,36*size,24*size);
 g.fillStyle(0xffcc40,alpha).fillRect(x-15*size,y-5*size,32*size,20*size);
 for(let i=0;i<5;i++)g.fillStyle(0xffeda1,alpha).fillRect(x+(-13+i*4)*size,y+(-9-i*2)*size,(28-i*4)*size,3*size);
 g.fillStyle(0xb97930,alpha).fillRect(x-9*size,y+2*size,5*size,5*size).fillRect(x+6*size,y+6*size,6*size,6*size).fillRect(x+2*size,y-2*size,3*size,3*size);
 return g;
}

export function pixelizeGraphics(g,step=2){
 // Preserve the real Phaser Graphics identity and lifecycle. Only presentation
 // primitives are replaced with stepped paths; callers keep ordinary chaining.
 if(g.__pixelGeometry===true)return g;
 g.__pixelGeometry=true;
 const method=name=>typeof g[name]==='function'?g[name].bind(g):()=>g;
 const fill=method('fillPoints'),stroke=method('strokePoints'),rect=method('fillRect'),outline=method('strokeRect'),lineStyle=method('lineStyle');
 const round=n=>snapPixel(n,step);
 const polygon=points=>points.flatMap((point,i)=>{const next=points[(i+1)%points.length];return pixelLine(point.x,point.y,next.x,next.y,step);});
 g.fillCircle=(x,y,r)=>{fill(pixelEllipse(x,y,r*2,r*2,step),true);return g;};
 g.fillEllipse=(x,y,w,h)=>{fill(pixelEllipse(x,y,w,h,step),true);return g;};
 g.strokeCircle=(x,y,r)=>{stroke(pixelEllipse(x,y,r*2,r*2,step),true);return g;};
 g.strokeEllipse=(x,y,w,h)=>{stroke(pixelEllipse(x,y,w,h,step),true);return g;};
 g.fillRoundedRect=(x,y,w,h)=>{rect(round(x),round(y),Math.max(step,round(w)),Math.max(step,round(h)));return g;};
 g.strokeRoundedRect=(x,y,w,h)=>{outline(round(x),round(y),Math.max(step,round(w)),Math.max(step,round(h)));return g;};
 g.lineBetween=(x,y,a,b)=>{stroke(pixelLine(x,y,a,b,step));return g;};
 g.fillTriangle=(x,y,a,b,c,d)=>{fill(polygon([{x,y},{x:a,y:b},{x:c,y:d}]),true);return g;};
 g.lineStyle=(width,...rest)=>{lineStyle(Math.max(1,Math.round(width)),...rest);return g;};
 return g;
}
