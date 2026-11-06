// A held browser lock, never a time-based lease: suspended tabs retain ownership.
export function createRecoveryOwner({locks,name='sidequest.profile.v1'}={}){
 let held=false,supported=!!locks?.request,generation=0,unlock=null,pending=null;
 return {get held(){return held},get supported(){return supported},
  acquire(){
   if(held)return Promise.resolve('owned');if(!supported)return Promise.resolve('unsupported');if(pending)return pending;
   const token=generation;
   pending=new Promise(resolve=>{
    Promise.resolve().then(()=>locks.request(name,{mode:'exclusive',ifAvailable:true},async lock=>{
     if(token!==generation){resolve('released');return;}
     if(!lock){resolve('busy');return;}
     held=true;resolve('owned');await new Promise(r=>unlock=r);held=false;
    })).catch(()=>{if(token===generation)supported=false;resolve('unsupported')});
   }).finally(()=>pending=null);return pending;
  },
  release(){generation++;held=false;unlock?.();unlock=null;},
 };
}
