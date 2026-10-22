import {validatePlaytestBatch} from '../../supabase/functions/_shared/playtest.js';
export function createPlaytestTransport({send,consent}){
 let queue=[],pending=false,generation=0,controller;
 return {
  enqueue(event){
   if(!consent()||!validatePlaytestBatch([event]).ok)return false;
   queue.push({event:structuredClone(event),attempts:0});queue=queue.slice(-100);return true;
  },
  size:()=>queue.length,
  stop(){generation++;queue=[];controller?.abort();},
  async flush(){
   if(!consent()){this.stop();return;}if(pending||!queue.length)return;
   const batch=[];
   while(queue.length&&batch.length<20){if(!validatePlaytestBatch([...batch.map(x=>x.event),queue[0].event]).ok)break;batch.push(queue.shift());}
   if(!batch.length)return;
   pending=true;const token=generation;controller=new AbortController();
   try{
    const ok=await send(batch.map(x=>x.event),controller.signal);
    if(!ok&&token===generation&&consent())queue=[...batch.filter(x=>x.attempts++<1),...queue].slice(-100);
   }catch{
    if(token===generation&&consent())queue=[...batch.filter(x=>x.attempts++<1),...queue].slice(-100);
   }finally{pending=false;controller=null;}
  },
 };
}
export function createPlaytestSender(endpoint,fetcher=fetch){
 return async(events,signal)=>{
  const timeout=AbortSignal.timeout(5000);
  const response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(events),signal:AbortSignal.any([signal,timeout]),keepalive:true,credentials:'omit'});
  if(!response.ok)return false;
  const body=await response.json();return Array.isArray(body.accepted)&&events.every(e=>body.accepted.includes(e.eventId));
 };
}
