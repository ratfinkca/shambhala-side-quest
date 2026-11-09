import {LIVING_ROOM_ART_KEY,FRACTAL_ART_KEY,GROVE_ART_KEY,AMP_ART_KEY,PAGODA_ART_KEY,VILLAGE_ART_KEY} from './smf-venue-assets.js';
// Scenery is decorative; stage data owns collision. Illustrated venues retain
// their original canvas sketches as asset-load fallbacks.
const W=960,H=640;
function cedar(g,x,lean){
 g.fillStyle(0x122d2c).fillPoints([{x:x-22,y:164},{x:x+9,y:164},{x:x+lean+12,y:42},{x:x+lean-6,y:15}],true);
 g.lineStyle(3,0x705b40,.7).lineBetween(x-5,165,x+lean,38);
 for(let i=0;i<7;i++){const y=22+i*20,span=95-i*7;g.fillStyle(i%2?0x163b33:0x20463b,.95).fillTriangle(x+lean,y-25,x-span,y+25,x+span,y+25);}
}
function grain(g,colours){for(let i=0;i<150;i++){const x=155+(i*137%660),y=195+(i*83%410);g.fillStyle(colours[i%colours.length],.06).fillEllipse(x,y,2+i%3,1);}}
function livingRoomSketch(scene){
 const g=scene.add.graphics();g.fillStyle(0x324c45).fillRect(0,0,W,H);g.fillStyle(0x3a5c58).fillRect(0,0,W,175);
 g.fillStyle(0xf4c47d,.22).fillCircle(775,74,54);g.fillStyle(0xffdea1,.22).fillCircle(775,74,31);
 for(let i=0;i<6;i++)g.fillStyle(0x244c44,.4).fillTriangle(i*190-100,160,i*190+40,15+(i%3)*18,i*190+170,160);
 // Salmo-inspired river stays at the perimeter, away from authored pickup space.
 const bank=[{x:0,y:150},{x:95,y:150},{x:130,y:250},{x:100,y:345},{x:132,y:450},{x:110,y:550},{x:138,y:640},{x:0,y:640}];
 g.fillStyle(0xc2b58a,.48).fillPoints(bank.map(p=>({x:p.x+14,y:p.y})),true);g.fillStyle(0x1c5c65).fillPoints(bank,true);
 for(let i=0;i<8;i++)g.fillStyle(0xc6b584,.018).fillEllipse(510,402,720-i*52,500-i*32);
 grain(g,[0xe6d0a1,0x91b9a7,0xa9c8b7]);cedar(g,125,-20);cedar(g,850,12);
 // Steep open A-frame, rather than a generic flat-roof cabin. The timber
 // triangles and deep stage opening remain readable at phone scale.
 g.fillStyle(0x182e29).fillTriangle(480,10,315,172,645,172);
 g.fillStyle(0x554a35).fillTriangle(480,10,315,172,345,166);
 g.fillStyle(0x766044).fillTriangle(480,10,645,172,615,166);
 g.fillStyle(0x273e32).fillTriangle(480,39,368,157,592,157);
 for(let y=56;y<155;y+=12){const half=(y-30)*.87;g.lineStyle(1,0xc0a274,.22).lineBetween(480-half,y,480+half,y);}
 g.fillStyle(0x0c2929).fillTriangle(480,59,395,153,565,153);
 g.lineStyle(7,0xd0ac71,.9).lineBetween(480,14,326,170).lineBetween(480,14,634,170);
 g.lineStyle(3,0xecd39b,.7).lineBetween(480,40,365,164).lineBetween(480,40,595,164);
 g.lineStyle(5,0x8d714d,1).lineBetween(353,145,607,145).lineBetween(480,42,480,103);
 for(const x of [370,580])g.fillStyle(0x91734d).fillRect(x,127,9,45);
 g.fillStyle(0x6a5135).fillRoundedRect(315,167,330,10,3);
 g.fillStyle(0x143430).fillRoundedRect(421,124,118,35,3);
 g.lineStyle(2,0xd8c08a,.8).strokeRoundedRect(421,124,118,35,3);
 for(let i=0;i<8;i++)g.fillStyle(i%2?0x8dc9b4:0xf1c88e,.4).fillRect(429+i*13,130,7,21);
 g.fillStyle(0x9b794d).fillRoundedRect(409,158,142,9,2);
 // Catenary lamp cord and actual lampshades, all above the active floor.
 const lampPositions=[];let previous={x:130,y:61};
 for(let i=1;i<=20;i++){const p={x:130+i*35,y:61+Math.sin(i/20*Math.PI)*43};g.lineStyle(1,0xd4c39a,.65).lineBetween(previous.x,previous.y,p.x,p.y);previous=p;}
 for(const [x,y]of [[247,91],[353,111],[480,120],[602,111],[710,91]]){
  g.lineStyle(1,0xbca780,.8).lineBetween(x,y-30,x,y);
  g.fillStyle(0xebcd91).fillPoints([{x:x-10,y},{x:x+10,y},{x:x+19,y:y+13},{x:x-19,y:y+13}],true);
  g.fillStyle(0xffe8af,.65).fillEllipse(x,y+14,27,5);lampPositions.push([x,y+16]);
 }
 for(const y of [315,435]){g.fillStyle(0x314a3c).fillRoundedRect(894,y,42,57,8);g.fillStyle(0xb28d64,.5).fillRoundedRect(900,y+5,30,42,6);}
 const water=scene.add.graphics().setDepth(.11),glow=scene.add.graphics().setDepth(.13);
 return {update(elapsed,phase,reduced){
  const t=reduced?0:elapsed/1000;water.clear();glow.clear();
  for(let i=0;i<23;i++){const y=180+i*19,x=27+Math.sin(i*1.7+t*.3)*15;water.lineStyle(1,i%3?0x8fcec4:0xf6cf8e,.22).lineBetween(x,y,x+30+(i%4)*8,y+2);}
  for(const [x,y]of lampPositions){const breathe=reduced?1:1+Math.sin(t*.6+x)*.08;for(let r=4;r>0;r--)glow.fillStyle(0xffd590,.008*breathe).fillEllipse(x,y+10,r*22,r*13);}
 }};
}
function livingRoom(scene){
 if(!scene.textures?.exists(LIVING_ROOM_ART_KEY))return livingRoomSketch(scene);
 scene.add.image(0,0,LIVING_ROOM_ART_KEY).setOrigin(0).setDisplaySize(W,H);
 const ambience=scene.add.graphics().setDepth(.12);
 // Screen and lamp positions measured on the 1536 x 1024 illustration.
 // Water movement stays inside the tiny left-edge inlet, off the dancefloor.
 const panels=[[716,172,117,72],[677,326,195,69],[440,333,72,68],[1028,333,99,68],[700,416,154,16]]
  .map(([x,y,w,h])=>({x:x*W/1536,y:y*H/1024,w:w*W/1536,h:h*H/1024}));
 const shades=[[111,160,53],[224,224,30],[1328,224,30],[1438,160,53]]
  .map(([x,y,r])=>({x:x*W/1536,y:y*H/1024,r:r*W/1536}));
 return {lampPositions:[600,660,715,770,825,880].map(x=>[x*W/1536,302*H/1024]),update(elapsed,phase,reduced,timing){
  ambience.clear();
  const turn=reduced?0:elapsed*timing.bpm/60000/16*Math.PI*2;
  const energy=!reduced&&phase==='drop'?1:.8;
  panels.forEach((p,i)=>{
   for(let band=0;band<3;band++){
    const points=[];
    for(let step=0;step<=16;step++){
     const u=step/16,v=.24+band*.23+Math.sin(u*Math.PI*2+turn+i*.7+band*.6)*.1;
     points.push({x:p.x+u*p.w,y:p.y+v*p.h});
    }
    ambience.lineStyle(.8,band%2?0xf0b590:0x9bd9c3,.22*energy).strokePoints(points,false);
   }
  });
  for(const [i,p]of shades.entries()){
   const breathe=1+Math.sin(turn*.5+i)*.08;
   for(let r=3;r>0;r--)ambience.fillStyle(0xffcf83,.012*breathe).fillEllipse(p.x,p.y,p.r*r,p.r*r*.55);
  }
  for(let i=0;i<6;i++){
   const x=(6+Math.sin(turn*.4+i)*3)*W/1536,y=(439+i*10)*H/1024;
   ambience.lineStyle(.8,0x92d8c7,.18).lineBetween(x,y,x+13*W/1536,y);
  }
 }};
}

