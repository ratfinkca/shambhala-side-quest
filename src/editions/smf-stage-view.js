// Original canvas interpretations. Scenery is decorative; stage data owns collision.
const W=960,H=640;
function cedar(g,x,lean){
 g.fillStyle(0x122d2c).fillPoints([{x:x-22,y:164},{x:x+9,y:164},{x:x+lean+12,y:42},{x:x+lean-6,y:15}],true);
 g.lineStyle(3,0x705b40,.7).lineBetween(x-5,165,x+lean,38);
 for(let i=0;i<7;i++){const y=22+i*20,span=95-i*7;g.fillStyle(i%2?0x163b33:0x20463b,.95).fillTriangle(x+lean,y-25,x-span,y+25,x+span,y+25);}
}
function grain(g,colours){for(let i=0;i<150;i++){const x=155+(i*137%660),y=195+(i*83%410);g.fillStyle(colours[i%colours.length],.06).fillEllipse(x,y,2+i%3,1);}}
function livingRoom(scene){
 const g=scene.add.graphics();g.fillGradientStyle(0x4d7573,0x8b8370,0x204d46,0x183e39).fillRect(0,0,W,H);
 g.fillStyle(0xf4c47d,.22).fillCircle(775,74,54);g.fillStyle(0xffdea1,.22).fillCircle(775,74,31);
 for(let i=0;i<6;i++)g.fillStyle(0x244c44,.4).fillTriangle(i*190-100,160,i*190+40,15+(i%3)*18,i*190+170,160);
 // Salmo-inspired river stays at the perimeter, away from authored pickup space.
 const bank=[{x:0,y:150},{x:95,y:150},{x:130,y:250},{x:100,y:345},{x:132,y:450},{x:110,y:550},{x:138,y:640},{x:0,y:640}];
 g.fillStyle(0xc2b58a,.48).fillPoints(bank.map(p=>({x:p.x+14,y:p.y})),true);g.fillStyle(0x1c5c65).fillPoints(bank,true);
 for(let i=0;i<8;i++)g.fillStyle(0xc6b584,.018).fillEllipse(510,402,720-i*52,500-i*32);
 grain(g,[0xe6d0a1,0x91b9a7,0xa9c8b7]);cedar(g,125,-20);cedar(g,850,12);
 // Low timber shelter, warm plankwork and a lit booth beneath the sister cedars.
 g.fillStyle(0x243d35).fillRoundedRect(337,74,286,92,5);
 for(let x=344;x<620;x+=17)g.lineStyle(2,0xb39666,.36).lineBetween(x,84,x,162);
 g.fillStyle(0x342f25).fillPoints([{x:310,y:91},{x:347,y:58},{x:601,y:58},{x:649,y:91},{x:638,y:105},{x:320,y:105}],true);
 g.lineStyle(3,0xd2b17d,.8).lineBetween(320,103,638,103).lineBetween(347,61,601,61);
 for(const x of [348,612])g.fillStyle(0x6b5438).fillRect(x,95,10,80);
 g.fillStyle(0x102f2d).fillRoundedRect(415,113,139,40,5);g.lineStyle(1,0xd8c08a,.7).strokeRoundedRect(415,113,139,40,5);
 for(let i=0;i<9;i++)g.fillStyle(i%2?0x8dc9b4:0xf1c88e,.32).fillRect(423+i*14,120,8,22);
 g.fillStyle(0x7b6040).fillRoundedRect(393,151,184,17,4);
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
function pagoda(scene){
 const g=scene.add.graphics();g.fillGradientStyle(0x141d36,0x241e43,0x172a35,0x192c36).fillRect(0,0,W,H);
 // Deep forest silhouette frames a luminous seven-tier facade.
 for(const x of [70,125,835,895]){g.fillStyle(0x0f202b).fillRect(x,0,17,185);for(let i=0;i<5;i++)g.fillTriangle(x+8,12+i*25,x-48,63+i*25,x+68,63+i*25);}
 for(let i=0;i<7;i++)g.lineStyle(1,i%2?0xa59de1:0x67a2b8,.07).strokeEllipse(480,390,250+i*105,120+i*58);
 grain(g,[0xb9b2e1,0x8cb3c6]);g.fillStyle(0x101727).fillRoundedRect(246,144,468,32,6);
 const tiers=[];
 for(let i=0;i<7;i++){
  const y=23+i*20,half=44+i*25;
  g.fillStyle(i%2?0x2c3153:0x252c47).fillRect(480-half*.72,y,half*1.44,24);
  for(const side of [-1,1])g.lineStyle(1,0x9687bd,.6).lineBetween(480+side*half*.65,y+2,480+side*half*.65,y+23);
  const roof=[{x:480-half-12,y:y+9},{x:480-half*.8,y:y+3},{x:480-half*.45,y:y-7},{x:480+half*.45,y:y-7},{x:480+half*.8,y:y+3},{x:480+half+12,y:y+9},{x:480+half,y:y+14},{x:480-half,y:y+14}];
  g.fillStyle(0x151f35).fillPoints(roof,true);g.lineStyle(1.5,0xd0c9ef,.65).strokePoints(roof,true);tiers.push({y,half});
 }
 g.lineStyle(2,0xdac68d,.8).lineBetween(480,3,480,15);
 for(const x of [255,705]){g.fillStyle(0x283344).fillRect(x,102,12,64);for(let i=0;i<4;i++)g.lineStyle(1,0xb6aee0,.45).strokeTriangle(x-11,116+i*12,x+6,106+i*12,x+24,116+i*12);}
 g.fillStyle(0x0c1825).fillRoundedRect(435,143,90,24,4);g.lineStyle(1.5,0xe5d2a8,.7).strokeRoundedRect(435,143,90,24,4);
 const mapped=scene.add.graphics().setDepth(.12),floor=scene.add.graphics().setDepth(.13);
 return {update(elapsed,phase,reduced,timing){
  const t=reduced?0:elapsed/1000,phrase=reduced?0:Math.floor(elapsed*timing.bpm/240000/8),colour=[0xa7a0ed,0x82c9d4,0xd8b780,0xc2b0ef][phrase%4];mapped.clear();floor.clear();
  for(const [i,{y,half}]of tiers.entries()){
   const breathe=reduced?.4:.35+.12*Math.sin(t*.7+i*.7);mapped.lineStyle(1.5,colour,breathe);
   const inset=half*.55;for(const side of [-1,1])mapped.strokeTriangle(480+side*inset,y+16,480+side*inset*.35,y+16,480+side*inset*.7,y+24);
   mapped.lineStyle(1,0xe6e2ff,.25).lineBetween(480-half*.65,y+25,480+half*.65,y+25);
  }
  for(let i=0;i<3;i++){const x=290+i*190+(reduced?0:Math.sin(t*.22+i)*24);for(let r=4;r>0;r--)floor.fillStyle(colour,.006).fillEllipse(x,330+i%2*170,r*45,r*75);}
 }};
}
export function createSMFStageView(scene,stage){
 if(stage.id==='smf-living-room')return livingRoom(scene);
 if(stage.id==='smf-pagoda')return pagoda(scene);
 return null;
}
