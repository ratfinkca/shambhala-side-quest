import {ACTOR_SIDE_PARTS} from './actor-side-parts.js';
import {FRAME_WIDTH,FRAME_HEIGHT,FOOT_X,FOOT_Y} from './actor-wardrobe.js';
import {sideRigPose,sideRigRestPose} from './actor-side-pose.js';
export {sideRigPose,sideRigJoint,sideRigRestPose} from './actor-side-pose.js';
const preparedSources=new WeakMap();
function canvas(width,height){const c=document.createElement('canvas');c.width=width;c.height=height;return c;}
function preparePart(image,spec,dark,shoe=false){
 const [x,y,w,h]=spec.rect,c=canvas(w,h),g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,x,y,w,h,0,0,w,h);
 const frame=g.getImageData(0,0,w,h),d=frame.data;
 for(let i=0;i<d.length;i+=4){if(d[i+3]<150){d[i+3]=0;continue;}d[i+3]=255;if(dark)for(let j=0;j<3;j++)d[i+j]=Math.round(d[i+j]*.64);}
 g.putImageData(frame,0,0);
 const mask=canvas(w,h),mg=mask.getContext('2d'),mf=g.getImageData(0,0,w,h);
 for(let i=0;i<mf.data.length;i+=4)mf.data[i]=mf.data[i+1]=mf.data[i+2]=shoe?255:0;
 mg.putImageData(mf,0,0);
 return {image:c,mask,pivot:{x:spec.pivot[0]-x,y:spec.pivot[1]-y},end:spec.end?{x:spec.end[0]-x,y:spec.end[1]-y}:null};
}
function drawPart(g,part,at,scale,angle=0){
 for(const [context,image]of [[g,part.image],[g.footwearMaskContext,part.mask]])if(context){
  context.save();context.translate(Math.round(FOOT_X+at.x),Math.round(FOOT_Y+at.y));context.rotate(angle);context.scale(scale,scale);
  context.drawImage(image,-part.pivot.x,-part.pivot.y);context.restore();
 }
}
function bone(g,part,a,b){
 const sx=part.end.x-part.pivot.x,sy=part.end.y-part.pivot.y,dx=b.x-a.x,dy=b.y-a.y;
 drawPart(g,part,a,Math.hypot(dx,dy)/Math.hypot(sx,sy),Math.atan2(dy,dx)-Math.atan2(sy,sx));
}
function prepareSource(image){
 if(preparedSources.has(image))return preparedSources.get(image);
 if(image.naturalWidth!==ACTOR_SIDE_PARTS.width||image.naturalHeight!==ACTOR_SIDE_PARTS.height)throw new Error('Sideways actor parts dimensions do not match their measured source metadata.');
 const near={},far={};for(const [name,spec]of Object.entries(ACTOR_SIDE_PARTS.parts)){if(name==='head')continue;near[name]=preparePart(image,spec,false,name==='shoe');far[name]=preparePart(image,spec,true,name==='shoe');}
 const source={near,far};preparedSources.set(image,source);return source;
}
function bakePose(source,p){
  const {near,far}=source,c=canvas(FRAME_WIDTH,FRAME_HEIGHT),g=c.getContext('2d',{willReadFrequently:true}),mask=canvas(FRAME_WIDTH,FRAME_HEIGHT),mg=mask.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;mg.imageSmoothingEnabled=false;g.footwearMaskContext=mg;
  const leg=(parts,limb)=>{bone(g,parts.thigh,p.hip,limb.knee);bone(g,parts.calf,limb.knee,limb.ankle);drawPart(g,parts.shoe,limb.foot,4/96,limb.shoeAngle);};
  const arm=(parts,limb)=>{bone(g,parts.upperArm,p.shoulder,limb.elbow);bone(g,parts.forearm,limb.elbow,limb.wrist);};
  leg(far,p.far);arm(far,p.far);leg(near,p.near);
  drawPart(g,near.torso,p.neck,16/333);
  arm(near,p.near);
  const frame=g.getImageData(0,0,FRAME_WIDTH,FRAME_HEIGHT),tags=mg.getImageData(0,0,FRAME_WIDTH,FRAME_HEIGHT).data;
  frame.footwearMask=new Uint8Array(FRAME_WIDTH*FRAME_HEIGHT);
  for(let i=0;i<frame.footwearMask.length;i++)frame.footwearMask[i]=tags[i*4]>127&&tags[i*4+3]>127?1:0;
  return frame;
}
export function bakeSideActorFrames(image,{carrying=false}={}){
 const source=prepareSource(image);
 const frames=[];
 for(const clip of ['walkRight','runRight'])for(let i=0;i<6;i++)frames.push(bakePose(source,sideRigPose(clip,i,{carrying})));
 return frames;
}
export function bakeSideActorRest(image,{carrying=false}={}){return bakePose(prepareSource(image),sideRigRestPose({carrying}));}