// Filled rounded arch sampled as a polygon for both Canvas and WebGL.
function arch(g,x,y,width,height){
 const points=[{x:x-width/2,y:y+height},{x:x-width/2,y:y+width*.48}];
 for(let i=0;i<=12;i++){const angle=Math.PI+i/12*Math.PI;points.push({x:x+Math.cos(angle)*width/2,y:y+width*.48+Math.sin(angle)*width*.48});}
 points.push({x:x+width/2,y:y+height});
 g.fillStyle(0x152332).fillPoints(points,true);g.lineStyle(2,0xe1d8c7,.9).strokePoints(points,true);
}
function pagodaSketch(scene){
 const g=scene.add.graphics();g.fillStyle(0x172a35).fillRect(0,0,W,H);g.fillStyle(0x151c30).fillRect(0,0,W,175);
 for(const x of [70,125,835,895]){g.fillStyle(0x0f202b).fillRect(x,0,17,185);for(let i=0;i<5;i++)g.fillTriangle(x+8,12+i*25,x-48,63+i*25,x+68,63+i*25);}
 for(let i=0;i<7;i++)g.lineStyle(1,i%2?0xa59de1:0x67a2b8,.07).strokeEllipse(480,390,250+i*105,120+i*58);
 grain(g,[0xb9b2e1,0x8cb3c6]);g.fillStyle(0x101727).fillRoundedRect(236,165,488,12,3);
 // 2026 reference: a broad faceted white tower, one main peaked roof and
 // a wraparound lower porch. Storeys are wall/rail bands, not seven roofs.
 const faces=[
  [{x:360,y:50},{x:416,y:42},{x:416,y:139},{x:360,y:148}],
  [{x:416,y:42},{x:544,y:42},{x:544,y:139},{x:416,y:139}],
  [{x:544,y:42},{x:600,y:50},{x:600,y:148},{x:544,y:139}],
 ];
 // Low side wings sit behind the tower and extend its silhouette.
 for(const side of [-1,1]){
  const x=480+side*174;
  g.fillStyle(0x777f96).fillPoints([{x:x-59,y:109},{x,y:80},{x:x+59,y:109},{x:x+54,y:119},{x:x-54,y:119}],true);
  g.lineStyle(2,0xd4d0d1,.85).lineBetween(x-59,109,x,80).lineBetween(x,80,x+59,109);
 }
 faces.forEach((points,i)=>g.fillStyle([0xa8a9b6,0xd2ced1,0x969eaf][i]).fillPoints(points,true));
 const roof=[{x:480,y:5},{x:552,y:29},{x:618,y:49},{x:634,y:36},{x:622,y:59},{x:548,y:49},{x:480,y:39},{x:412,y:49},{x:338,y:59},{x:326,y:36},{x:342,y:49},{x:408,y:29}];
 g.fillStyle(0x6e7893).fillPoints(roof,true);g.lineStyle(2,0xe3dbd2,.95).strokePoints(roof,true);
 g.lineStyle(1,0xc7c7d4,.8).lineBetween(480,5,416,47).lineBetween(480,5,544,47);
 // Wide shallow porch roof and an open lower level, with a small central gable.
 g.fillStyle(0x172439).fillRect(259,134,442,34);
 g.fillStyle(0x9a9dac).fillPoints([{x:275,y:119},{x:360,y:111},{x:416,y:118},{x:544,y:118},{x:600,y:111},{x:685,y:119},{x:716,y:137},{x:244,y:137}],true);
 g.lineStyle(2,0xe0d8cb,.9).lineBetween(244,137,716,137);
 g.fillStyle(0xc9c6ce).fillTriangle(480,105,440,137,520,137);
 g.lineStyle(2,0xeee3cd,.95).strokeTriangle(480,105,440,137,520,137);
 const mapped=scene.add.graphics().setDepth(.12),details=scene.add.graphics().setDepth(.125),floor=scene.add.graphics().setDepth(.13);
 // Dark openings and pale rails stay above the projection layer.
 arch(details,480,53,40,38);arch(details,388,84,26,29);arch(details,572,84,26,29);
 for(const y of [95,110]){
  details.lineStyle(2,0xe0dcd3,.95).lineBetween(361,y+4,416,y).lineBetween(416,y,544,y).lineBetween(544,y,599,y+4);
 }
 for(let x=423;x<544;x+=12)details.lineStyle(1.5,0xe0dcd3,.85).lineBetween(x,96,x,109);
 for(const side of [-1,1])for(let i=0;i<4;i++){const x=480+side*(72+i*12);details.lineStyle(1.5,0xd4d4d1,.85).lineBetween(x,96+i, x,110+i);}
 for(const x of [261,299,343,391,569,617,661,699]){
  details.fillStyle(0xd3cec7).fillRect(x,138,5,28);details.fillStyle(0xeee0c1).fillRect(x-3,137,11,4);
 }
 details.fillStyle(0x131b2c).fillRoundedRect(435,144,90,22,2);
 details.lineStyle(1.5,0xe4c896,.9).strokeRoundedRect(435,144,90,22,2);
 details.fillStyle(0xd1b27d,.65).fillRect(436,144,88,3);
 return {update(elapsed,phase,reduced,timing){
  const t=reduced?0:elapsed/1000,phrase=reduced?0:Math.floor(elapsed*timing.bpm/240000/8),colour=[0xa7a0ed,0x82c9d4,0xd8b780,0xc2b0ef][phrase%4];mapped.clear();floor.clear();
  faces.forEach((points,i)=>{
   const breathe=reduced?.2:.18+.07*Math.sin(t*.7+i*.7);
   mapped.fillStyle(colour,breathe).fillPoints(points,true);
   const left=points[0].x+5,right=points[1].x-5,mid=(left+right)/2;
   for(const y of [65,94,120]){
    mapped.lineStyle(1.5,colour,.7).strokeTriangle(left,y,mid,y-15,right,y);
    mapped.lineStyle(1,0xf1dba9,.4).lineBetween(left,y+5,right,y+5);
   }
  });
  for(let i=0;i<3;i++){const x=290+i*190+(reduced?0:Math.sin(t*.22+i)*24);for(let r=4;r>0;r--)floor.fillStyle(colour,.006).fillEllipse(x,330+i%2*170,r*45,r*75);}
 }};
}
function pagoda(scene){
 if(!scene.textures?.exists(PAGODA_ART_KEY))return pagodaSketch(scene);
 scene.add.image(0,0,PAGODA_ART_KEY).setOrigin(0).setDisplaySize(W,H);
 const mapping=scene.add.graphics().setDepth(.12);
 // Facade panels measured on the 1536 x 1024 plate. Keep projection out of
 // arched openings and off the balcony rails, porch and playable dancefloor.
 const panels=[
  [[599,143],[665,125],[662,197],[590,209]],
  [[871,125],[937,143],[946,209],[874,197]],
  [[688,245],[848,245],[862,315],[674,315]],
 ].map(points=>points.map(([x,y])=>({x:x*W/1536,y:y*H/1024})));
 const point=(p,u,v)=>({x:(p[0].x*(1-u)+p[1].x*u)*(1-v)+(p[3].x*(1-u)+p[2].x*u)*v,y:(p[0].y*(1-u)+p[1].y*u)*(1-v)+(p[3].y*(1-u)+p[2].y*u)*v});
 return {lampPositions:[[440,369],[585,361],[700,353],[834,353],[950,361],[1095,369]].map(([x,y])=>[x*W/1536,y*H/1024]),update(elapsed,phase,reduced,timing){
  mapping.clear();
  const turn=reduced?0:elapsed*timing.bpm/60000/16*Math.PI*2;
  const energy=!reduced&&phase==='drop'?1:.8;
  panels.forEach((panel,i)=>{
   const breathe=.5+.5*Math.sin(turn+i*.9);
   // Overlapping soft tints fade continuously; no phrase-boundary colour cut.
   mapping.fillStyle(0x8ce5d7,(.025+.065*breathe)*energy).fillPoints(panel,true);
   mapping.fillStyle(0xc2a1ee,(.025+.065*(1-breathe))*energy).fillPoints(panel,true);
   for(let ring=0;ring<3;ring++){
    const radius=.17+ring*.105+Math.sin(turn-ring*.6+i*.5)*.025;
    const diamond=[[.5,.5-radius],[.5+radius,.5],[.5,.5+radius],[.5-radius,.5]].map(([u,v])=>point(panel,u,v));
    mapping.lineStyle(1.2,ring%2?0xa9f6e9:0xf6e2bc,(.13+.13*breathe)*energy).strokePoints(diamond,true);
   }
  });
 }};
}

