import {CHALLENGES,normalizeChallenge} from '../supabase/functions/_shared/challenges.js';
import {isOpen} from './geometry.js';

// Keep each venue's authored paths and mixed bodies; only change population.
export function challengeStage(stage,challenge,{endless=false}={}){
 const rules=CHALLENGES[normalizeChallenge(challenge)];
 if(rules.crowdScale===1&&rules.targetScale===1)return stage;
 const desired=Math.min(endless?rules.crowdCap:Infinity,Math.round(stage.crowdAnchors.length*rules.crowdScale));
 const anchors=stage.crowdAnchors.slice(0,desired).map(p=>[...p]),bounds=stage.playBounds||{minX:0,minY:0,maxX:960,maxY:640};
 for(let y=Math.max(180,bounds.minY+60);y<=Math.min(560,bounds.maxY-60)&&anchors.length<desired;y+=25){
  for(let x=Math.max(160,bounds.minX+60);x<=Math.min(820,bounds.maxX-60)&&anchors.length<desired;x+=25){
   if(isOpen({x,y},60,stage.obstacles)&&Math.hypot(x-stage.spawn.x,y-stage.spawn.y)>110&&anchors.every(([ax,ay])=>Math.hypot(x-ax,y-ay)>60))anchors.push([x,y]);
  }
 }
 return {...stage,target:Math.round(stage.target*rules.targetScale),crowdAnchors:anchors};
}
