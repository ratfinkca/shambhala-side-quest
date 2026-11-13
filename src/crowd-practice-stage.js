import {arenaBounds} from './geometry.js';
import {crowdPosition} from './festival.js';

// Preview density changes only the anchor list. Keep authored paths and rules,
// and allow dancers to overlap one another rather than spreading the crowd out.
export function crowdPracticeStage(stage,extra=0){
 const result=structuredClone(stage),count=extra===6||extra===12?extra:0;
 if(!count)return result;
 const anchors=result.crowdAnchors,bounds=arenaBounds(stage,14),columns=19,rows=9,total=columns*rows;
 let seed=2166136261;
 for(const char of String(stage.id))seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
 let cursor=0;
 function candidate(){
  // 73 and 171 are coprime: visit every cell once, alternating across the
  // floor instead of filling one corner first. The venue determines the start.
  const cell=(seed%total+cursor++*73)%total,row=Math.floor(cell/columns),column=cell%columns;
  return [bounds.minX+(column+.5+(row%2)*.25)*(bounds.maxX-bounds.minX)/columns,
   bounds.minY+(row+.5)*(bounds.maxY-bounds.minY)/rows];
 }
 function safe(anchor,index){
  const [x,y]=anchor,dx=index%3===0?52:15,dy=index%3===0?30:12;
  if(x-dx<bounds.minX||x+dx>bounds.maxX||y-dy<bounds.minY||y+dy>bounds.maxY)return false;
  // Enclose the entire authored wander, not just a sampled starting position.
  if((stage.obstacles||[]).some(o=>x+dx>o.x-14&&x-dx<o.x+o.width+14&&y+dy>o.y-14&&y-dy<o.y+o.height+14))return false;
  const initial=crowdPosition(index,0,[...anchors,anchor],stage.crowdSpeed??1);
  return Math.hypot(initial.x-stage.spawn.x,initial.y-stage.spawn.y)>=60;
 }
 for(let added=0;added<count;added++){
  let next=null;
  for(let attempt=0;attempt<total;attempt++){
   const point=candidate();if(safe(point,anchors.length)){next=point;break;}
  }
  if(!next)throw new RangeError(`No safe practice crowd placement in ${stage.id}`);
  anchors.push(next);
 }
 return result;
}
