import {crowdPosition} from './festival.js';
import {arenaBounds} from './geometry.js';

// Kinematic crowd bodies. Dancers keep their authored paths; only the
// player slides. Radius is the combined centre-to-centre contact distance.
const EPS=1e-8,SKIN=.001,CONTACT_SLOP=.003,MAX_CONTACTS=6;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const length=v=>Math.hypot(v.x,v.y);
const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const difference=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
function nearestOnSegment(a,b){
 const d=difference(b,a),square=dot(d,d),t=square?clamp(-dot(a,d)/square,0,1):0;
 return length({x:a.x+d.x*t,y:a.y+d.y*t});
}
function circleHit(p,delta,a,b,radius){
 const q=difference(p,a),v=difference(delta,difference(b,a)),square=dot(v,v),approach=dot(q,v);
 const gap=dot(q,q)-radius*radius;
 if(gap<=EPS){
  if(approach>=-EPS)return null;
  const size=length(q);
  return {t:0,normal:size?{x:q.x/size,y:q.y/size}:{x:1,y:0}};
 }
 if(square<EPS||approach>=0)return null;
 const discriminant=approach*approach-square*gap;
 if(discriminant<0)return null;
 const t=(-approach-Math.sqrt(discriminant))/square;
 if(t<0||t>1)return null;
 const normal={x:q.x+v.x*t,y:q.y+v.y*t},size=length(normal);
 return {t,normal:{x:normal.x/size,y:normal.y/size}};
}
function rectangleHit(p,d,box){
 let enter=-Infinity,exit=Infinity,normal=null;
 for(const axis of ['x','y']){
  const min=axis==='x'?box.x-14:box.y-14,max=axis==='x'?box.x+box.width+14:box.y+box.height+14;
  if(Math.abs(d[axis])<EPS){if(p[axis]<=min+EPS||p[axis]>=max-EPS)return null;continue;}
  const first=(min-p[axis])/d[axis],second=(max-p[axis])/d[axis],near=Math.min(first,second),far=Math.max(first,second);
  if(near>enter){enter=near;normal=axis==='x'?{x:d.x>0?-1:1,y:0}:{x:0,y:d.y>0?-1:1};}
  exit=Math.min(exit,far);
  if(enter>exit)return null;
 }
 return normal&&enter>=-EPS&&enter<=1&&exit>=0?{t:Math.max(0,enter),normal}:null;
}
function staticHit(p,d,arena){
 const bounds=arenaBounds(arena);let hit=null;
 const consider=value=>{if(value&&value.t>=-EPS&&value.t<=1&&(!hit||value.t<hit.t))hit={...value,t:Math.max(0,value.t)};};
 if(d.x<0)consider({t:(bounds.minX-p.x)/d.x,normal:{x:1,y:0}});
 if(d.x>0)consider({t:(bounds.maxX-p.x)/d.x,normal:{x:-1,y:0}});
 if(d.y<0)consider({t:(bounds.minY-p.y)/d.y,normal:{x:0,y:1}});
 if(d.y>0)consider({t:(bounds.maxY-p.y)/d.y,normal:{x:0,y:-1}});
 for(const obstacle of arena.obstacles??[])consider(rectangleHit(p,d,obstacle));
 return hit;
}
function removeInward(vector,normal,surface={x:0,y:0}){
 const inward=Math.min(0,dot(difference(vector,surface),normal));
 return {x:vector.x-normal.x*inward,y:vector.y-normal.y*inward};
}
function staticCorrection(position,delta,arena){
 let remaining={...delta};
 for(let i=0;i<3&&length(remaining)>EPS;i++){
  const hit=staticHit(position,remaining,arena),fraction=hit?.t??1;
  position.x+=remaining.x*fraction;position.y+=remaining.y*fraction;
  if(!hit)break;
  remaining=removeInward({x:remaining.x*(1-fraction),y:remaining.y*(1-fraction)},hit.normal);
 }
}

