import {normalizeOutfit} from './wardrobe.js';
import {createActorMotion,resetActorMotion,advanceActorMotion,actorPose} from './pixel-art/actor-motion.js';
import {actorTexture} from './pixel-art/actor-textures.js';
import {actorAnchors,drawFlair,OUTFIT_PALETTES,SKIN_PALETTES,FRAME_HEIGHT,FOOT_Y} from './pixel-art/actor-wardrobe.js';
import {drawHat} from './pixel-art/actor-hats.js';
import {drawTotem,drawTotemGrip} from './pixel-art/actor-totems.js';
import {characterHeadTextures,drawFallbackCharacterHead,HEAD_ORIGIN,HEAD_SIZE} from './pixel-art/actor-heads.js';

export function createAvatar(scene,outfit,options={}){
 const node=scene.add.container(0,0);
 node.pixelActor=true;node.pixelScene=scene;node.pixelMotion=createActorMotion();node.pixelPhase=options.phase??0;node.pixelDance=Boolean(options.dancing);node.pixelSkinOverride=options.skinTone??null;node.skinTone=options.skinTone??'light';
 node.flourish=scene.add.graphics();node.costumeBack=scene.add.graphics();node.art=scene.add.graphics();node.magic=scene.add.graphics();
 node.sprite=scene.add.image(0,16,'__WHITE').setOrigin(.5,FOOT_Y/FRAME_HEIGHT).setVisible(false);
 node.headParts=Object.fromEntries(['hairRear','face','hairFront'].map(part=>[part,scene.add.image(0,0,'__WHITE').setOrigin(HEAD_ORIGIN.x/HEAD_SIZE,HEAD_ORIGIN.y/HEAD_SIZE).setVisible(false)]));
 node.temporaryHead=scene.add.graphics();
 node.hat=scene.add.graphics();node.totem=scene.add.graphics();node.grip=scene.add.graphics();
 node.add([node.flourish,node.costumeBack,node.headParts.hairRear,node.art,node.sprite,node.temporaryHead,node.headParts.face,node.headParts.hairFront,node.magic,node.hat,node.totem,node.grip]);
 node.pixelRevision=0;node.pixelElapsed=0;node.pixelDisposed=false;
 node.once?.('destroy',()=>{node.pixelDisposed=true;node.pixelRevision++;});
 setOutfit(node,outfit,options);return node;
}
export function setOutfit(node,value,options={}){
 if(!node)return;node.outfit=normalizeOutfit(value);
 if(!node.pixelActor)return;
 if(options.skinTone)node.pixelSkinOverride=options.skinTone;
 node.skinTone=node.pixelSkinOverride??node.outfit.appearance.skinTone;
 if(options.dancing!==undefined)node.pixelDance=Boolean(options.dancing);
 node.pixelCarrying=Boolean(node.pixelExternalCarry||node.outfit.totem!=='none');
 const appearance={...node.outfit.appearance,skinTone:node.skinTone},headKey=Object.values(appearance).join(':');
 if(node.pixelHeadKey!==headKey||!node.pixelHeadReady){
  node.pixelHeadKey=headKey;node.pixelHeadReady=false;const headRevision=node.pixelHeadRevision=(node.pixelHeadRevision??0)+1;
  for(const part of Object.values(node.headParts))part.setVisible(false);
  characterHeadTextures(node.pixelScene,appearance).then(keys=>{if(!keys||node.pixelDisposed||headRevision!==node.pixelHeadRevision)return;for(const [part,key]of Object.entries(keys))node.headParts[part].setTexture(key,'0').setVisible(true);node.pixelHeadReady=true;animateAvatar(node,node.pixelElapsed,false,false);}).catch(error=>{if(!node.pixelDisposed)console.warn('Character head artwork did not load',error);});
 }
 const bodyKey=[node.outfit.onesie,node.skinTone,node.pixelCarrying].join(':');
 if(node.pixelBodyKey===bodyKey&&node.pixelTextureReady){animateAvatar(node,node.pixelElapsed,false,false);return;}
 node.pixelBodyKey=bodyKey;
 const revision=++node.pixelRevision,palette=OUTFIT_PALETTES[node.outfit.onesie];
 // Tiny native pixel silhouette while the source decodes, never a missing-image square.
 node.art.clear();node.art.fillStyle(palette[2]).fillRect(-8,-10,16,20);
 node.art.fillStyle(0x6b597b).fillRect(-8,10,7,6).fillRect(2,10,7,6);
 node.pixelTextureReady=false;node.sprite.setVisible(false);
 actorTexture(node.pixelScene,node.outfit.onesie,node.skinTone,node.pixelCarrying).then(key=>{
  if(!key||node.pixelDisposed||revision!==node.pixelRevision)return;
  node.sprite.setTexture(key,'0').setVisible(true);node.pixelTextureReady=true;node.art.clear();animateAvatar(node,node.pixelElapsed,false,false);
 }).catch(error=>{if(!node.pixelDisposed)console.warn('Pixel wardrobe source did not load',error);});
 animateAvatar(node,node.pixelElapsed,true,false);
}
export function setAvatarMotion(node,value){if(node?.pixelMotion)advanceActorMotion(node.pixelMotion,value);}
export function resetAvatarMotion(node,value={}){if(!node?.pixelMotion)return;resetActorMotion(node.pixelMotion,value);animateAvatar(node,value.elapsed??0,true,false);}
// An earned staff temporarily occupies the same hand. The saved wardrobe
// selection stays intact and returns as soon as that souvenir is unequipped.
export function setAvatarCarry(node,externalCarry=false){
 if(!node?.pixelActor||Boolean(node.pixelExternalCarry)===Boolean(externalCarry))return;
 node.pixelExternalCarry=Boolean(externalCarry);setOutfit(node,node.outfit);
}
export function getAvatarAnchors(node){return actorAnchors(node?.pixelPose);}
function costumeExtras(node,pose){
 const g=node.costumeBack,id=node.outfit.onesie;g.clear();
 if(id==='moth')for(const side of [-1,1]){g.fillStyle(0x58436f).fillRect(side<0?-19:7,-18,12,23);g.fillStyle(0x9274b2).fillRect(side<0?-17:9,-16,8,18);g.fillStyle(0xe8bd87).fillRect(side<0?-14:11,-10,4,4);}
 if(id==='bee')for(const x of [-16,9]){g.fillStyle(0xe8eacc,.8).fillRect(x,-18,7,15);g.fillStyle(0xffffff,.55).fillRect(x+2,-16,2,10);}
 if(id==='tiger'){const x=pose.facingFlipX?-17:14;g.fillStyle(0xd69048).fillRect(x,4,3,13);g.fillStyle(0x554052).fillRect(x,8,3,3);}
 if(id==='frog'&&node.outfit.hat==='none'){
  const a=actorAnchors(pose).headwear;
  for(const offset of a.side?[-5,3]:[-6,6]){
   const x=Math.round(a.x+(a.flipX?-offset:offset))-2,y=Math.round(a.y)-6;
   node.magic.fillStyle(0x8ed68c).fillRect(x,y,5,5);node.magic.fillStyle(0x263e3b).fillRect(x+2,y+1,2,2);
  }
 }
}
export function animateAvatar(node,time,reduced=false,drop=false){
 if(!node?.pixelActor)return;
 node.pixelElapsed=Number.isFinite(time)?time:0;
 const motion=node.pixelMotion;motion.dancing=node.pixelDance;
 const pose=actorPose(motion,node.pixelElapsed,{reduced,phase:node.pixelPhase});pose.carrying=node.pixelCarrying;node.pixelPose=pose;
 if(node.pixelTextureReady)node.sprite.setFrame(String(pose.frame));node.sprite.setFlipX(pose.flipX);
 const anchors=actorAnchors(pose);
 if(node.pixelHeadReady)node.temporaryHead?.clear();else if(node.temporaryHead)drawFallbackCharacterHead(node.temporaryHead,node.skinTone,anchors.headwear);
 if(node.pixelHeadReady){const direction=anchors.headwear.side?'1':anchors.back?'2':'0';for(const part of Object.values(node.headParts))part.setFrame(direction).setPosition(Math.round(anchors.headwear.x),Math.round(anchors.headwear.y)).setFlipX(anchors.headwear.side&&pose.facingFlipX);}
 node.magic.clear();costumeExtras(node,pose);
 drawFlair(node.flourish,node.outfit.flair,node.pixelElapsed,reduced,drop);
 drawHat(node.hat,node.outfit.hat,anchors.head,anchors.back,{headwear:anchors.headwear});
 const held=drawTotem(node.totem,node.pixelExternalCarry?'none':node.outfit.totem,{hand:anchors.hand,facing:anchors.headwear?.side?(pose.facingFlipX?'left':'right'):anchors.back?'up':'down',back:anchors.back,time:node.pixelElapsed,reduced});
 drawTotemGrip(node.grip,held,{skin:SKIN_PALETTES[node.skinTone]});
 // Back-facing held objects tuck behind the body, not over the raver's face.
 if(anchors.back)node.sendToBack?.(node.totem);else node.bringToTop?.(node.totem);
 node.bringToTop?.(node.grip);
}
