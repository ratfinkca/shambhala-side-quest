import {GENERIC_RULES,routePosition,genericTarget} from '../supabase/functions/_shared/edition-rules.js';
import {STAGES} from './stages.js';
import {variationFor,variationAnchors} from './stage-variations.js';
import {isOpen} from './geometry.js';

export function endlessStage(index){
 const {offset,loop}=routePosition(index,GENERIC_RULES.mainStageIds.length);
 const original=STAGES[offset],variation=variationFor(index),scaling=GENERIC_RULES.endless;
 const base=variation?{...original,obstacles:variation.obstacles,mud:variation.mud,flowSpawns:variation.flowSpawns}:original;
 const desired=Math.min(scaling.crowdCap,original.crowdAnchors.length+loop*scaling.crowdStep);
 const anchors=variation?variationAnchors(variation,base.spawn).slice(0,desired):base.crowdAnchors.map(p=>[...p]);
 // Deterministic additions keep a clear arrival area and room around cabinets.
 for(let y=180;y<=560&&anchors.length<desired;y+=25)for(let x=160;x<=820&&anchors.length<desired;x+=25){
  if(isOpen({x,y},75,base.obstacles)&&Math.hypot(x-base.spawn.x,y-base.spawn.y)>110&&anchors.every(([ax,ay])=>Math.hypot(x-ax,y-ay)>70))anchors.push([x,y]);
 }
 return {...base,variationId:variation?.id||'original',variationName:variation?.name||'Original clearing',variationDescription:variation?.description||'',target:genericTarget(index,true),crowdAnchors:anchors,crowdSpeed:1+Math.min(scaling.speedCap,loop*scaling.speedStep),loop:loop+1};
}
