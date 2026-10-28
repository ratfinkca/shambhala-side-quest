import { normalizeOutfit } from './wardrobe.js';
export function createAvatar(scene,outfit) {
  const node=scene.add.container(0,0);node.flourish=scene.add.graphics();node.art=scene.add.graphics();node.add([node.flourish,node.art]);setOutfit(node,outfit);return node;
}
export function setOutfit(node,value) {
  const outfit=normalizeOutfit(value),g=node.art;node.outfit=outfit;g.clear();animateAvatar(node,0,true);
  const color=({lime:0xc8f68c,moth:0xb39ae7,rainbow:0xffb59b,tiger:0xffaa65,frog:0x69d69c,cosmic:0x6256a6,bee:0xffdc65,skeleton:0x283d50,patchwork:0xef83bd})[outfit.onesie];
  g.lineStyle(4,0xf4efc5).lineBetween(-4,8,-7,16).lineBetween(4,8,7,16);
  if(outfit.onesie==='moth'){g.fillStyle(0x9e77c7,.8).fillTriangle(-4,-6,-22,3,-8,12).fillTriangle(4,-6,22,3,8,12);g.fillStyle(0xf1c68d).fillCircle(-14,3,3).fillCircle(14,3,3);}
  g.fillStyle(color).fillRoundedRect(-8,-5,16,18,5);
  if(outfit.onesie==='rainbow')for(const [i,c]of [0xf48dac,0xe9d878,0x80d6b2,0x91bde6].entries())g.fillStyle(c).fillRect(-7,-3+i*3,14,3);
  if(outfit.onesie==='tiger'){
    g.fillStyle(0x533449).fillTriangle(-8,-3,-1,0,-8,3).fillTriangle(8,2,1,5,8,8).fillTriangle(-8,7,-1,10,-8,12);
    g.lineStyle(3,color).lineBetween(7,9,16,12).lineBetween(16,12,20,7);
  }
  if(outfit.onesie==='frog'){
    g.fillStyle(0xc7f398).fillEllipse(0,4,10,14);
    g.fillStyle(color).fillCircle(-6,-18,4).fillCircle(6,-18,4);
    g.fillStyle(0x233e40).fillCircle(-6,-19,1.5).fillCircle(6,-19,1.5);
  }
  if(outfit.onesie==='cosmic'){
    g.fillStyle(0xffe9a1).fillCircle(-4,-1,1.5).fillCircle(5,8,1.5);
    g.lineStyle(1.5,0xa7f6ee).lineBetween(2,0,2,6).lineBetween(-1,3,5,3);
  }
  if(outfit.onesie==='bee'){
    g.fillStyle(0xf5f5e0,.7).fillEllipse(-10,-3,9,15).fillEllipse(10,-3,9,15);
    g.fillStyle(0x493950).fillRect(-7,0,14,3).fillRect(-7,7,14,3);
  }
  if(outfit.onesie==='skeleton'){
    g.lineStyle(1.5,0xc5ffe3).lineBetween(0,-2,0,10);
    for(const y of [0,4,8])g.lineBetween(-5,y,5,y);
  }
  if(outfit.onesie==='patchwork'){
    g.fillStyle(0x85e5d1).fillRect(-7,-3,7,8);
    g.fillStyle(0xffdc78).fillRect(0,5,7,7);
    g.lineStyle(1,0x634075).lineBetween(-6,5,6,5).lineBetween(0,-3,0,12);
  }
  g.fillStyle(0xffdab7).fillCircle(0,-11,7);
  g.lineStyle(3,color).lineBetween(-7,0,-14,-4).lineBetween(7,0,14,-4);
  if(outfit.hat==='bucket')g.fillStyle(0xb997d7).fillEllipse(0,-16,23,7).fillRoundedRect(-7,-23,14,8,3);
  if(outfit.hat==='wizard'){g.fillStyle(0x788ae0).fillTriangle(-9,-16,0,-39,9,-16).fillEllipse(0,-16,26,6);g.fillStyle(0xffed9f).fillCircle(0,-25,2);}
  if(outfit.hat==='none')g.fillStyle(0x684854).fillEllipse(0,-17,13,6);
  if(outfit.hat==='mushroom'){
    g.fillStyle(0xf789a7).fillEllipse(0,-20,29,15);
    g.fillStyle(0xffefb8).fillCircle(-7,-22,3).fillCircle(5,-24,2.5).fillCircle(9,-18,2);
  }
  if(outfit.hat==='flower'){
    g.lineStyle(3,0x70bc84).lineBetween(-8,-18,8,-18);
    for(const [x,y,c] of [[-8,-19,0xff93bb],[0,-22,0xffdf81],[8,-19,0xbc9cff]]){
      g.fillStyle(c).fillCircle(x-2,y,3).fillCircle(x+2,y,3).fillCircle(x,y-3,3);
      g.fillStyle(0xfff8d2).fillCircle(x,y,1.5);
    }
  }
  if(outfit.hat==='cat'){
    g.fillStyle(0x694c80).fillTriangle(-10,-16,-9,-30,-1,-19).fillTriangle(1,-19,9,-30,10,-16);
    g.fillStyle(0xffa7ce).fillTriangle(-8,-19,-8,-26,-4,-20).fillTriangle(4,-20,8,-26,8,-19);
  }
  if(outfit.hat==='antenna'){
    g.lineStyle(2,0x89e6b2).lineBetween(-4,-17,-8,-30).lineBetween(4,-17,8,-30);
    g.fillStyle(0xcaff82).fillCircle(-8,-31,4).fillCircle(8,-31,4);
  }
  if(outfit.hat==='crown'){
    g.fillStyle(0xffd97b).fillRect(-9,-21,18,6).fillTriangle(-9,-21,-10,-29,-3,-21).fillTriangle(-4,-21,0,-31,4,-21).fillTriangle(3,-21,10,-29,9,-21);
    g.fillStyle(0xdf82b2).fillCircle(0,-19,2);
  }
  if(outfit.hat==='headphones'){
    g.lineStyle(3,0x92e5ed).strokeCircle(0,-13,9);
    g.fillStyle(0x7751aa).fillRoundedRect(-12,-16,6,11,2).fillRoundedRect(6,-16,6,11,2);
  }
  if(outfit.totem!=='none'){
    g.lineStyle(2,0xe1c9a4).lineBetween(14,3,18,-45);
    if(outfit.totem==='star'){g.fillStyle(0xffe49b).fillTriangle(18,-58,9,-42,27,-42).fillTriangle(18,-36,9,-52,27,-52);}
    if(outfit.totem==='mushroom'){g.fillStyle(0xffddb4).fillRect(16,-49,4,10);g.fillStyle(0xf199c7).fillEllipse(18,-51,21,12);g.fillStyle(0xffedcb).fillCircle(14,-52,2).fillCircle(23,-51,2);}
    if(outfit.totem==='moon'){
      g.fillStyle(0xffe8a5).fillPoints([[23,-57],[17,-58],[11,-55],[8,-49],[10,-42],[16,-38],[23,-39],[18,-41],[15,-45],[15,-50],[18,-54]].map(([x,y])=>({x,y})),true);
      g.fillStyle(0xfff2c9).fillCircle(25,-52,2);
    }
    if(outfit.totem==='eye'){
      g.fillStyle(0xefc4ff).fillEllipse(18,-48,25,14);
      g.fillStyle(0x59d9c4).fillCircle(18,-48,6);g.fillStyle(0x303554).fillCircle(18,-48,3);
      g.fillStyle(0xffffff).fillCircle(20,-50,1.5);
    }
    if(outfit.totem==='heart'){
      g.fillStyle(0xff84b6).fillCircle(13,-51,6).fillCircle(23,-51,6).fillTriangle(7,-49,29,-49,18,-36);
    }
    if(outfit.totem==='peace'){
      g.lineStyle(2.5,0xffe39c).strokeCircle(18,-48,10).lineBetween(18,-58,18,-38).lineBetween(18,-48,11,-41).lineBetween(18,-48,25,-41);
    }
    if(outfit.totem==='jellyfish'){
      g.lineStyle(2,0x94f3ed).lineBetween(11,-46,9,-35).lineBetween(18,-46,20,-33).lineBetween(25,-46,24,-36);
      g.fillStyle(0xcba5ff).fillEllipse(18,-50,25,15);g.fillStyle(0xffd4f1).fillCircle(15,-52,2);
    }
    if(outfit.totem==='ufo'){
      g.fillStyle(0x95eed4).fillEllipse(18,-53,13,12);
      g.fillStyle(0xb9a0f1).fillEllipse(18,-48,29,9);
      g.fillStyle(0xffee99).fillCircle(9,-48,2).fillCircle(18,-47,2).fillCircle(27,-48,2);
    }
  }
}

