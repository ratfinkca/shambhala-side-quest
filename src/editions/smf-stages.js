// Original preview layouts, not surveyed festival maps or ranked rulesets.
const lighting=(colours,pools,options)=>({colours,pools,width:155,core:25,period:10000,sweep:.23,spread:1,alpha:.042,...options});
export const SMF_PREVIEW_STAGES=[
 {id:'smf-living-room',name:'The Living Room',caption:'Sister cedars · river reflections · a little room to breathe',timingId:'smf-living-room-clock-preview-1',target:23,
  spawn:{x:480,y:425},crowdAnchors:[[350,250],[470,260],[620,250],[735,300],[350,380],[600,365],[265,500],[425,515],[590,510],[700,535]],
  obstacles:[{x:205,y:245,width:60,height:65},{x:745,y:420,width:60,height:65}],mud:[],flowSpawns:[{x:385,y:325},{x:650,y:435}],palette:{wash:0xd0a06d,accent:0xf6d297},
  lighting:lighting([0xffd495,0x8fd8c7,0xefb57b,0xf3d8a2,0xa6dccc,0xffce92],[0x87ccc0,0xdfae78,0xebc78e,0x86b4ac],{}),
 },
 {
  id:'smf-fractal',name:'Fractal Forest',caption:'Funk breaks · neon canopy · weave through the crowd',
  timingId:'smf-fractal-clock-preview-1',target:24,spawn:{x:480,y:440},
  crowdAnchors:[[220,245],[390,255],[525,245],[735,250],[202,400],[365,405],[530,320],[775,390],[220,520],[365,545],[535,540],[740,535]],
  obstacles:[{x:270,y:302,width:62,height:66},{x:650,y:400,width:62,height:66}],
  mud:[],flowSpawns:[{x:390,y:305},{x:750,y:490}],
  palette:{wash:0x855eb4,accent:0xf6b0ed},
  lighting:lighting([0xf487d5,0x7bddaa,0xb28ef1,0xf6cc8c,0x8df1c4,0xec9ee6],[0xaa61a7,0x64b398,0xa58ada,0xd182ac],{width:186,period:7200,sweep:.32,alpha:.049}),
 },
 {
  id:'smf-grove',name:'The Grove',caption:'Spacious two-step · cedar shadows · paths around the bass',
  timingId:'smf-grove-clock-preview-1',target:24,spawn:{x:480,y:440},
  crowdAnchors:[[170,265],[365,245],[490,245],[763,237],[175,390],[365,350],[505,345],[775,365],[180,525],[435,550],[555,515],[737,535],[585,390],[788,475]],
  obstacles:[{x:260,y:255,width:62,height:65},{x:625,y:275,width:62,height:68},{x:300,y:470,width:64,height:68}],
  mud:[{
   x:366,y:371,width:73,height:62,
   points:[{x:373,y:387},{x:400,y:371},{x:428,y:378},{x:439,y:403},{x:422,y:428},{x:389,y:433},{x:366,y:417}],
  }],
  flowSpawns:[{x:405,y:302},{x:724,y:433}],
  palette:{wash:0x53795d,accent:0xc6e0b2},
  lighting:lighting([0xa0d4b4,0xd7b377,0x7bc5b9,0xc7d79a,0xf1cc88,0x7eb9ab],[0x6ba695,0xbca469,0x8fa477,0x709d9a],{width:182,period:11600,sweep:.2,alpha:.039}),
 },
 {id:'smf-pagoda',name:'The Pagoda',caption:'A temple of light · twin lanes · follow the returning pulse',timingId:'smf-pagoda-clock-preview-1',target:28,
  spawn:{x:480,y:430},crowdAnchors:[[185,245],[380,240],[500,225],[610,235],[790,250],[185,390],[390,375],[500,350],[590,400],[790,415],[380,515],[500,520],[620,520],[185,550],[790,550],[450,285],[720,515],[555,445]],
  obstacles:[{x:255,y:265,width:60,height:70},{x:655,y:305,width:60,height:70},{x:250,y:460,width:60,height:65}],mud:[],flowSpawns:[{x:395,y:290},{x:740,y:465}],palette:{wash:0x6463c7,accent:0xd6ccff},
  lighting:lighting([0xc9c2ff,0x81d9e5,0xffce8b,0xe4d9ff,0x86cde3,0xbcb0ff],[0x8680d9,0x77b9d0,0xc6a16a,0x7977bb],{width:190,core:30,period:6500,sweep:.34,spread:1.1,alpha:.05}),
 },
];
function freeze(value){if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
freeze(SMF_PREVIEW_STAGES);
export function smfPreviewStage(id){const stage=SMF_PREVIEW_STAGES.find(s=>s.id===id);if(!stage)throw new Error(`Unknown preview venue: ${String(id)}`);return stage;}
