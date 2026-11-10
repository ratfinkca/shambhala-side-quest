// An original interpretation of the hidden Living Room party, not a venue survey.
// Loaded only by the disposable SMF bonus rehearsal.
const ART_KEY='bonus-rabbit-hole-art-v1';
const LAMPS=[
 {x:126,y:72,color:0xffd37d}, {x:178,y:110,color:0xffa4bd},
 {x:218,y:88,color:0xffbf6b}, {x:762,y:72,color:0xffd37d},
 {x:797,y:110,color:0xffa4bd}, {x:850,y:78,color:0xffbf6b},
];

export function preload(scene){
 if(!scene.textures.exists(ART_KEY))scene.load.image(ART_KEY,new URL('../assets/rabbit-hole-v1.jpg',import.meta.url).href);
}

export function createView(scene,stage){
 if(stage.id!=='smf-rabbit-hole')return null;
 const base=scene.add.graphics().setDepth(-5);
 base.fillStyle(0x142a35).fillRect(0,0,960,640);
 if(scene.textures.exists(ART_KEY)){
  // The scenery lip sits above y=215; the dancefloor begins below it.
  // A small upward framing crop keeps the play area clear of the booth.
  scene.add.image(0,-30,ART_KEY).setOrigin(0).setDisplaySize(960,640).setDepth(-4);
  const lower=scene.add.graphics().setDepth(-3);
  for(let y=560;y<610;y+=2)lower.fillStyle(0x142a35,(y-560)/50).fillRect(0,y,960,2);
  lower.fillStyle(0x142a35).fillRect(0,610,960,30);
 }else{
  // An image failure still leaves a legible, playable hidden-room setting.
  base.fillStyle(0x392039).fillRoundedRect(235,0,490,210,70);
  base.lineStyle(7,0x925c39).strokeRoundedRect(235,0,490,210,70);
  base.fillStyle(0x1c1228).fillEllipse(480,105,350,230);
  base.fillStyle(0x633048).fillTriangle(280,12,395,12,310,205).fillTriangle(680,12,565,12,650,205);
  base.fillStyle(0x6f432f).fillRoundedRect(371,160,218,49,8);
  base.lineStyle(2,0xe6a866,.55).strokeRoundedRect(371,160,218,49,8);
 }
 const pools=scene.add.graphics().setDepth(-2);
 const decor=scene.add.graphics().setDepth(-1);
 const bulbs=scene.add.graphics().setDepth(0);
 let progress=0;

 function setProgress(state){progress=Math.max(0,Math.min(6,Number(state?.progress)||0));}

 function update(elapsed=0,phase='normal',reducedMotion=false,timing){
  const t=reducedMotion?0:elapsed/1000;
  const beat=reducedMotion?0:(elapsed/(60000/(timing?.bpm??120)))%1;
  const energy=phase==='drop'?1:phase==='build'?.78:.55;
  pools.clear();decor.clear();bulbs.clear();

  // Broad soft pools are kept well below the contrast of activity targets.
  for(const [i,x] of [182,778].entries()){
   const drift=reducedMotion?0:Math.sin(t*.29+i*Math.PI)*25;
   for(let r=5;r>0;r--)pools.fillStyle(i?0xbb7edb:0xffbb73,.006+progress*.0005)
    .fillEllipse(x+drift,335,r*47,r*26);
  }

  // Each recovered trinket switches on another actual hanging lamp.
  // Two passes prevent each glow from obscuring its painted shade.
  LAMPS.forEach((lamp,i)=>{
   const lit=i<progress;
   const breathing=reducedMotion?1:.93+.07*Math.sin(t*1.2+i*.7);
   for(let r=4;r>0;r--)bulbs.fillStyle(lamp.color,(lit?.028:.009)*breathing)
    .fillCircle(lamp.x,lamp.y,r*(lit?13:8));
   bulbs.fillStyle(lamp.color,lit?.7:.22).fillEllipse(lamp.x,lamp.y+9,lit?9:5,3);
  });

  // Slow ribbon projections stay on the small wooden booth front.
  for(let j=0;j<4;j++){
   const points=Array.from({length:34},(_,i)=>{
    const x=381+i*6;
    return {x,y:185+Math.sin(i*.28+t*.6+j*.85)*(7+j*.9)};
   });
   decor.lineStyle(1.2,j%2?0xff9fc3:0xffd28d,.15+energy*.09+progress*.012).strokePoints(points,false);
  }

  // Tiny warm chasers travel around the doorway, never across the dancefloor.
  for(let i=0;i<32;i++){
   const a=Math.PI+i/31*Math.PI;
   const x=480+221*Math.cos(a),y=209+206*Math.sin(a);
   const chase=reducedMotion?.35:.22+.45*Math.pow(Math.max(0,Math.cos(i*.38-t*.75)),5);
   decor.fillStyle(i%3?0xffbf76:0xf59fce,chase).fillCircle(x,y,1.5);
  }
  // The venue heartbeat is a gentle glow rather than a flash.
  const pulse=reducedMotion?.2:.14+(1-beat)*.08*energy;
  decor.lineStyle(1.3,0xffc482,pulse).lineBetween(371,208,589,208);
 }

 update(0,'normal',true);
 return {ownsLighting:true,update,setProgress};
}
