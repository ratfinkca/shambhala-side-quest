// A scene-local souvenir, deliberately separate from the saved wardrobe.
// Fixed graphics only: no spawned particles, gameplay effects or profile writes.
export function createPuttingReward(scene){
 const node=scene.add.container(0,0).setDepth(22).setVisible(false);
 const glow=scene.add.graphics(),art=scene.add.graphics(),sparkles=scene.add.graphics();
 node.add([glow,art,sparkles]);

 glow.fillStyle(0xffd771,.055).fillCircle(26,-55,29);
 glow.fillStyle(0xffecaa,.06).fillCircle(26,-55,21);

 // The warm wood-and-gold staff sits beside, rather than through, the dancer.
 art.lineStyle(5,0x49312d).lineBetween(18,7,24,-47);
 art.lineStyle(2.5,0xffd882).lineBetween(18,7,24,-47);
 art.fillStyle(0xb9772d).fillRoundedRect(16,-41,16,5,2);
 art.fillStyle(0xffedac).fillRoundedRect(17,-43,14,3,1);

 // A broad hen silhouette, with a high-contrast comb and tail, reads at phone size.
 art.fillStyle(0x513426).fillTriangle(12,-52,1,-68,3,-48);
 art.fillStyle(0xe6a73f).fillTriangle(13,-53,4,-65,5,-49);
 art.fillStyle(0x513426).fillEllipse(24,-53,35,26).fillCircle(38,-65,11);
 art.fillStyle(0xffd66d).fillEllipse(24,-54,31,22).fillCircle(38,-65,8.5);
 art.fillStyle(0xe8a941).fillEllipse(23,-51,20,13);
 art.lineStyle(1.5,0xffecaa,.9).strokeEllipse(23,-54,18,12);
 art.fillStyle(0xfff0ac).fillEllipse(20,-59,12,5);

 art.fillStyle(0xa8443c).fillCircle(34,-74,4).fillCircle(39,-77,4).fillCircle(44,-74,3.5);
 art.fillStyle(0xf47c57).fillCircle(39,-77,2.2);
 art.fillStyle(0xe9823e).fillTriangle(45,-66,54,-62,45,-59);
 art.fillStyle(0xb64b3b).fillEllipse(43,-55,5,9);
 art.fillStyle(0x302727).fillCircle(40,-66,2.3);
 art.fillStyle(0xfff7db).fillCircle(40.7,-66.8,.8);

 return {
  update(player,elapsedMs=0,reducedMotion=false,visible=false){
   node.setVisible(Boolean(visible&&player));
   if(!visible||!player)return;
   node.setPosition(player.x,player.y);
   const time=reducedMotion?0:elapsedMs/1000;
   sparkles.clear();
   for(const [i,[x,y,size]] of [[1,-79,3],[54,-45,2.5],[4,-35,2]].entries()){
    const alpha=reducedMotion?.65:.35+.4*(1+Math.sin(time*1.7+i*2))/2;
    sparkles.lineStyle(1.5,0xffe8a0,alpha)
     .lineBetween(x-size,y,x+size,y).lineBetween(x,y-size,x,y+size);
   }
  },
  destroy(){node.destroy();},
 };
}
