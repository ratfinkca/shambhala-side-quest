// Versioned data shared by the SMF client and server.
export const SMF_RULES=Object.freeze({id:'smf-v1',editionId:'smf',route:Object.freeze([
 Object.freeze({id:'smf-living-room',durationMs:68571,rate:20,crowdCount:10}),
 Object.freeze({id:'smf-fractal',durationMs:64000,rate:22,crowdCount:12}),
 Object.freeze({id:'smf-grove',durationMs:58182,rate:24,crowdCount:14}),
 Object.freeze({id:'smf-amp',durationMs:54857,rate:26,crowdCount:16}),
 Object.freeze({id:'smf-pagoda',durationMs:60000,rate:28,crowdCount:18}),
 Object.freeze({id:'smf-village',durationMs:66977,rate:30,crowdCount:20}),
]),endless:Object.freeze({targetStep:3,targetCap:45,crowdStep:2,crowdCap:22,speedStep:.08,speedCap:.2})});
export const SMF_DEFAULT_RUSH_STAGE_ID='smf-pagoda';
export const isSmfRushStageId=id=>SMF_RULES.route.some(stage=>stage.id===id);
export function smfRuleStage(mode,index,rushStageId){
 if(!['rush','festival','endless'].includes(mode)||!Number.isSafeInteger(index)||index<0||(mode==='rush'&&index!==0)||(mode==='festival'&&index>=6)||(rushStageId!==undefined&&(mode!=='rush'||!isSmfRushStageId(rushStageId))))throw new RangeError('Invalid SMF stage');
 const loop=mode==='endless'?Math.floor(index/6):0;
 const base=mode==='rush'?SMF_RULES.route.find(stage=>stage.id===(rushStageId??SMF_DEFAULT_RUSH_STAGE_ID)):SMF_RULES.route[index%6],scale=SMF_RULES.endless;
 return {id:base.id,timingId:`${base.id}-clock-preview-1`,durationMs:base.durationMs,target:mode==='rush'?0:Math.ceil(Math.min(scale.targetCap,base.rate+loop*scale.targetStep)*base.durationMs/60000),loop:loop+1,crowdCount:Math.min(scale.crowdCap,base.crowdCount+loop*scale.crowdStep),crowdSpeed:1+Math.min(scale.speedCap,loop*scale.speedStep)};
}
