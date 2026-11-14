import {createPixelProp} from '../pixel-art/props.js';
import {playerAvatarAnchors} from '../pixel-art/player-anchors.js';
import {createPuttingReward} from '../bonus-practice/putting-reward.js';
import {createHeldPropView} from '../pixel-art/held-prop.js';
import {setAvatarCarry} from '../Avatar.js';

function drawRabbitEars(g,fit){
 const cx=Math.round(fit.x),base=Math.round(fit.y),side=Boolean(fit.side),flip=Boolean(fit.flipX);
 const half=Math.round(Math.max(16,Math.min(22,fit.width??19))/2);
 const r=(colour,x,y,w,h)=>g.fillStyle(colour).fillRect(cx+Math.round(flip?-x-w:x),base+y,w,h);
 // The band touches the measured cap opening; profile ears overlap naturally.
 r(0x302a48,-half,-2,half*2,3);r(0xd9c5bd,-half+1,-1,half*2-2,2);
 for(const [x,tip]of side?[[-5,-14],[1,-17]]:[[-7,-17],[3,-17]]){
  r(0x302a48,x+1,tip,3,2);r(0x302a48,x,tip+2,5,-tip-3);
  r(0xffefcf,x+1,tip+2,3,-tip-4);r(0xdcc9b1,x+1,-4,3,2);
  if(!fit.back)r(0xe79db6,x+2,tip+4,1,-tip-7);
 }
}

function drawPrismCrown(g,fit,elapsed,reduced){
 const cx=Math.round(fit.x),base=Math.round(fit.y),half=Math.round(Math.max(16,Math.min(22,fit.width??19))/2);
 const r=(colour,x,y,w,h,alpha=1)=>g.fillStyle(colour,alpha).fillRect(cx+Math.round(fit.flipX?-x-w:x),base+y,w,h);
 // The fitted band shares the ears' cap socket. Profile crystals compress
 // around that socket and mirror with the face, rather than the body origin.
 r(0x302a48,-half,-2,half*2,3);r(0x62898b,-half+1,-1,half*2-2,2);
 const crystals=fit.side?[[-5,-9],[0,-12],[5,-8]]:[[-7,-9],[0,-12],[7,-9]];
 const colours=[0x78e8dd,0xed8bce,0xffca79];
 for(const [i,[x,tip]]of crystals.entries()){
  r(0x302a48,x,tip,1,1);r(0x302a48,x-1,tip+1,3,2);r(0x302a48,x-2,tip+3,5,-tip-4);
  r(colours[i],x,tip+1,1,2);r(colours[i],x-1,tip+3,3,-tip-5);
  // Only one tiny facet per crystal changes brightness. Rear facets are
  // quieter, while reduced motion keeps every highlight at a fixed level.
  const shine=(reduced?.55:.3+.35*Math.max(0,Math.sin(elapsed*.003-i*Math.PI*2/3)))*(fit.back?.65:1);
  r(0xf2f8e0,x-1,tip+3,1,2,shine);
 }
}

// An edition-owned accessory layer; generic wardrobe IDs remain unchanged.
export function createSouvenirView(scene){
 const headLayer=scene.add.container(0,0).setDepth(23),g=scene.add.graphics(),chicken=createPuttingReward(scene,{manageCarry:false});
 const blossom=createPixelProp(scene,'blossom',{size:17}).setVisible(false);headLayer.add([g,blossom]);
 const lantern=createHeldPropView(scene,'lantern-on'),cheese=createHeldPropView(scene,'toast');
 let carrying=false,destroyed=false;
 return {
  update(id,elapsed=0,reduced=false){
   if(destroyed)return;
   // Completing the putting activity already displays the temporary chicken.
   // Prefer that prize to a second equipped staff for its celebration.
   const puttingPrize=Boolean(scene.config?.activity==='putt'&&scene.practice?.state.complete);
   const nextCarry=puttingPrize||['lantern-totem','cheese-totem','golden-chicken'].includes(id);
   if(nextCarry!==carrying){carrying=nextCarry;setAvatarCarry(scene.avatar??scene.dancer,nextCarry);}
   g.clear();const player=scene.dancer,avatar=scene.avatar??player,{head,headwear}=playerAvatarAnchors(scene);
   const visible=player.visible!==false&&avatar.visible!==false;
   const sx=Number.isFinite(player.scaleX)?player.scaleX:1,sy=Number.isFinite(player.scaleY)?player.scaleY:1;
   const alpha=(Number.isFinite(player.alpha)?player.alpha:1)*(avatar!==player&&Number.isFinite(avatar.alpha)?avatar.alpha:1);
   const depth=Number.isFinite(player.depth)?player.depth:20;
   headLayer.setPosition(player.x,player.y).setScale(sx,sy).setAlpha(alpha).setDepth(depth+3).setVisible(visible);
   blossom.setVisible(Boolean(visible&&id==='glow-blossom'));
   chicken.update(scene.dancer,elapsed,reduced,id==='golden-chicken'&&visible&&!puttingPrize);
   lantern.update(scene.dancer,elapsed,reduced,id==='lantern-totem'&&visible&&!puttingPrize);
   cheese.update(scene.dancer,elapsed,reduced,id==='cheese-totem'&&visible&&!puttingPrize);
   if(!visible)return;
   const fit=headwear??{x:head.x,y:head.y-2,crown:{x:head.x,y:head.y-8},width:19};
   if(id==='rabbit-ears'){
    drawRabbitEars(g,fit);
   }else if(id==='prism-crown'){
    drawPrismCrown(g,fit,elapsed,reduced);
   }else if(id==='glow-blossom'){
    const side=Boolean(fit.side),offset=side?-3:Math.min(6,(fit.width??19)*.28),sign=fit.flipX?-1:1;
    blossom.setPosition(Math.round(fit.x+offset*sign),Math.round((fit.crown?.y??fit.y-6)+4));
    blossom.setScale(side?.8:1,1);blossom.propSprite?.setFlipX(Boolean(fit.flipX));
    blossom.setAlpha(reduced?1:.9+Math.sin(elapsed*.003)*.1);
   }
  },destroy(){if(destroyed)return;destroyed=true;if(carrying)setAvatarCarry(scene.avatar??scene.dancer,false);headLayer.destroy();chicken.destroy();lantern.destroy();cheese.destroy();},
 };
}
