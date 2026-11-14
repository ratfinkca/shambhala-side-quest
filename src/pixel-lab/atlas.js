import {ACTOR_CLIPS} from '../pixel-art/actor-clips.js';
import {FRAME_WIDTH,FRAME_HEIGHT,FOOT_Y} from '../pixel-art/actor-wardrobe.js';
// Named atlas rows. Every frame uses one scale and one foot anchor, never
// individual opaque bounds: doing that would erase jumps and make bodies wobble.
export const PIXEL_SHEETS = {
  raver: {width:FRAME_WIDTH*6,height:FRAME_HEIGHT*9,columns:6,rows:9,displayHeight:FRAME_HEIGHT,anchorY:FOOT_Y/FRAME_HEIGHT},
  effects: {width:1254,height:1254,columns:4,rows:4,displayHeight:64,anchorY:.5},
};
const clip=(label,row,fps,type='raver',frames=6,loop=true)=>({label,row,fps,type,frames,loop});
export const PIXEL_CLIPS = {
  idle:clip('Idle bounce',0,6),
  dance:clip('Dance in place',1,8),
  walkDown:clip('Dance-step · toward you',2,8),
  walkRight:clip('Dance-step · sideways',3,8),
  walkUp:clip('Dance-step · away',4,8),
  runDown:clip('Run · toward you',5,12),
  runRight:clip('Run · sideways',6,12),
  runUp:clip('Run · away',7,12),
  restRight:clip('Rest · sideways',8,0,'raver',1),
  spark:clip('Spark twinkle',0,6,'effects',4),
  flow:clip('Flow crystal',1,6,'effects',4),
  friend:clip('Friendship pop',2,8,'effects',4,false),
  bass:clip('Bass Head pulse',3,6,'effects',4),
};
for(const [name,definition]of Object.entries(ACTOR_CLIPS))Object.assign(PIXEL_CLIPS[name],definition);

export function pixelFrame(name,index=0){
  const clip=PIXEL_CLIPS[name];
  if(!clip)throw new Error(`Unknown pixel clip: ${name}`);
  const sheet=PIXEL_SHEETS[clip.type];
  const safe=Number.isFinite(index)?Math.floor(index):0;
  const frame=clip.loop?((safe%clip.frames)+clip.frames)%clip.frames:Math.max(0,Math.min(clip.frames-1,safe));
  const source=clip.order?.[frame]??frame;
  const x=Math.round(source*sheet.width/sheet.columns),right=Math.round((source+1)*sheet.width/sheet.columns);
  const y=Math.round(clip.row*sheet.height/sheet.rows),bottom=Math.round((clip.row+1)*sheet.height/sheet.rows);
  // Uniform source-to-display ratio across a sheet. Rounded cell dimensions
  // differ by at most a source pixel and never change the intended pixel scale.
  const ratio=sheet.displayHeight/(sheet.height/sheet.rows);
  return {type:clip.type,x,y,width:right-x,height:bottom-y,mirror:Boolean(clip.mirror?.[frame]),source,
    displayWidth:(right-x)*ratio,displayHeight:(bottom-y)*ratio,
    anchorX:sheet.width/sheet.columns*.5*ratio,anchorY:sheet.anchorY*sheet.displayHeight};
}
