import { normalizeOutfit } from './wardrobe.js';
export function createAvatar(scene,outfit) {
  const node=scene.add.container(0,0);node.art=scene.add.graphics();node.add(node.art);setOutfit(node,outfit);return node;
}
export function setOutfit(node,value) {
  const outfit=normalizeOutfit(value),g=node.art;g.clear();
  const color=outfit.onesie==='moth'?0xb39ae7:outfit.onesie==='rainbow'?0xffb59b:0xc8f68c;
  g.lineStyle(4,0xf4efc5).lineBetween(-4,8,-7,16).lineBetween(4,8,7,16);
  if(outfit.onesie==='moth'){g.fillStyle(0x9e77c7,.8).fillTriangle(-4,-6,-22,3,-8,12).fillTriangle(4,-6,22,3,8,12);g.fillStyle(0xf1c68d).fillCircle(-14,3,3).fillCircle(14,3,3);}
  g.fillStyle(color).fillRoundedRect(-8,-5,16,18,5);
  if(outfit.onesie==='rainbow')for(const [i,c]of [0xf48dac,0xe9d878,0x80d6b2,0x91bde6].entries())g.fillStyle(c).fillRect(-7,-3+i*3,14,3);
  g.fillStyle(0xffdab7).fillCircle(0,-11,7);
  g.lineStyle(3,color).lineBetween(-7,0,-14,-4).lineBetween(7,0,14,-4);
  if(outfit.hat==='bucket')g.fillStyle(0xb997d7).fillEllipse(0,-16,23,7).fillRoundedRect(-7,-23,14,8,3);
  if(outfit.hat==='wizard'){g.fillStyle(0x788ae0).fillTriangle(-9,-16,0,-39,9,-16).fillEllipse(0,-16,26,6);g.fillStyle(0xffed9f).fillCircle(0,-25,2);}
  if(outfit.hat==='none')g.fillStyle(0x684854).fillEllipse(0,-17,13,6);
  if(outfit.totem!=='none'){
    g.lineStyle(2,0xe1c9a4).lineBetween(14,3,18,-45);
    if(outfit.totem==='star'){g.fillStyle(0xffe49b).fillTriangle(18,-58,9,-42,27,-42).fillTriangle(18,-36,9,-52,27,-52);}
    else{g.fillStyle(0xffddb4).fillRect(16,-49,4,10);g.fillStyle(0xf199c7).fillEllipse(18,-51,21,12);g.fillStyle(0xffedcb).fillCircle(14,-52,2).fillCircle(23,-51,2);}
  }
}