function fractalForestSketch(scene){
 const scenery=scene.add.graphics();
 scenery.fillStyle(0x28253b).fillRect(0,0,W,H);
 scenery.fillStyle(0x1c1b32).fillRect(0,0,W,177);
 for(const [x,lean] of [[70,-15],[212,18],[747,-16],[902,17]])cedar(scenery,x,lean);
 grain(scenery,[0xd89fce,0x9ad9c3,0xbda4df]);
 for(let i=0;i<4;i++){
  scenery.lineStyle(1,0xb898ce,.055).strokeEllipse(480,374,320+i*125,157+i*85);
 }

 // A stretched radial canopy frames the booth above the active floor.
 const point=(angle,scale)=>({x:480+Math.cos(angle)*191*scale,y:77+Math.sin(angle)*69*scale});
 const colours=[0x733d7a,0x256354,0x4d408a,0x88564e];
 for(let i=0;i<16;i++){
  const angle=i*Math.PI/8,next=angle+Math.PI/8,mid=(angle+next)/2;
  const panel=[point(angle,.18),point(angle,1),point(mid,.82),point(next,1),point(next,.18)];
  scenery.fillStyle(colours[i%colours.length],.9).fillPoints(panel,true);
  scenery.lineStyle(1,0xe3b5db,.44).strokePoints(panel,true);
 }
 for(const x of [312,648]){
  scenery.lineStyle(5,0x5b586f,.9).lineBetween(x,79,x,169);
  scenery.lineStyle(1,0xb9a6c8,.56).lineBetween(x+3,79,x+3,169);
 }
 scenery.fillStyle(0x19162c).fillRoundedRect(404,116,152,52,5);
 scenery.lineStyle(2,0xe8a6d7,.65).strokeRoundedRect(404,116,152,52,5);
 scenery.fillStyle(0x5d356a).fillRect(409,137,142,26);
 for(const x of [434,480,526]){
  const diamond=[{x,y:141},{x:x+13,y:150},{x,y:159},{x:x-13,y:150}];
  scenery.lineStyle(1.5,0xb5e2b9,.75).strokePoints(diamond,true);
 }

 const ornaments=scene.add.graphics().setDepth(.12);
 return {update(elapsed,phase,reduced){
  const time=reduced?0:elapsed/1000;
  const strength=!reduced&&phase==='drop'?1.22:1;
  ornaments.clear();
  for(let i=0;i<8;i++){
   const angle=i*Math.PI/4+time*.21;
   const {x,y}=point(angle,.64);
   const colour=i%2?0xe898d8:0x92e3c3;
   ornaments.fillStyle(colour,.12*strength).fillCircle(x,y,9);
   ornaments.fillStyle(colour,.72).fillCircle(x,y,2.5);
  }
 }};
}

