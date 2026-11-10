import {createDelivery,stepDelivery} from './amp-delivery.js';

// This controller owns only one disposable visit. It has no profile or service
// dependencies; a preview celebration is never a persistent cosmetic receipt.
export function createDeliveryPractice(options){
 let state=createDelivery(options),status='ready';
 return {
  get state(){return state;},get status(){return status;},
  start(){state=createDelivery(options);status='playing';},
  pause(){if(status==='playing')status='paused';},
  resume(){if(status==='paused')status='playing';},
  finish(){if(status==='playing'||status==='paused')status='ended';},
  step(frame){
   if(status!=='playing')return null;
   const event=stepDelivery(state,frame);
   if(state.complete)status='complete';
   return event;
  },
 };
}
