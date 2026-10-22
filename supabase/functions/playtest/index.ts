import {createPlaytestHandler} from '../_shared/http.js';
const origins=(Deno.env.get('PLAYTEST_ORIGINS')||'').split(',').map(s=>s.trim()).filter(Boolean);
Deno.serve(createPlaytestHandler({
 origins,secret:Deno.env.get('PLAYTEST_RATE_SECRET')||'',
 async ingest(events:unknown[],bucket:string){
  const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!key)throw new Error('Not configured');
  const response=await fetch(`${url}/rest/v1/rpc/ingest_playtest`,{
   method:'POST',headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${key}`},
   body:JSON.stringify({p_events:events,p_bucket:bucket}),signal:AbortSignal.timeout(4000),
  });
  if(!response.ok)throw new Error('Storage unavailable');
  return response.json();
 },
}));
