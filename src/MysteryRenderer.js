const COLOURS=[0xf49ec7,0x85dcca,0xd3b0ff,0xffcc83];

export class MysteryRenderer {
 constructor(scene){
  this.pickup=scene.add.container(0,0).setDepth(15).setVisible(false);
  this.art=scene.add.graphics();this.pickup.add(this.art);
  // Behind hazards, pickups and characters; never distort the HUD or hitboxes.
  this.waves=scene.add.graphics().setDepth(.3).setVisible(false);
  this.placed=false;
 }
 reset(wrapper){
  this.placed=false;this.pickup.setVisible(false).setScale(1);this.waves.clear().setVisible(false);
  const g=this.art;g.clear().setPosition(0,0);const colour=COLOURS[wrapper.colour];
  g.fillStyle(colour,.1).fillCircle(0,0,25);
  g.fillStyle(colour).fillTriangle(-10,0,-23,-9,-23,9).fillTriangle(10,0,23,-9,23,9);
  g.lineStyle(1,0xfff5de,.7).lineBetween(-21,-5,-12,0).lineBetween(-21,5,-12,0).lineBetween(21,-5,12,0).lineBetween(21,5,12,0);
  g.fillStyle(colour).fillRoundedRect(-12,-9,24,18,5);
  g.lineStyle(1,0xfff5de,.85).strokeRoundedRect(-12,-9,24,18,5);
  if(wrapper.pattern===0){
   g.lineStyle(3,0xfff5de,.8);for(const x of [-6,0,6])g.lineBetween(x-2,-7,x+2,7);
  }else if(wrapper.pattern===1){
   g.fillStyle(0xfff5de,.85);for(const x of [-7,0,7])for(const y of [-4,4])g.fillCircle(x,y,1.8);
  }else{
   g.lineStyle(2,0xfff5de,.85);for(const y of [-4,4])g.strokePoints([{x:-9,y},{x:-4,y:y-3},{x:1,y},{x:6,y:y-3},{x:9,y}]);
  }
  this.pickup.setRotation(-.15);
 }
 update(m,reduced){
  this.pickup.setVisible(m.phase==='available'&&this.placed);
  this.pickup.setScale(reduced?1:1+Math.sin(m.elapsedMs*.003)*.045);
  this.waves.clear().setVisible(m.effect==='waves'&&m.effectMs>0);
  if(m.effect!=='waves'||m.effectMs<=0)return;
  if(reduced){this.waves.fillStyle(0xbda0ec,.1).fillRect(0,0,960,640);return;}
  const t=m.elapsedMs*.00065;
  for(let band=0;band<5;band++){
   const points=Array.from({length:33},(_,i)=>({x:i*30,y:100+band*115+Math.sin(i*.22+t+band)*28}));
   const colour=COLOURS[band%COLOURS.length];
   this.waves.lineStyle(38,colour,.045).strokePoints(points);
   this.waves.lineStyle(2,colour,.13).strokePoints(points);
  }
 }
}
