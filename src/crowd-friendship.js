// Relationships are local to one round. The canonical dancer order
// gives each person a stable size; clean passes change only that person's body.
const TYPES=[{kind:'small',offset:-8},{kind:'medium',offset:0},{kind:'large',offset:8}];
const SCALE=[1,.75,.5,.25,0];
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function createCrowdFriendships(people,{baseRadius=26,enabled=true,passes=[]}={}){
 const base=clamp(Number.isFinite(baseRadius)?baseRadius:26,20,32),states=new Map();
 for(const [index,person] of people.entries()){
  const id=person?.id;if(typeof id!=='string'||!id||states.has(id))continue;
  const type=TYPES[index%TYPES.length];
  const saved=Array.isArray(passes)?passes[index]:undefined;
  const earned=Number.isInteger(saved)&&saved>=0&&saved<=4?saved:0;
  states.set(id,{id,kind:type.kind,baseRadius:clamp(base+type.offset,12,40),passes:earned});
 }
 const snapshot=state=>({...state,radius:state.baseRadius*SCALE[state.passes],isFriend:state.passes===4});
 return {
  get(id){const state=states.get(id);return state?snapshot(state):null;},
  record(encounters){
   if(!enabled)return [];
   const awarded=new Set(),milestones=[];
   for(const encounter of encounters){
    if(encounter?.closePass!==true||awarded.has(encounter.id))continue;
    const state=states.get(encounter.id);if(!state||state.passes===4)continue;
    awarded.add(state.id);state.passes++;
    milestones.push({...snapshot(state),befriended:state.passes===4});
   }
   return milestones;
  },
  summary(){
   let friends=0,connections=0,passes=0;
   for(const state of states.values()){
    if(state.passes>0)connections++;
    if(state.passes===4)friends++;
    passes+=state.passes;
   }
   return {friends,connections,passes};
  },
  reset(){for(const state of states.values())state.passes=0;},
 };
}
