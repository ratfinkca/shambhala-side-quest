import {createCrowdReactions} from './crowd-reactions.js';

const colours={small:0x99e1cb,medium:0xefd58d,large:0xecb5ca},baselineColour=0xb2c5c1;

// A display owner only. The scene awards friendship; this view reads the
// resulting bonds without changing positions, encounters or progression.
export function createCrowdSocialView(scene){
 const marks=scene.add.graphics().setDepth(33),diagnostics=scene.add.graphics().setDepth(34);
 const reactions=createCrowdReactions(scene),observedPasses=new Map();
 let disposed=false;
 const people=()=>scene.crowd?.people||[];
 function clearMarks(){
  marks.clear();diagnostics.clear();
  for(const person of people())person.ring?.setAlpha?.(0);
 }
 function reset(){if(disposed)return;clearMarks();reactions.reset();observedPasses.clear();}
 function paint(friendships,{enabled=true,debug=false}={}){
  if(disposed)return;
  clearMarks();
  if(scene.round?.ended||!friendships){reactions.reset();observedPasses.clear();return;}
  for(const person of people()){
   const bond=friendships.get(person.id);if(!bond)continue;
   observedPasses.set(person.id,bond.passes);
   if(person.node?.visible===false)continue;
   const r=enabled?bond.radius:27,colour=enabled?(colours[bond.kind]??baselineColour):baselineColour;
   const x=person.node.x,y=person.node.y,near=Math.hypot(scene.dancer.x-x,scene.dancer.y-y)<120;
   person.ring?.setRadius?.(r);person.ring?.setStrokeStyle?.(1.5,colour,.65);person.ring?.setAlpha?.(near&&r>0?.5:0);
   // The inner pulse follows the actual body; the outer smooth-pass boundary
   // remains fixed. Some scene-test stubs intentionally omit child lists.
   const rings=Array.isArray(person.smooth?.list)?person.smooth.list:[];
   rings[0]?.setRadius?.(r);rings[0]?.setVisible?.(r>0);
   rings[1]?.setRadius?.((r+48)/2);rings[2]?.setRadius?.(48);
   if(debug){
    diagnostics.lineStyle(1,0xc8f7e7,.2).strokeCircle(x,y,48);
    if(r>0)diagnostics.lineStyle(1.5,colour,.85).strokeCircle(x,y,r);
   }
   if(!enabled||!bond.passes)continue;
   if(bond.isFriend){
    marks.fillStyle(0xbaf0cf,.95).fillCircle(x+13,y-28,3).fillCircle(x+18,y-28,3).fillTriangle(x+10,y-27,x+21,y-27,x+15.5,y-21);
   }else if(near){
    for(let i=0;i<4;i++)marks.fillStyle(i<bond.passes?0xbaf0cf:0x132e30,i<bond.passes?.95:.6).fillCircle(x-7.5+i*5,y+22,1.8);
   }
  }
  if(debug)diagnostics.fillStyle(0xffffff,.9).fillCircle(scene.dancer.x,scene.dancer.y,2);
 }
 function update(encounters,elapsed,friendships,{reducedMotion=false,enabled=true,debug=false,reactions:showReactions=true}={}){
  if(disposed)return;
  const visible=people().filter(person=>person.node?.visible!==false),visibleIds=new Set(visible.map(person=>person.id));
  const show=showReactions&&!scene.round?.ended&&visible.length>0&&!!friendships;
  const enriched=(encounters||[]).filter(encounter=>visibleIds.has(encounter.id)).map(encounter=>{
   const bond=enabled&&encounter.closePass?friendships?.get(encounter.id):null;
   const progressed=bond&&bond.passes>(observedPasses.get(encounter.id)??0);
   const friendship=enabled&&encounter.closePass?(encounter.friendship??(progressed?{...bond,befriended:bond.isFriend}:undefined)):undefined;
   return {...encounter,friendship};
  });
  reactions.update(enriched,elapsed,reducedMotion,show);
  paint(friendships,{enabled,debug});
 }
 function destroy(){if(disposed)return;reset();reactions.destroy();marks.destroy();diagnostics.destroy();disposed=true;}
 return {paint,update,reset,destroy};
}
