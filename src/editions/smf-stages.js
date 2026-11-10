// Original preview layouts, not surveyed festival maps or ranked rulesets.
// Each illustrated facade has a nonplayable apron. Wider/lower pickup ranges
// use the remaining open floor; front rows retain safe speaker bypass lanes.
const lighting=(colours,pools,options)=>({colours,pools,width:155,core:25,period:10000,sweep:.23,spread:1,alpha:.042,...options});
export const SMF_PREVIEW_STAGES=[
 {id:'smf-living-room',name:'The Living Room',caption:'Sister cedars · river reflections · a little room to breathe',timingId:'smf-living-room-clock-preview-1',target:23,
  playBounds:{minX:0,minY:300,maxX:960,maxY:640},pickupBounds:{minX:130,minY:330,maxX:830,maxY:590},
  spawn:{x:480,y:425},crowdAnchors:[[350,362],[485,349],[620,364],[735,372],[350,409],[600,409],[265,502],[425,514],[590,509],[700,537]],
  obstacles:[{x:205,y:330,width:60,height:65},{x:745,y:420,width:60,height:65}],mud:[],flowSpawns:[{x:385,y:332},{x:650,y:437}],palette:{wash:0xd0a06d,accent:0xf6d297},
  lighting:lighting([0xffd495,0x8fd8c7,0xefb57b,0xf3d8a2,0xa6dccc,0xffce92],[0x87ccc0,0xdfae78,0xebc78e,0x86b4ac],{}),
 },
 {
  id:'smf-fractal',name:'Fractal Forest',caption:'Funk breaks · neon canopy · weave through the crowd',
  timingId:'smf-fractal-clock-preview-1',target:24,playBounds:{minX:0,minY:270,maxX:960,maxY:640},pickupBounds:{minX:130,minY:300,maxX:830,maxY:590},
  spawn:{x:480,y:440},
  crowdAnchors:[[200,332],[390,334],[525,334],[735,332],[200,399],[365,404],[530,357],[775,389],[220,519],[365,547],[535,539],[740,534]],
  obstacles:[{x:270,y:302,width:62,height:66},{x:650,y:400,width:62,height:66}],
  mud:[],flowSpawns:[{x:390,y:307},{x:750,y:492}],
  palette:{wash:0x855eb4,accent:0xf6b0ed},
  lighting:lighting([0xf487d5,0x7bddaa,0xb28ef1,0xf6cc8c,0x8df1c4,0xec9ee6],[0xaa61a7,0x64b398,0xa58ada,0xd182ac],{width:186,period:7200,sweep:.32,alpha:.049}),
 },
 {
  id:'smf-grove',name:'The Grove',caption:'Spacious two-step · cedar shadows · paths around the bass',
  timingId:'smf-grove-clock-preview-1',target:24,playBounds:{minX:0,minY:285,maxX:960,maxY:640},pickupBounds:{minX:130,minY:315,maxX:830,maxY:590},
  spawn:{x:480,y:440},
  crowdAnchors:[[170,357],[365,349],[490,349],[765,347],[175,399],[365,414],[500,377],[775,389],[180,524],[435,552],[555,514],[735,534],[555,397],[790,474]],
  obstacles:[{x:260,y:315,width:62,height:65},{x:625,y:315,width:62,height:68},{x:300,y:470,width:64,height:68}],
  mud:[{
   x:366,y:371,width:73,height:62,
   points:[{x:373,y:387},{x:400,y:371},{x:428,y:378},{x:439,y:403},{x:422,y:428},{x:389,y:433},{x:366,y:417}],
  }],
  flowSpawns:[{x:405,y:317},{x:725,y:432}],
  palette:{wash:0x53795d,accent:0xc6e0b2},
  lighting:lighting([0xa0d4b4,0xd7b377,0x7bc5b9,0xc7d79a,0xf1cc88,0x7eb9ab],[0x6ba695,0xbca469,0x8fa477,0x709d9a],{width:182,period:11600,sweep:.2,alpha:.039}),
 },
 {
  id:'smf-amp',name:'The AMP',caption:'Deep 140 · open pit · four pockets of bass',
  timingId:'smf-amp-clock-preview-1',target:24,playBounds:{minX:0,minY:285,maxX:960,maxY:640},pickupBounds:{minX:130,minY:315,maxX:830,maxY:590},
  spawn:{x:480,y:425},
  crowdAnchors:[[200,347],[390,349],[565,349],[500,357],[770,349],[370,404],[185,397],[795,394],[395,434],[545,367],[595,449],[175,484],[475,537],[605,544],[240,544],[795,567]],
  obstacles:[{x:270,y:315,width:66,height:70},{x:648,y:315,width:66,height:70},{x:318,y:466,width:66,height:70},{x:686,y:445,width:66,height:70}],
  mud:[],flowSpawns:[{x:410,y:317},{x:610,y:517}],
  palette:{wash:0x456e8c,accent:0xb8effa},
  lighting:lighting([0x7de0ee,0x86a6fa,0xf7bd77,0xc2eaf2,0x8bbaf4,0xeda673],[0x5d8fc1,0x6bb8bb,0xc69c6e,0x6c8bb5],{width:205,period:9300,sweep:.36,spread:1.25,alpha:.052}),
 },
 {id:'smf-pagoda',name:'The Pagoda',caption:'A temple of light · twin lanes · follow the returning pulse',timingId:'smf-pagoda-clock-preview-1',target:28,
  playBounds:{minX:0,minY:290,maxX:960,maxY:640},pickupBounds:{minX:130,minY:320,maxX:830,maxY:590},
  spawn:{x:480,y:430},crowdAnchors:[[185,352],[380,349],[500,344],[585,352],[790,354],[185,409],[390,397],[545,389],[590,409],[790,417],[380,514],[500,519],[620,522],[185,549],[790,549],[410,362],[720,514],[560,454]],
  obstacles:[{x:255,y:320,width:60,height:70},{x:655,y:320,width:60,height:70},{x:250,y:460,width:60,height:65}],mud:[],flowSpawns:[{x:395,y:322},{x:740,y:467}],palette:{wash:0x6463c7,accent:0xd6ccff},
  lighting:lighting([0xc9c2ff,0x81d9e5,0xffce8b,0xe4d9ff,0x86cde3,0xbcb0ff],[0x8680d9,0x77b9d0,0xc6a16a,0x7977bb],{width:190,core:30,period:6500,sweep:.34,spread:1.1,alpha:.05}),
 },
 {
  id:'smf-village',name:'The Village',caption:'Rolling drum and bass · timber towers · dance into dawn',
  timingId:'smf-village-clock-preview-1',target:34,playBounds:{minX:0,minY:275,maxX:960,maxY:640},pickupBounds:{minX:130,minY:305,maxX:830,maxY:590},
  spawn:{x:480,y:420},
  crowdAnchors:[[350,337],[480,334],[760,339],[140,337],[325,369],[535,359],[840,357],[550,479],[820,374],[395,407],[190,479],[660,434],[240,537],[450,559],[585,539],[805,552],[565,384],[710,379],[405,347],[825,479]],
  obstacles:[{x:214,y:315,width:64,height:70},{x:610,y:305,width:66,height:68},{x:362,y:458,width:66,height:68},{x:722,y:416,width:64,height:66}],
  mud:[],flowSpawns:[{x:340,y:407},{x:680,y:487}],
  palette:{wash:0x966c58,accent:0xffd3a0},
  lighting:lighting([0xffc88a,0xe5a08d,0x9dcadd,0xf8dba0,0xb2c5de,0xf4b582],[0xb9836b,0x80a1b8,0xd2ab77,0xa1777b],{width:201,period:7800,sweep:.31,alpha:.051}),
 },
];
function freeze(value){if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
freeze(SMF_PREVIEW_STAGES);
export function smfPreviewStage(id){const stage=SMF_PREVIEW_STAGES.find(s=>s.id===id);if(!stage)throw new Error(`Unknown preview venue: ${String(id)}`);return stage;}