// Paths measured on the 1536 x 1024 art plate. They follow the roof eaves and
// branching supports, so the animation belongs to the structure itself.
const FRACTAL_TRACES=[
 [[440,166],[768,43],[1093,166],[440,166]],
 [[217,102],[350,31],[485,106],[336,74],[217,102]],
 [[1052,106],[1184,30],[1320,103],[1205,73],[1052,106]],
 [[515,207],[558,216],[604,232],[645,253],[680,282],[711,318],[735,355],[754,389]],
 [[1020,207],[976,216],[930,232],[889,253],[854,282],[823,318],[799,355],[780,389]],
].map(points=>{
 const scaled=points.map(([x,y])=>({x:x*W/1536,y:y*H/1024}));
 let length=0;const segments=[];
 for(let i=1;i<scaled.length;i++){
  const from=scaled[i-1],to=scaled[i],size=Math.hypot(to.x-from.x,to.y-from.y);
  segments.push({from,to,start:length,size});length+=size;
 }
 return {segments,length};
});
function traceSection(g,path,start,span,width,colour,alpha){
 for(const segment of path.segments){
  const low=Math.max(start,segment.start),high=Math.min(start+span,segment.start+segment.size);
  if(high<=low)continue;
  const a=(low-segment.start)/segment.size,b=(high-segment.start)/segment.size;
  const {from,to}=segment;
  g.lineStyle(width,colour,alpha).lineBetween(from.x+(to.x-from.x)*a,from.y+(to.y-from.y)*a,from.x+(to.x-from.x)*b,from.y+(to.y-from.y)*b);
 }
}
function fractalForest(scene){
 if(!scene.textures?.exists(FRACTAL_ART_KEY))return fractalForestSketch(scene);
 scene.add.image(0,0,FRACTAL_ART_KEY).setOrigin(0).setDisplaySize(W,H);
 const neon=scene.add.graphics().setDepth(.12);
 return {lampPositions:[420,444,468,492,516,540].map(x=>[x,137]),update(elapsed,phase,reduced,timing){
  neon.clear();
  const turns=reduced?0:elapsed*timing.bpm/60000/8;
  const energy=!reduced&&phase==='drop'?1:.78;
  FRACTAL_TRACES.forEach((path,i)=>{
   const colour=[0x91fff0,0xe796ff,0xb9ff76,0xb9ff76,0x86efff][i];
   const head=((turns+i*.19)%1)*path.length,span=path.length*.19;
   // Wrap short trails smoothly; no flashes or full-screen brightness jumps.
   for(const start of [head-span,head-span+path.length]){
    traceSection(neon,path,start,span,6,colour,.10*energy);
    traceSection(neon,path,start,span,1.6,colour,.8*energy);
   }
  });
 }};
}

