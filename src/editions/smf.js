import {deepFreeze} from '../../supabase/functions/_shared/edition-rules.js';
export default deepFreeze({
 id:'smf',name:'Shambhala Side Quest',profileKey:'sidequest.smf.profile.v1',lockName:'sidequest.smf.profile.v1',labPrefix:'sidequest.smf.recovery-practice.',
 rulesetId:null,playable:false,postingEnabled:false,
 mainStageIds:['smf-living-room','smf-amp','smf-fractal','smf-grove','smf-pagoda','smf-village'],
 catalogue:[
  {id:'smf-amp',name:'The AMP',kind:'main',parentId:null},
  {id:'smf-fractal',name:'Fractal Forest',kind:'main',parentId:null},
  {id:'smf-grove',name:'The Grove',kind:'main',parentId:null},
  {id:'smf-living-room',name:'The Living Room',kind:'main',parentId:null},
  {id:'smf-pagoda',name:'The Pagoda',kind:'main',parentId:null},
  {id:'smf-village',name:'The Village',kind:'main',parentId:null},
  {id:'smf-rabbit-hole',name:'Rabbit Hole',kind:'secret',parentId:'smf-living-room'},
  {id:'smf-secret-garden',name:'Secret Garden',kind:'secret',parentId:'smf-grove'},
  {id:'smf-ikigai-mori',name:'Ikigai Mori',kind:'secret',parentId:'smf-pagoda'},
 ],
 brand:{title:'Shambhala Side Quest',assetRoot:'themes/',titleArtByTheme:Object.fromEntries(['forest-freakout','moonlit-mycelium','neon-field-trip'].map(id=>[id,`themes/${id}/title.webp`]))},
});
