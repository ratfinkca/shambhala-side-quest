import {ACTOR_SOURCE_ATTACHMENTS} from './actor-attachments.js';
const grey=(r,g,b)=>Math.max(r,g,b)>60&&Math.max(r,g,b)-Math.min(r,g,b)<Math.max(27,Math.max(r,g,b)*.2);
// The body image owns its palms and shoulder pixels even when they rise beside
// the head. Masking a horizontal strip would delete those dancing hands.
export function removeEmbeddedHead(frame,{row,index=0}){
 const entry=ACTOR_SOURCE_ATTACHMENTS[row]?.[index];if(!entry)return {frame,cutoff:null,removed:0};
 const [cx,cap,,top,lx,ly,rx,ry]=entry,{width,height,data}=frame;
 const opaque=(x,y)=>x>=0&&x<width&&y>=0&&y<height&&data[(y*width+x)*4+3]>=150;
 let cutoff=Math.min(height,cap+48);
 for(let y=cap+25;y<Math.min(height,cap+61);y++){
  let count=0;for(let x=Math.max(0,Math.round(cx)-20);x<=Math.min(width-1,Math.round(cx)+20);x++){const i=(y*width+x)*4;if(opaque(x,y)&&grey(data[i],data[i+1],data[i+2]))count++;}
  if(count>=20){cutoff=y;break;}
 }
 const keep=new Uint8Array(width*height);
 // Preserve the gray shoulder/upper-arm contour approaching the collar seam.
 for(let y=Math.max(0,cutoff-8);y<cutoff;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;if(!opaque(x,y)||!grey(data[i],data[i+1],data[i+2]))continue;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<width&&yy>=0&&yy<height)keep[yy*width+xx]=1;}
 }
 let removed=0;
 for(let y=Math.max(0,top-2);y<cutoff;y++)for(let x=Math.max(0,Math.floor(cx-51));x<=Math.min(width-1,Math.ceil(cx+51));x++){
  if(keep[y*width+x]||[[lx,ly],[rx,ry]].some(([px,py])=>((x-px)/14)**2+((y-py)/15)**2<=1))continue;
  const i=(y*width+x)*4;if(data[i+3])removed++;data[i+3]=0;
 }
 return {frame,cutoff,removed};
}
