// Reusable pixel headwear. The opening sits on the measured upper forehead;
// profile shapes narrow the crown and project the brim towards the face.
const OUTLINE=0x302a48;
function fitFor(anchor,back,options){
 const fit=options.headwear??anchor.headwear;
 return fit??{x:anchor.x,y:anchor.y-2,width:19,side:false,back:Boolean(back),flipX:false};
}
export function drawHat(g,id,anchor={x:0,y:-20},back=false,options={}){
 g.clear();if(id==='none')return;
 const fit=fitFor(anchor,back,options),side=Boolean(fit.side),rear=Boolean(fit.back??back),flip=Boolean(fit.flipX);
 const cx=Math.round(fit.x),base=Math.round(fit.y),size=Math.max(16,Math.min(22,fit.width??19)),half=Math.round(size/2);
 // Reflect the item itself around the head socket, never around the body origin.
 const r=(colour,x,y,w,h)=>g.fillStyle(colour).fillRect(cx+Math.round(flip?-x-w:x),base+Math.round(y),w,h);
 const band=(colour=OUTLINE)=>{r(OUTLINE,-half,-2,half*2,3);r(colour,-half+1,-1,half*2-2,2);};
 const flowers=(points)=>{for(const [x,y,c]of points){r(OUTLINE,x-3,y-2,7,6);r(c,x-2,y-3,5,7);r(c,x-3,y-1,7,3);r(0xffe9a1,x,y-1,2,2);}};
 if(id==='bucket'){
  const left=side?-8:-7,width=side?14:15;
  r(OUTLINE,left,-9,width,8);r(0x7954a3,left+1,-8,width-2,6);r(0xb18ada,left+2,-8,width-5,2);
  r(0x60427f,left+1,-3,width-2,2);
  r(OUTLINE,side?-10:-half-2,-2,side?22:half*2+4,4);
  r(0xa47bcd,side?-9:-half-1,-1,side?20:half*2+2,2);
  r(0x60427f,side?-7:-half+1,1,side?17:half*2-2,1);
  return;
 }
 if(id==='wizard'){
  // A bent tip and stepped taper keep the silhouette legible without a huge cone.
  r(OUTLINE,2,-22,5,3);r(OUTLINE,0,-20,5,4);r(OUTLINE,-2,-17,7,4);r(OUTLINE,-4,-14,10,4);r(OUTLINE,-6,-10,13,5);r(OUTLINE,-8,-6,17,5);
  r(0x9d7bd3,2,-20,3,2);r(0x9d7bd3,0,-17,3,4);r(0x9d7bd3,-2,-13,6,4);r(0x9d7bd3,-4,-9,9,5);r(0x76599f,-6,-5,13,4);
  r(OUTLINE,-half-2,-2,half*2+5,4);r(0xb894e2,-half-1,-1,half*2+3,2);
  if(!rear){r(0xf7d98a,side?2:0,-10,2,5);r(0xf7d98a,side?1:-1,-9,4,2);}return;
 }
 if(id==='mushroom'){
  const width=side?24:26,left=side?-11:-13;
  r(OUTLINE,left+6,-11,width-12,2);r(OUTLINE,left+3,-9,width-6,3);r(OUTLINE,left,-6,width,7);
  r(0xf298b9,left+6,-10,width-12,3);r(0xd56694,left+3,-7,width-6,5);r(0xe884ad,left+1,-4,width-2,4);
  r(0xffe7b4,left+1,0,width-2,2);r(0x9e6b7e,-half+2,2,half*2-4,1);
  for(const [x,y]of [[-6,-6],[2,-9],[7,-3]])r(0xffefcf,x,y,3,2);return;
 }
 if(id==='flower'){
  band(0x52784e);flowers(side?[[-5,-3,0xb99bde],[5,-2,0xf1a5c1]]:[[-7,-2,0xf1a5c1],[0,-4,0xf1d786],[7,-2,0xbba1df]]);return;
 }
 if(id==='cat'){
  band(0x795987);
  for(const x of side?[-5,1]:[-8,5]){r(OUTLINE,x+1,-10,1,1);r(OUTLINE,x,-9,3,1);r(OUTLINE,x-1,-8,5,6);r(0xb58bc9,x,-8,3,5);r(0xb58bc9,x+1,-9,1,1);if(!rear)r(0xef9fc2,x+1,-6,1,2);}return;
 }
 if(id==='antenna'){
  band(0x4e8066);
  for(const [x,y]of side?[[-5,-11],[3,-13]]:[[-6,-12],[6,-12]]){r(OUTLINE,x,-9,2,8);r(0x71ad83,x,y+3,1,-y-4);r(OUTLINE,x-2,y-2,5,5);r(0xa7e38c,x-1,y-1,3,3);r(0xe7fac1,x,y-1,1,1);}return;
 }
 if(id==='crown'){
  const left=side?-8:-9,width=side?16:19;
  r(OUTLINE,left,-7,width,9);r(0xd6a343,left+1,-5,width-2,6);r(0xffdd7c,left+1,-1,width-2,2);
  for(const x of [left+1,left+Math.floor(width/2),left+width-3]){r(OUTLINE,x-1,-10,4,6);r(0xf7d777,x,-9,2,6);}
  if(!rear){r(0xa95186,side?3:-1,-4,3,3);r(0xffb7d3,side?4:0,-4,1,1);}return;
 }
 if(id==='headphones'){
  // Profile hides the far cup; the visible cup sits over the ear, not in space.
  r(OUTLINE,-half+1,-6,half*2-2,3);r(0x79c4c1,-half+2,-5,half*2-4,1);
  if(side){r(OUTLINE,-half,-4,3,10);r(OUTLINE,-4,1,7,9);r(0x599da9,-3,2,5,7);r(0x9fe9d6,-2,3,3,4);}
  else for(const x of [-half-1,half-4]){r(OUTLINE,x+1,-4,3,8);r(OUTLINE,x,1,5,11);r(0x62aeb9,x+1,3,3,7);r(0xa6eddd,x+1,4,2,4);}return;
 }
 if(id==='spore'){
  band(0x627f60);
  for(const [x,y,c]of side?[[-5,-8,0x8cdbbd],[1,-14,0xb59ae2],[6,-7,0xe5c77d]]:[[-7,-8,0x8cdbbd],[0,-15,0xb59ae2],[7,-9,0xe5c77d]]){r(OUTLINE,x-1,y+2,3,-y-1);r(0xcde1bc,x,y+2,1,-y-1);r(OUTLINE,x-4,y-2,9,5);r(c,x-3,y-2,7,3);r(0xf3edca,x-1,y-2,2,1);}return;
 }
}