function groveSketch(scene){
 const scenery=scene.add.graphics();
 scenery.fillStyle(0x253d35).fillRect(0,0,W,H);
 scenery.fillStyle(0x142d29).fillRect(0,0,W,177);
 for(const [x,lean] of [[27,-13],[109,15],[250,-28],[721,24],[841,-16],[943,10]])cedar(scenery,x,lean);
 grain(scenery,[0x8db699,0xa9ba9d,0xd8b985]);

 // Moss and low ferns frame the clearing without implying a blocked route.
 for(let i=0;i<10;i++){
  const y=181+i*49;
  for(const x of [26+(i%3)*14,W-26-(i%3)*14]){
   scenery.fillStyle(i%2?0x19352c:0x1c382f,.72).fillEllipse(x,y,110,69);
   for(const side of [-1,1]){
    scenery.lineStyle(1.5,0x779a73,.48).lineBetween(x,y+9,x+side*19,y-11);
    scenery.lineBetween(x+side*8,y,x+side*21,y-1);
   }
  }
 }
 scenery.fillStyle(0x152b26).fillRoundedRect(315,57,330,111,8);
 for(let x=333;x<642;x+=21){
  scenery.lineStyle(1,0x557451,.45).lineBetween(x,70,x,155);
 }
 scenery.fillStyle(0x594838).fillPoints([
  {x:295,y:85},{x:355,y:39},{x:603,y:39},{x:665,y:85},{x:642,y:97},{x:318,y:97},
 ],true);
 scenery.lineStyle(4,0xaa8860,.9).lineBetween(318,92,642,92);
 scenery.lineStyle(2,0xb89a70,.55).lineBetween(355,42,603,42);
 for(const x of [327,386,562,621]){
  scenery.fillStyle(0x89694c).fillRect(x,94,10,71);
  scenery.lineStyle(2,0xc0a478,.52).lineBetween(x+2,97,x+2,163);
 }
 scenery.fillStyle(0x4a4232).fillRoundedRect(306,164,348,11,4);
 scenery.fillStyle(0x263b30).fillRoundedRect(421,126,118,38,4);
 scenery.lineStyle(2,0xc9b08a,.62).strokeRoundedRect(421,126,118,38,4);
 const lamps=[[352,121],[407,109],[553,109],[608,121]];
 for(const [x,y] of lamps){
  scenery.lineStyle(1,0xb09673,.75).lineBetween(x,95,x,y);
  scenery.fillStyle(0xe7c28a,.9).fillRoundedRect(x-4,y,8,12,2);
 }

 const light=scene.add.graphics().setDepth(.12);
 return {update(elapsed,phase,reduced){
  const time=reduced?0:elapsed/1000;
  light.clear();
  for(const [x,y] of lamps){
   const breathe=.86+.14*Math.sin(time*.76+x);
   for(let radius=3;radius>0;radius--){
    light.fillStyle(0xffd49b,.033*breathe).fillEllipse(x,y+9,radius*17,radius*14);
   }
  }
  for(let i=0;i<3;i++){
   const x=232+i*252+Math.sin(time*.24+i)*22;
   const colour=i%2?0xe5c698:0x8cd6af;
   for(let radius=4;radius>0;radius--){
    light.fillStyle(colour,!reduced&&phase==='drop'?.012:.008).fillEllipse(x,270+i%2*142,radius*38,radius*54);
   }
  }
 }};
}

