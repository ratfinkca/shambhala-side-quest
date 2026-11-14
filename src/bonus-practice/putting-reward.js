import {setAvatarCarry} from '../Avatar.js';
import {createHeldPropView} from '../pixel-art/held-prop.js';

// The practice prize remains scene-local. The Tour owns carry selection when
// its permanent souvenir view is present, so the two layers cannot fight.
export function createPuttingReward(scene,{manageCarry=true}={}){
 const view=createHeldPropView(scene,'chicken',{size:27,colour:0xffd882,sparkles:true});
 let carrying=false;
 return {
  update(player,elapsedMs=0,reducedMotion=false,visible=false){
   const next=Boolean(visible&&player&&player.visible!==false);
   // The putting view paints before the Tour's souvenir view. Enter the held
   // pose before reading its palm so the first prize frame cannot use a swing.
   if(manageCarry&&next)setAvatarCarry(scene.avatar??player,true);
   if(manageCarry&&!scene.souvenirView&&next!==carrying){carrying=next;setAvatarCarry(scene.avatar??player,next);}
   view.update(player,elapsedMs,reducedMotion,next);
  },
  destroy(){if(carrying)setAvatarCarry(scene.avatar??scene.dancer,false);view.destroy();},
 };
}
