import {createPixelProp} from './props.js';
import {getAvatarAnchors} from '../Avatar.js';
import {playerAvatarAnchors} from './player-anchors.js';
import {SKIN_PALETTES} from './actor-wardrobe.js';
import {staffLayout,drawTotemPole,drawTotemGrip} from './actor-totems.js';

// Earned staffs use the same grip and scale as wardrobe totems. Keeping the
// hand on its own layer lets an upward-facing prop sit behind the actor.
export function createHeldPropView(scene,kind,{size=26,colour=0xb4a17b,sparkles=false}={}){
 const node=scene.add.container(0,0).setVisible(false),pole=scene.add.graphics(),shine=scene.add.graphics();
 const prop=createPixelProp(scene,kind,{size}),grip=scene.add.graphics().setVisible(false);
 node.add([pole,prop,shine]);
 return {
  update(player,elapsed=0,reduced=false,visible=false){
   const avatar=scene.avatar??player;
   const shown=Boolean(visible&&player&&player.visible!==false&&avatar?.visible!==false);node.setVisible(shown);grip.setVisible(shown);
   if(!shown)return;
   const anchors=player===scene.dancer?playerAvatarAnchors(scene):getAvatarAnchors(player);
   const side=anchors.headwear?.side,facing=side?(avatar.pixelPose?.facingFlipX?'left':'right'):anchors.back?'up':'down';
   const layout=staffLayout({hand:anchors.hand,facing,back:anchors.back});
   const depth=Number.isFinite(player.depth)?player.depth:20;
   node.setPosition(player.x,player.y).setDepth(depth+(anchors.back?-1:.1));grip.setPosition(player.x,player.y).setDepth(depth+.2);
   const sx=Number.isFinite(player.scaleX)?player.scaleX:1,sy=Number.isFinite(player.scaleY)?player.scaleY:1;
   const alpha=(Number.isFinite(player.alpha)?player.alpha:1)*(avatar!==player&&Number.isFinite(avatar.alpha)?avatar.alpha:1);
   node.setScale(sx,sy).setAlpha(alpha);grip.setScale(sx,sy).setAlpha(alpha);
   pole.clear();drawTotemPole(pole,layout,{colour});
   prop.setPosition(layout.grip.x,layout.grip.y-33);
   drawTotemGrip(grip,layout,{skin:SKIN_PALETTES[avatar.skinTone]});
   shine.clear();
   if(sparkles)for(const [i,[dx,dy]] of [[-12,-37],[12,-29],[-8,-18]].entries()){
    const alpha=reduced?.65:.4+.25*(1+Math.sin(elapsed*.0017+i*2))/2;
    shine.fillStyle(0xffe8a0,alpha).fillRect(layout.grip.x+dx,layout.grip.y+dy,2,2);
   }
  },
  destroy(){node.destroy();grip.destroy();},
 };
}