function grove(scene){
 if(!scene.textures?.exists(GROVE_ART_KEY))return groveSketch(scene);
 scene.add.image(0,0,GROVE_ART_KEY).setOrigin(0).setDisplaySize(W,H);
 const projection=scene.add.graphics().setDepth(.12);
 // These outlines follow the illustrated timber inlays, in 1536 x 1024 art
 // coordinates. A slow eight-beat breath keeps the wood legible without flashes.
 const diamond=(x,y,rx,ry)=>[{x,y:y-ry},{x:x+rx,y},{x,y:y+ry},{x:x-rx,y}].map(p=>({x:p.x*W/1536,y:p.y*H/1024}));
 const panels=[[261,327,20,30],[464,294,20,28],[1075,294,20,28],[1276,327,20,30]].map(p=>diamond(...p));
 const booth=[20,38,57].map(rx=>diamond(768,377,rx,rx*.66));
 return {lampPositions:[570,620,666,872,921,970].map(x=>[x*W/1536,228*H/1024]),update(elapsed,phase,reduced,timing){
  projection.clear();
  const turn=reduced?0:elapsed*timing.bpm/60000/8*Math.PI*2;
  const energy=!reduced&&phase==='drop'?1:.8;
  panels.forEach((points,i)=>{
   const glow=(.24+.12*Math.sin(turn+i*.5))*energy;
   projection.lineStyle(5,0xe5abff,glow*.14).strokePoints(points,true);
   projection.lineStyle(1,0xe5abff,glow).strokePoints(points,true);
  });
  booth.forEach((points,i)=>{
   const glow=(.25+.15*Math.sin(turn-i*.55))*energy;
   projection.lineStyle(4,0xffd997,glow*.15).strokePoints(points,true);
   projection.lineStyle(1.2,0xffdfaa,glow).strokePoints(points,true);
  });
 }};
}

