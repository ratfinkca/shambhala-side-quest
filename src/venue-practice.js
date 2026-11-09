import {SMF_PREVIEW_STAGES,smfPreviewStage} from './editions/smf-stages.js';
import {createSMFStageView} from './editions/smf-stage-view.js';
import {smfPreviewVoices} from './editions/smf-music.js';
import {preloadSMFVenueArt} from './editions/smf-venue-assets.js';
export function venuePracticeConfig(){
 return {choices:SMF_PREVIEW_STAGES.map(stage=>({id:stage.id,label:stage.name,timingId:stage.timingId})),initialId:'smf-living-room',resolveStage:smfPreviewStage,venueView:createSMFStageView,timedVoices:smfPreviewVoices,preload:preloadSMFVenueArt};
}
