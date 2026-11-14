// Presentation only: read completed encounter results without changing a
// dancer, an encounter, or scoring. Round time also freezes reactions on pause.
export function createCrowdReactions(scene){
 const duration=900,cooldowns=new Map();
 let active=[],nextAt=-Infinity,lastTime=-Infinity,disposed=false;
 function clear(){for(const reaction of active)reaction.label.destroy();active=[];}
 function reset(){clear();cooldowns.clear();nextAt=-Infinity;lastTime=-Infinity;}
 function update(encounters,elapsed,reducedMotion=false,enabled=true){
  if(disposed||!Number.isFinite(elapsed))return;
  if(elapsed<lastTime)reset();lastTime=elapsed;
  if(!enabled){clear();return;}
  const people=scene.crowd?.people||[];
  active=active.filter(reaction=>{
   const person=people.find(person=>person.id===reaction.id),progress=(elapsed-reaction.started)/duration;
   if(!person||progress>=1){reaction.label.destroy();return false;}
   reaction.label.setPosition(person.node.x,person.node.y-37-(reducedMotion?0:progress*9)).setAlpha(Math.max(0,1-progress));
   return true;
  });
  if(elapsed<nextAt||active.length>=2)return;
  for(const encounter of encounters||[]){
   const friendship=encounter.closePass?encounter.friendship:null;
   if(!encounter.contactStarted&&!encounter.closePass||!friendship&&elapsed<(cooldowns.get(encounter.id)??-Infinity))continue;
   const person=people.find(person=>person.id===encounter.id);if(!person)continue;
   const contact=encounter.contactStarted,index=people.indexOf(person);
   const text=friendship?friendship.befriended?'New friend! ♥':`${friendship.passes===1?'Nice moves!':friendship.passes===(friendship.requiredPasses??4)-1?'Almost friends':'Getting closer'} · ${friendship.passes}/${friendship.requiredPasses??4}`:contact?['Oop!','All good!','Hey there!'][index%3]:['Nice moves!','Smooth!','Good flow!'][index%3];
   const label=scene.add.text(person.node.x,person.node.y-37,text,{fontFamily:'Silkscreen, monospace',fontSize:'12px',fontStyle:'normal',color:contact?'#f9ddae':'#c9ffdb',backgroundColor:'#123734',padding:{x:6,y:4}}).setOrigin(.5,1).setDepth(35);
   active.push({id:person.id,label,started:elapsed});cooldowns.set(person.id,elapsed+8000);nextAt=elapsed+1200;break;
  }
 }
 return {update,reset,destroy(){if(disposed)return;reset();disposed=true;}};
}