function ampSketch(scene){
 const scenery=scene.add.graphics();
 scenery.fillStyle(0x243341).fillRect(0,0,W,H);
 scenery.fillStyle(0x152632).fillRect(0,0,W,177);
 for(const [x,lean] of [[62,-15],[163,18],[810,-16],[915,17]])cedar(scenery,x,lean);
 grain(scenery,[0xa5d0dc,0xe6bd8e,0x8fa5d1]);
 for(let i=0;i<4;i++){
  scenery.lineStyle(1,0x9cbecc,.06).strokeEllipse(480,361,420+i*136,179+i*77);
 }
 // Timber stage face and recessed light panels above the pit.
 scenery.fillStyle(0x594638).fillRect(247,65,466,104);
 scenery.fillStyle(0x7b6150).fillPoints([
  {x:231,y:68},{x:270,y:39},{x:690,y:39},{x:729,y:68},{x:718,y:78},{x:242,y:78},
 ],true);
 scenery.lineStyle(3,0xbe9c79,.74).lineBetween(242,75,718,75);
 for(const x of [260,345,605,690]){
  scenery.fillStyle(0x846752).fillRect(x,77,10,91);
  scenery.lineStyle(1,0xc4a381,.56).lineBetween(x+3,79,x+3,165);
 }
 for(const x of [276,364,528,616]){
  scenery.fillStyle(0x172832).fillRoundedRect(x,88,68,59,3);
  scenery.lineStyle(1,0x719fae,.45).strokeRoundedRect(x,88,68,59,3);
 }
 scenery.fillStyle(0x14252e).fillRoundedRect(430,123,100,37,4);
 scenery.lineStyle(2,0x9cbcc0,.68).strokeRoundedRect(430,123,100,37,4);
 scenery.fillStyle(0x4a3e35).fillRect(242,166,476,10);

 const panels=scene.add.graphics().setDepth(.12);
 return {update(elapsed,phase,reduced){
  const time=reduced?0:elapsed/1000;
  const glow=!reduced&&phase==='drop'?.37:.24;
  panels.clear();
  for(const [index,x] of [276,364,528,616].entries()){
   const colour=index%2?0x8dd7f3:0xe5ac76;
   for(let row=0;row<5;row++){
    const width=27+16*Math.sin(time*1.2+index+row*.7);
    panels.fillStyle(colour,glow).fillRect(x+34-width/2,97+row*8,width,3);
   }
  }
 }};
}

function amp(scene){
 if(!scene.textures?.exists(AMP_ART_KEY))return ampSketch(scene);
 scene.add.image(0,0,AMP_ART_KEY).setOrigin(0).setDisplaySize(W,H);
 const leds=scene.add.graphics().setDepth(.12);
 // Insets measured on the 1536 x 1024 plate keep motion inside the screens,
 // clear of carved corner brackets, speakers and the playable dancefloor.
 const screens=[[246,253,237,119],[1054,253,237,119],[641,368,254,41]].map(([x,y,width,height])=>({x:x*W/1536,y:y*H/1024,width:width*W/1536,height:height*H/1024}));
 return {lampPositions:[595,653,707,827,881,940].map(x=>[x*W/1536,205*H/1024]),update(elapsed,phase,reduced,timing){
  leds.clear();
  const turn=reduced?0:elapsed*timing.bpm/60000/16*Math.PI*2;
  const energy=!reduced&&phase==='drop'?1:.8;
  screens.forEach((screen,index)=>{
   for(let band=0;band<5;band++){
    const points=[];
    for(let step=0;step<=16;step++){
     const u=step/16;
     // Smooth bounded ribbons; no bright full-panel fills or flashing cuts.
     const v=.2+band*.15+Math.sin(u*Math.PI*2+turn+band*.4+index*.8)*.10;
     points.push({x:screen.x+u*screen.width,y:screen.y+v*screen.height});
    }
    leds.lineStyle(1,band%2?0xc792f2:0x6bcbdc,.22*energy).strokePoints(points,false);
   }
  });
 }};
}

