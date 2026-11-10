import {createDelivery,stepDelivery} from './amp-delivery.js';

// This controller owns only one disposable visit. It has no profile or service
// dependencies; a preview celebration is never a persistent cosmetic receipt.
export function createDeliveryPractice(options){
 let state=createDelivery(options),status='ready';
 const original=createDelivery(options),dancerIds=[...new Set(options.dancerIds??original.recipientIds)];
 const keys=(value,names)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===names.length&&names.every(name=>Object.hasOwn(value,name));
 const list=(value,allowed,max)=>Array.isArray(value)&&value.length<=max&&new Set(value).size===value.length&&value.every(id=>allowed.includes(id));
 function restore(snapshot){
  if(!keys(snapshot,['version','kind','status','state'])||snapshot.version!==1||snapshot.kind!=='amp-delivery'||!['ready','playing','paused','complete','ended'].includes(snapshot.status))return false;
  const s=snapshot.state;
  if(!keys(s,Object.keys(original))||s.goal!==original.goal||!Number.isInteger(s.delivered)||s.delivered<0||s.delivered>s.goal||typeof s.carrying!=='boolean'||typeof s.atVendor!=='boolean'||typeof s.complete!=='boolean'||s.complete!==(s.delivered===s.goal)||(snapshot.status==='complete')!==s.complete)return false;
  if(!Array.isArray(s.recipientIds)||s.recipientIds.length!==original.recipientIds.length||s.recipientIds.some((id,i)=>id!==original.recipientIds[i]))return false;
  if(s.recipientId!==(s.complete?null:original.recipientIds[s.delivered%original.recipientIds.length])||(s.complete&&s.carrying))return false;
  if(!list(s.blockedEncounterIds,dancerIds,dancerIds.length)||!list(s.passEventIds,[...dancerIds,null],dancerIds.length+1))return false;
  if(snapshot.status==='ready'&&(s.delivered||s.carrying||s.atVendor||s.blockedEncounterIds.length||s.passEventIds.length))return false;
  state=structuredClone(s);status=snapshot.status==='playing'?'paused':snapshot.status;return true;
 }
 return {
  get state(){return state;},get status(){return status;},
  capture(){return {version:1,kind:'amp-delivery',status,state:structuredClone(state)};},
  restore,
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
