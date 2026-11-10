import {createPuttingReward} from '../bonus-practice/putting-reward.js';

// An edition-owned accessory layer; generic wardrobe IDs remain unchanged.
export function createSouvenirView(scene){
 const g=scene.add.graphics().setDepth(23),chicken=createPuttingReward(scene);
 return {
  update(id,elapsed=0,reduced=false){
   g.clear();const {x,y,visible}=scene.dancer;
   chicken.update(scene.dancer,elapsed,reduced,id==='golden-chicken'&&visible);
   if(!visible)return;
   if(id==='rabbit-ears'){
    g.fillStyle(0xfff0d7).fillEllipse(x-7,y-38,10,30).fillEllipse(x+7,y-38,10,30);
    g.fillStyle(0xe49fba).fillEllipse(x-7,y-38,4,21).fillEllipse(x+7,y-38,4,21);
   }else if(id==='glow-blossom'){
    for(let i=0;i<6;i++){const a=i*Math.PI/3+(reduced?0:elapsed*.0005);g.fillStyle(i%2?0xffbbce:0xf6e597).fillCircle(x+Math.cos(a)*10,y-30+Math.sin(a)*10,6);}
    g.fillStyle(0xecffd1).fillCircle(x,y-30,6);
   }else if(id==='lantern-totem'){
    g.lineStyle(3,0xa7c5b3).lineBetween(x+20,y+7,x+20,y-49);
    g.fillStyle(0xffcf86,.12).fillCircle(x+20,y-54,25);g.fillStyle(0xffda96).fillRoundedRect(x+11,y-64,18,22,5);
    g.lineStyle(1,0x986a4f).strokeRoundedRect(x+11,y-64,18,22,5).lineBetween(x+20,y-64,x+20,y-42);
   }else if(id==='cheese-totem'){
    g.lineStyle(3,0xb59365).lineBetween(x+23,y+8,x+23,y-53);
    g.fillStyle(0xffcc40).fillRoundedRect(x+9,y-62,30,20,3);
    g.fillStyle(0xffeda1).fillTriangle(x+9,y-62,x+27,y-74,x+39,y-62);
    g.fillStyle(0xbe7c2a).fillCircle(x+17,y-54,3).fillCircle(x+31,y-50,4).fillCircle(x+27,y-59,2);
   }
  },destroy(){g.destroy();chicken.destroy();},
 };
}