function villageSketch(scene){
 const scenery=scene.add.graphics();
 scenery.fillStyle(0x3b353c).fillRect(0,0,W,H);
 scenery.fillStyle(0x51434c).fillRect(0,0,W,177);
 scenery.fillStyle(0xc68165,.25).fillRect(0,86,W,91);
 scenery.fillStyle(0xffbd84,.57).fillCircle(480,100,49);
 for(const [x,lean] of [[57,-13],[175,13],[783,-18],[910,12]])cedar(scenery,x,lean);
 grain(scenery,[0xdcb19b,0x9eafbe,0xe6be88]);
 for(let i=0;i<4;i++){
  scenery.fillStyle(0xcf9c74,.022).fillEllipse(482,381,695-i*105,438-i*62);
 }

 // A central portal with timber towers and two levels of railings.
 scenery.fillStyle(0x513f3d).fillRoundedRect(253,100,454,75,4);
 for(const x of [254,590]){
  scenery.fillStyle(0x372f37).fillRect(x,57,116,116);
  scenery.fillStyle(0x6b5042).fillTriangle(x-14,66,x+58,26,x+130,66);
  scenery.lineStyle(2,0xd49f73,.74).lineBetween(x-13,66,x+58,29).lineBetween(x+58,29,x+129,66);
  for(const railY of [102,143]){
   scenery.lineStyle(3,0xbc916d,.8).lineBetween(x+8,railY,x+108,railY);
   for(let dx=10;dx<110;dx+=16)scenery.lineBetween(x+dx,railY-14,x+dx,railY);
  }
  for(const postX of [x+4,x+106])scenery.fillStyle(0x88634d).fillRect(postX,65,8,108);
 }
 scenery.fillStyle(0x302934).fillCircle(480,117,55);
 scenery.lineStyle(8,0x8e6558,.92).strokeCircle(480,117,54);
 scenery.lineStyle(2,0xf8bf8b,.72).strokeCircle(480,117,44);
 scenery.fillStyle(0x272831).fillRoundedRect(419,138,122,31,3);
 scenery.lineStyle(2,0xc99572,.72).strokeRoundedRect(419,138,122,31,3);

 const portal=scene.add.graphics().setDepth(.12);
 return {update(elapsed,phase,reduced){
  const time=reduced?0:elapsed/1000;
  const light=reduced?.45:.44+.12*Math.sin(time*.95);
  portal.clear();
  for(let i=0;i<9;i++){
   const angle=Math.PI+i*Math.PI/8;
   const x=480+49*Math.cos(angle),y=117+49*Math.sin(angle);
   portal.fillStyle(0xffcc98,light).fillCircle(x,y,3);
  }
  const glow=!reduced&&phase==='drop'?.18:.11;
  portal.fillStyle(0xf3a97c,glow).fillEllipse(480,125,66,27);
 }};
}

function village(scene){
 if(!scene.textures?.exists(VILLAGE_ART_KEY))return villageSketch(scene);
 scene.add.image(0,0,VILLAGE_ART_KEY).setOrigin(0).setDisplaySize(W,H);
 const screens=scene.add.graphics().setDepth(.12);
 // Insets measured on the final 1536 x 1024 plate. Keep the cut-out tower
 // panels, hanging speaker arrays and dancefloor clear of screen animation.
 const panels=[
  [283,273,42,54],[412,242,42,56],[556,148,47,43],[559,264,44,54],
  [932,148,45,43],[932,264,45,54],[1080,242,43,56],[1213,273,40,54],
  [671,342,59,26],[739,342,58,26],[806,342,59,26],
 ].map(([x,y,w,h])=>({x:x*W/1536,y:y*H/1024,w:w*W/1536,h:h*H/1024}));
 return {lampPositions:[645,686,727,768,809,850].map(x=>[x*W/1536,202*H/1024]),update(elapsed,phase,reduced,timing){
  screens.clear();
  const turn=reduced?0:elapsed*timing.bpm/60000/16*Math.PI*2;
  const energy=!reduced&&phase==='drop'?1:.8;
  panels.forEach((p,i)=>{
   const breathe=.5+.5*Math.sin(turn+i*.55);
   screens.fillStyle(0x66ccda,(.025+.045*breathe)*energy).fillRect(p.x,p.y,p.w,p.h);
   screens.fillStyle(0xc78ac9,(.025+.045*(1-breathe))*energy).fillRect(p.x,p.y,p.w,p.h);
   for(let band=0;band<3;band++){
    const points=[];
    for(let step=0;step<=12;step++){
     const u=step/12,v=.24+band*.23+Math.sin(u*Math.PI*2+turn+i*.5+band*.6)*.09;
     points.push({x:p.x+u*p.w,y:p.y+v*p.h});
    }
    screens.lineStyle(.8,band%2?0xe0a2d0:0x8ce4df,.2*energy).strokePoints(points,false);
   }
  });
 }};
}

export function createSMFStageView(scene,stage){
 if(stage.id==='smf-living-room')return livingRoom(scene);
 if(stage.id==='smf-fractal')return fractalForest(scene);
 if(stage.id==='smf-grove')return grove(scene);
 if(stage.id==='smf-amp')return amp(scene);
 if(stage.id==='smf-pagoda')return pagoda(scene);
 if(stage.id==='smf-village')return village(scene);
 return null;
}