export function createCrowdCollisionFrame({people=[],startMs=0,endMs=startMs,stage={},timing,radius=22,radii}={}){
 const fallbackRadius=clamp(Number.isFinite(radius)?radius:22,20,32);
 // Snapshot sizes for this whole frame. Friendship gained by its encounters
 // takes effect next frame; a zero-sized friend still earns pass measurements.
 const duration=Math.max(0,endMs-startMs),measurements=people.map((_,index)=>{
  const size=Array.isArray(radii)?radii[index]:undefined;
  const contactRadius=Number.isFinite(size)&&size>=0?clamp(size,0,40):fallbackRadius;
  return {contactRadius,nearest:Infinity,physicalContact:false,travel:0};
 });
 const sample=(index,progress)=>stage.crowdAnchors?.length
  ?crowdPosition(index,startMs+duration*progress,stage.crowdAnchors,stage.crowdSpeed??1,timing)
  :{x:people[index].node.x,y:people[index].node.y};

 function record(before,after,from,to,driven){
  for(let i=0;i<people.length;i++){
   const nearest=nearestOnSegment(difference(before,sample(i,from)),difference(after,sample(i,to))),measurement=measurements[i];
   measurement.nearest=Math.min(measurement.nearest,nearest);
   measurement.physicalContact ||= measurement.contactRadius>0&&nearest<=measurement.contactRadius+CONTACT_SLOP;
   measurement.travel+=driven;
  }
 }

 function resolvePiece(position,displacement,from,to,arena){
  const starts=people.map((_,i)=>sample(i,from)),ends=people.map((_,i)=>sample(i,to));
  record(position,position,from,from,0);
  // A dancer may already overlap after a pin or reset. Corrections cannot cross
  // scenery, count as player travel, or erase the original physical contact.
  for(let pass=0;pass<3;pass++){
   let corrected=false;
   for(let i=0;i<starts.length;i++){
    const contactRadius=measurements[i].contactRadius;
    if(contactRadius===0)continue;
    const q=difference(position,starts[i]),distance=length(q),depth=contactRadius-distance;
    if(depth<=EPS)continue;
    measurements[i].physicalContact=true;
    const normal=distance>EPS?{x:q.x/distance,y:q.y/distance}:{x:1,y:0},before={x:position.x,y:position.y};
    staticCorrection(position,{x:normal.x*(depth+SKIN),y:normal.y*(depth+SKIN)},arena);
    record(before,position,from,from,0);corrected ||= length(difference(position,before))>EPS;
   }
   if(!corrected)break;
  }
  let at=0,velocity={...displacement},drive={...displacement},drivenDistance=0;
  for(let iteration=0;iteration<MAX_CONTACTS&&at<1-EPS;iteration++){
   const remaining=1-at,delta={x:velocity.x*remaining,y:velocity.y*remaining};
   let hit=staticHit(position,delta,arena);
   for(let i=0;i<starts.length;i++){
    const contactRadius=measurements[i].contactRadius;
    if(contactRadius===0)continue;
    const candidate=circleHit(position,delta,lerp(starts[i],ends[i],at),ends[i],contactRadius);
    if(candidate&&(!hit||candidate.t<hit.t-EPS))hit={...candidate,index:i};
   }
   const next=at+remaining*(hit?.t??1),before={x:position.x,y:position.y},travel=length(drive)*(next-at);
   position.x+=velocity.x*(next-at);position.y+=velocity.y*(next-at);
   record(before,position,from+(to-from)*at,from+(to-from)*next,travel);drivenDistance+=travel;at=next;
   if(!hit)break;
   const surface=hit.index===undefined?{x:0,y:0}:difference(ends[hit.index],starts[hit.index]);
   if(hit.index!==undefined)measurements[hit.index].physicalContact=true;
   velocity=removeInward(velocity,hit.normal,surface);
   drive=removeInward(drive,hit.normal);
  }
  // Conflicting moving bodies may pin the player against scenery. Holding the
  // safe point is preferable to teleporting; the remaining contact still counts.
  if(at<1-EPS)record(position,position,from+(to-from)*at,to,0);
  return drivenDistance;
 }

 return {
  resolveStep(position,direction,ms,options={}){
   const progressStart=clamp(options.progressStart??0,0,1),progressEnd=clamp(options.progressEnd??1,progressStart,1);
   const arena={...stage,...options},speed=Math.max(0,Number.isFinite(options.speed)?options.speed:300),size=length(direction);
   const distance=speed*Math.max(0,Number.isFinite(ms)?ms:0)/1000;
   // Sampling the authored curve in short intervals also covers a crowd frame
   // longer than the player's capped motion time, using normalized progress.
   const pieces=Math.min(32,Math.max(1,Math.ceil(duration*(progressEnd-progressStart)/10),Math.ceil(ms/5)));
   const displacement=size?{x:direction.x/size*distance/pieces,y:direction.y/size*distance/pieces}:{x:0,y:0};
   let drivenDistance=0;
   for(let i=0;i<pieces;i++)drivenDistance+=resolvePiece(position,displacement,progressStart+(progressEnd-progressStart)*i/pieces,progressStart+(progressEnd-progressStart)*(i+1)/pieces,arena);
   return {drivenDistance};
  },
  measurement(index){return measurements[index]?{...measurements[index]}:undefined;},
 };
}
