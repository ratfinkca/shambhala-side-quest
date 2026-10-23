import {createArcadeHandler} from './arcade.js';
export function serveArcade(kind:string){
 Deno.serve(createArcadeHandler({kind,origins:(Deno.env.get('ARCADE_ORIGINS')||'').split(',').map(s=>s.trim()).filter(Boolean),secret:Deno.env.get('ARCADE_RATE_SECRET')||'',
 async rpc(name:string,body:unknown){
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!url||!key)throw Error();
 const response=await fetch(`${url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(4000)});
 if(!response.ok)throw Error();return response.json();
 }}));
}
