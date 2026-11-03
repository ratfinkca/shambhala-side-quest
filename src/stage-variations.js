import {variationIdForStage} from '../supabase/functions/_shared/variations.js';
import {puddle} from './stages.js';
import {isOpen} from './geometry.js';
const bin=(x,y,width=60)=>({x,y,width,height:65});
export const STAGE_VARIATIONS=[
 {id:'forest-creekside',stageId:'forest',name:'Creekside Drift',description:'Offset stacks and a muddy bend. Cross through the open middle.',obstacles:[bin(260,280),bin(640,450)],mud:[puddle(550,215,160,75,.8)],flowSpawns:[{x:410,y:240},{x:760,y:470}]},
 {id:'forest-weave',stageId:'forest',name:'Mushroom Weave',description:'A diagonal speaker line with two soft ground patches to weave around.',obstacles:[bin(335,220,90),bin(665,360)],mud:[puddle(230,440,160,84,1.4),puddle(520,450,125,70,2.3)],flowSpawns:[{x:240,y:270},{x:780,y:480}]},
 {id:'neon-stereo',stageId:'neon',name:'Stereo Split',description:'Twin stacks frame a central lane. The lower stack asks for a wide turn.',obstacles:[bin(300,245,90),bin(640,245,90),bin(430,500,90)],mud:[],flowSpawns:[{x:480,y:200},{x:790,y:470}]},
 {id:'neon-crossfade',stageId:'neon',name:'Crossfade Alley',description:'Three staggered stacks and a muddy shortcut. Pick your crossing.',obstacles:[bin(260,330,90),bin(560,215,90),bin(690,450)],mud:[puddle(380,250,110,75,.3)],flowSpawns:[{x:440,y:230},{x:420,y:500}]},
 {id:'sunrise-islands',stageId:'sunrise',name:'Golden Islands',description:'Mud islands split the clearing into broad routes and bass-side detours.',obstacles:[bin(260,260),bin(625,255,90),bin(680,460)],mud:[puddle(360,230,140,90,1.2),puddle(335,470,165,75,2.7)],flowSpawns:[{x:260,y:470},{x:770,y:220}]},
 {id:'sunrise-lane',stageId:'sunrise',name:'Last Dance Lane',description:'An open diagonal through offset stacks, with mud along the edges.',obstacles:[bin(275,455,90),bin(600,210),bin(690,340)],mud:[puddle(270,245,170,85,.4),puddle(520,475,145,80,2.1)],flowSpawns:[{x:500,y:240},{x:770,y:510}]},
];
export function variationFor(index){
 const id=variationIdForStage(index);
 return STAGE_VARIATIONS.find(v=>v.id===id)||null;
}
// Fixed candidate ordering spreads dancers through the clearing; 75px cabinet
// clearance covers the existing 52px wander plus the dancer collision radius.
const anchorCache=new Map();
export function variationAnchors(variation,spawn){
 if(!anchorCache.has(variation.id)){
  const candidates=[];
  for(let y=180;y<=560;y+=25)for(let x=160;x<=810;x+=25)if(isOpen({x,y},75,variation.obstacles)&&Math.hypot(x-spawn.x,y-spawn.y)>110)candidates.push([x,y]);
  const phase=STAGE_VARIATIONS.indexOf(variation)+1;
  candidates.sort(([ax,ay],[bx,by])=>((ax*17+ay*31+phase*ax)%997)-((bx*17+by*31+phase*bx)%997));
  const anchors=[];
  for(const p of candidates)if(anchors.every(([x,y])=>Math.hypot(p[0]-x,p[1]-y)>70)){anchors.push(p);if(anchors.length===22)break;}
  anchorCache.set(variation.id,anchors);
 }
 return anchorCache.get(variation.id).map(p=>[...p]);
}
