import {smfPreviewStage} from '../editions/smf-stages.js';
import {getBonusVenue} from '../bonus-practice/config.js';
import {createBonusPractice} from '../bonus-practice/state.js';
import {createDeliveryPractice} from '../amp-delivery-practice.js';
import {AMP_DELIVERY_STAGE,DELIVERY_RECIPIENTS} from '../amp-delivery-view.js';
import {PRISM_CONFIG} from '../prism-practice/config.js';
import {createPrismPractice} from '../prism-practice/model.js';

export const mainStage=smfPreviewStage;
export function bonusConfig(id){
 if(id==='prism-party')return PRISM_CONFIG;
 if(id!=='amp-backstage')return getBonusVenue(id);
 return {id,name:'AMP backstage',dj:'S2',activity:'delivery',stage:AMP_DELIVERY_STAGE,timingId:AMP_DELIVERY_STAGE.timingId,goal:3,
  instruction:'Pick up a sandwich. Find the matching costume and smooth-pass them. Wrong passes give it away; bumps drop it.'};
}
export function bonusController(config){
 if(config.activity==='prism')return createPrismPractice();
 return config.activity==='delivery'?createDeliveryPractice({goal:3,recipientIds:DELIVERY_RECIPIENTS.map(p=>p.id),dancerIds:config.stage.crowdAnchors.map((_,i)=>`dancer-${i}`)}):createBonusPractice(config);
}
// Authored side-lane locations, away from speakers, Flow and the stage apron.
export const INVITATIONS={
 'smf-living-room':{x:870,y:554},'smf-grove':{x:870,y:550},
 'smf-amp':{x:90,y:550},'smf-pagoda':{x:870,y:550},'smf-village':{x:90,y:550},
 'smf-fractal':{x:90,y:550},
};
