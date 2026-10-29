import {STAGES} from './stages.js';
import {isOpen} from './geometry.js';

export function endlessStage(index){
 const base=STAGES[index%3],loop=Math.floor(index/3);
 const anchors=base.crowdAnchors.map(p=>[...p]);
 const desired=Math.min(22,anchors.length+loop*2);
 // Deterministic additions keep a clear arrival area and room around cabinets.
 for(let y=180;y<=560&&anchors.length<desired;y+=25)for(let x=160;x<=820&&anchors.length<desired;x+=25){
  if(isOpen({x,y},75,base.obstacles)&&Math.hypot(x-base.spawn.x,y-base.spawn.y)>110&&anchors.every(([ax,ay])=>Math.hypot(x-ax,y-ay)>70))anchors.push([x,y]);
 }
 return {...base,target:Math.min(45,base.target+loop*3),crowdAnchors:anchors,crowdSpeed:1+Math.min(.2,loop*.08),loop:loop+1};
}
