import {sideRigPose,sideRigRestPose} from './actor-side-pose.js';
import {ACTOR_ATTACHMENT_SOURCE,ACTOR_SOURCE_ATTACHMENTS} from './actor-attachments.js';
// Editable pixel-layer vocabulary. Shape blocks stay readable at actual phone size.
export const OUTFIT_PALETTES={
 lime:[0x426338,0x78ac42,0xb8e962,0xe0f8a4],moth:[0x4b355b,0x79528c,0xb58bd0,0xe6c7f2],
 rainbow:[0x5e4264,0xb96b9d,0xe9a0b9,0xffd0c9],tiger:[0x6c3c38,0xbe673b,0xf3a24e,0xffd28c],
 frog:[0x245949,0x348b65,0x6bcd89,0xb1ec9e],cosmic:[0x2c2a51,0x484078,0x7661b1,0xaa91dc],
 bee:[0x69502f,0xc3943a,0xf1cd5b,0xffeda0],skeleton:[0x121f30,0x22374a,0x38576a,0x69908d],
 patchwork:[0x6b3e68,0xa95b9b,0xe68dbb,0xffc6db],mycelium:[0x142836,0x223b4d,0x416475,0x7aa09a],
};
export const SKIN_PALETTES={light:[0x9b5b45,0xcf9167,0xf1bc8c,0xffd9ad],fair:[0xa57365,0xd3a18c,0xf2cfb4,0xffe5d1],medium:[0x673e35,0x9d6148,0xcd8e65,0xecb288],tan:[0x57382f,0x8e593d,0xb57550,0xd4976a],deep:[0x3b292e,0x633f36,0x925e47,0xb9825e],rich:[0x251e27,0x44302e,0x634338,0x8a6150]};
export const FRAME_WIDTH=64,FRAME_HEIGHT=80,FOOT_X=32,FOOT_Y=74;
export function actorAnchors(pose={row:0,index:0}){
 const side=[3,6,8].includes(pose.row),back=[4,7].includes(pose.row),flipX=Boolean(pose.flipX??(Boolean(pose.facingFlipX)!==Boolean(pose.poseMirror))),sign=flipX?-1:1;
 const mirror=p=>p?{x:p.x*sign,y:p.y}:null;
 let cap,crown,brow,ears,head,hand,width;
 if(side){
  const options={carrying:Boolean(pose.carrying)},p=pose.row===8?sideRigRestPose(options):sideRigPose(pose.row===6?'runRight':'walkRight',pose.index,options);
  // Measured on head component: cap span[139..409] at y176; neck pivot
  // (273,379), crown y101, brow(336,252), near ear(246,285), scale17/289.
  const h=17/289,at=(x,y)=>({x:p.neck.x+(x-273)*h,y:17+p.neck.y+(y-379)*h});
  cap=at(274,176);crown=at(274,101);brow=at(336,252);ears={near:at(246,285),far:null};width=271*h;
  head={x:p.neck.x,y:-20+p.bob};hand={x:p.near.wrist.x,y:16+p.near.wrist.y};
 }else{
  const entry=(ACTOR_SOURCE_ATTACHMENTS[pose.row]??ACTOR_SOURCE_ATTACHMENTS[0])[Math.max(0,Math.min(5,pose.index??0))];
  const [cx,cy,w,top,lx,ly,rx,ry]=entry,{foot,scale}=ACTOR_ATTACHMENT_SOURCE;
  const at=(x,y)=>({x:(x-foot.x)*scale,y:16+(y-foot.y)*scale});
  cap=at(cx,cy);crown=at(cx,top);brow=at(cx,cy+15);width=w*scale;
  ears={near:at(cx+23,cy+26),far:at(cx-23,cy+26)};
  head={x:cap.x,y:crown.y+8};
  // A mirrored half-cycle uses the other source palm, then mirrors it back to
  // the same visible carrying hand. It never jumps across the torso each step.
  const sourceRight=(back?-1:1)*sign>0;hand=sourceRight?at(rx,ry):at(lx,ly);
 }
 const facing=side?(flipX?'left':'right'):back?'back':'front';
 hand=mirror(hand);head=mirror(head);cap=mirror(cap);
 // Source mirroring reconstructs alternating front/back limbs. It reflects
 // the measured socket, never the identity of an asymmetric hat every half-step.
 const headwear={...cap,width,side,back,flipX:side&&flipX,crown:mirror(crown),brow:mirror(brow),ears:{near:mirror(ears.near),far:mirror(ears.far)}};
 return {feet:{x:0,y:16},head,hand,back,facing,headwear,grip:{...hand,radius:side?2:2.5,side:side?'near':back?'screen-left':'screen-right',behind:back}};
}
export function wardrobePattern(id,x,y,shade,base){
 const centre=x-32;
 if(id==='rainbow'&&y>39&&y<62)return [0xed89ae,0xe4ca66,0x68bd9a,0x789ece][Math.floor((y-39)/6)%4];
 if(id==='tiger'&&((y+Math.abs(centre)*2)%13<3))return 0x583c46;
 if(id==='bee'&&y>40&&y<63&&y%11<4)return 0x493747;
 if(id==='frog'&&Math.abs(centre)<6&&y>40&&y<63)return shade>1?0xc9eca0:0x94c97c;
 if(id==='cosmic'&&((x*7+y*11)%43<2))return 0xf5df94;
 if(id==='skeleton'&&y>40&&y<63&&(Math.abs(centre)<1||y%5===0&&Math.abs(centre)<7))return 0xbce9d7;
 if(id==='patchwork'&&y>38&&y<64)return centre<0&&y<52?0x75cabb:centre>=0&&y>=52?0xe5c665:base;
 if(id==='mycelium'&&y>40&&y<63&&((x+y)%13<2||Math.abs(centre)<1))return [0x88dfcc,0xa997db,0xd5ca8d][Math.floor(y/7)%3];
 return base;
}
export {drawHat} from './actor-hats.js';
import {drawTotem as paintTotem} from './actor-totems.js';
// Compatibility for scene-local art callers; the Avatar supplies richer options.
export function drawTotem(g,id,hand,back=false,time=0,reduced=false){return paintTotem(g,id,{hand,back,time,reduced,facing:back?'up':hand.x<0?'left':'down'});}
function box(g,c,x,y,w,h,a=1){g.fillStyle(c,a).fillRect(Math.round(x),Math.round(y),w,h);}
export function drawFlair(g,id,time,reduced=false,drop=false){
 g.clear();if(id==='none')return;
 const t=reduced?0:time/1000,phase=drop?1:.7;
 if(id==='aurora'){
  for(const side of [-1,1])for(let i=0;i<12;i++){const x=side*(17+i)+Math.round(Math.sin(t*1.4+i*.4)*3),y=-17+i*3;box(g,[0xbaa1ed,0x83dcca,0xe5ca88][i%3],x,y,3,3,phase*(1-i/17));}return;
 }
 if(id==='prism'){for(let i=0;i<20;i++){const a=i*Math.PI/10+t*.25;box(g,[0xf1a0cd,0xa8a0e9,0x83d6c6,0xe7cd87][i%4],Math.round(Math.cos(a)*25),Math.round(Math.sin(a)*30)-8,2,3,.55);}return;}
 for(let i=0;i<8;i++){const a=i*Math.PI/4+t*.3,r=22+(i%2)*6,x=Math.round(Math.cos(a)*r),y=Math.round(Math.sin(a)*r*.7)-7;box(g,id==='fireflies'?0xc5e994:i%2?0xbca8ea:0xf4dc98,x,y,i%3===0?3:2,2,.55+Math.sin(t+i)*.2);if(id==='stardust'&&i%2===0)box(g,0xf7df9d,x+1,y-1,1,4,.6);}
}
