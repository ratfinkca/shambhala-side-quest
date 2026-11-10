import {deepFreeze,GENERIC_RULES} from '../../supabase/functions/_shared/edition-rules.js';
export default deepFreeze({
 id:'generic',name:'Festival Side Quest',profileKey:'sidequest.profile.v1',lockName:'sidequest.profile.v1',labPrefix:'sidequest.recovery-practice.',
 rulesetId:GENERIC_RULES.id,playable:true,postingEnabled:true,mainStageIds:GENERIC_RULES.mainStageIds,
 catalogue:[{id:'forest',name:'Living Forest',kind:'main',parentId:null},{id:'neon',name:'Neon Grove',kind:'main',parentId:null},{id:'sunrise',name:'Sunrise Clearing',kind:'main',parentId:null}],
 brand:{title:'Festival Side Quest',assetRoot:'themes/',titleArtByTheme:{}},
});