// A fixed number of decorative marks: no spawned particles, hitboxes or scoring effects.
export function animateAvatar(node,time,reduced=false){
 const g=node.flourish;if(!g)return;g.clear();
 const flair=node.outfit?.flair;if(!flair||flair==='none')return;
 const t=reduced?0:time/1000;
 if(flair==='prism'){
   const colours=[0xf4a3d8,0xa9a1ff,0x8bf0df,0xf5de8d];
   for(let i=0;i<4;i++){
     const phase=(t/4+i)%4,a=colours[Math.floor(phase)],b=colours[(Math.floor(phase)+1)%4],mix=phase%1;
     const colour=[16,8,0].reduce((rgb,shift)=>rgb|(Math.round(((a>>shift)&255)*(1-mix)+((b>>shift)&255)*mix)<<shift),0);
     g.lineStyle(1.5,colour,.55).strokeEllipse(0,0,26+i*5,32+i*5);
   }
   return;
 }
 const colours=flair==='fireflies'?[0xcaff95,0xffe69c]:[0xfbe4ae,0xc8bcff];
 for(let i=0;i<8;i++){
   const angle=i*Math.PI/4+t*(flair==='stardust'?.5:.2);
   const radius=22+Math.sin(t+i)*4,x=Math.cos(angle)*radius,y=Math.sin(angle)*radius*.7;
   g.fillStyle(colours[i%2],reduced?.6:.45+.35*(1+Math.sin(t*1.5+i))/2).fillCircle(x,y,i%3===0?1.8:1);
   if(flair==='stardust'&&i%2===0)g.lineStyle(1,colours[i%2],.55).lineBetween(x-3,y,x+3,y).lineBetween(x,y-3,x,y+3);
 }
}
