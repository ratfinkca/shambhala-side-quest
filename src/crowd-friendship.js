// Relationships are local to one round. The canonical dancer order
// gives each person a stable size; clean passes change only that person's body.
const TYPES=[{kind:'small',offset:-8},{kind:'medium',offset:0},{kind:'large',offset:8}];
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function createCrowdFriendships(people,{baseRadius=26,enabled=true,passes=[],requiredPasses=4}={}){
 requiredPasses=[2,4,6].includes(requiredPasses)?requiredPasses:4;
 const base=clamp(Number.isFinite(baseRadius)?baseRadius:26,20,32),states=new Map();
 for(const [index,person] of people.entries()){
  const id=person?.id;if(typeof id!=='string'||!id||states.has(id))continue;
  const type=TYPES[index%TYPES.length];
  const saved=Array.isArray(passes)?passes[index]:undefined;
  const earned=Number.isInteger(saved)&&saved>=0&&saved<=requiredPasses?saved:0;
  states.set(id,{id,kind:type.kind,baseRadius:clamp(base+type.offset,12,40),passes:earned});
 }
 const snapshot=state=>({...state,...(requiredPasses===4?{}:{requiredPasses}),radius:state.baseRadius*(1-state.passes/requiredPasses),isFriend:state.passes===requiredPasses});
 return {
  get(id){const state=states.get(id);return state?snapshot(state):null;},
  record(encounters){
   if(!enabled)return [];
   const awarded=new Set(),milestones=[];
   for(const encounter of encounters){
    if(encounter?.closePass!==true||awarded.has(encounter.id))continue;
    const state=states.get(encounter.id);if(!state||state.passes===requiredPasses)continue;
    awarded.add(state.id);state.passes++;
    milestones.push({...snapshot(state),befriended:state.passes===requiredPasses});
   }
   return milestones;
  },
  summary(){
   let friends=0,connections=0,passes=0;
   for(const state of states.values()){
    if(state.passes>0)connections++;
    if(state.passes===requiredPasses)friends++;
    passes+=state.passes;
   }
   return {friends,connections,passes};
  },
  reset(){for(const state of states.values())state.passes=0;},
 };
}
