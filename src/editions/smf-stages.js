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
 {
  id:'smf-amp',name:'The AMP',caption:'Deep 140 · open pit · four pockets of bass',
  timingId:'smf-amp-clock-preview-1',target:24,spawn:{x:480,y:425},
  crowdAnchors:[
   [244,220],[390,250],[566,246],[500,271],[769,254],[385,332],[183,385],[795,370],
   [380,395],[530,346],[595,450],[177,485],[475,537],[603,546],[240,542],[794,563],
  ],
  obstacles:[
   {x:270,y:274,width:66,height:70},{x:648,y:285,width:66,height:70},
   {x:318,y:466,width:66,height:70},{x:686,y:445,width:66,height:70},
  ],
  mud:[],flowSpawns:[{x:408,y:281},{x:610,y:519}],
  palette:{wash:0x456e8c,accent:0xb8effa},
  lighting:lighting([0x7de0ee,0x86a6fa,0xf7bd77,0xc2eaf2,0x8bbaf4,0xeda673],[0x5d8fc1,0x6bb8bb,0xc69c6e,0x6c8bb5],{width:205,period:9300,sweep:.36,spread:1.25,alpha:.052}),
 },
 {id:'smf-pagoda',name:'The Pagoda',caption:'A temple of light · twin lanes · follow the returning pulse',timingId:'smf-pagoda-clock-preview-1',target:28,
  spawn:{x:480,y:430},crowdAnchors:[[185,245],[380,240],[500,225],[610,235],[790,250],[185,390],[390,375],[500,350],[590,400],[790,415],[380,515],[500,520],[620,520],[185,550],[790,550],[450,285],[720,515],[555,445]],
  obstacles:[{x:255,y:265,width:60,height:70},{x:655,y:305,width:60,height:70},{x:250,y:460,width:60,height:65}],mud:[],flowSpawns:[{x:395,y:290},{x:740,y:465}],palette:{wash:0x6463c7,accent:0xd6ccff},
  lighting:lighting([0xc9c2ff,0x81d9e5,0xffce8b,0xe4d9ff,0x86cde3,0xbcb0ff],[0x8680d9,0x77b9d0,0xc6a16a,0x7977bb],{width:190,core:30,period:6500,sweep:.34,spread:1.1,alpha:.05}),
 },
 {
  id:'smf-village',name:'The Village',caption:'Rolling drum and bass · timber towers · dance into dawn',
  timingId:'smf-village-clock-preview-1',target:34,spawn:{x:480,y:420},
  crowdAnchors:[
   [330,225],[478,230],[760,242],[192,229],[330,316],[517,310],[840,303],[549,480],
   [794,350],[351,378],[190,478],[661,432],[241,538],[452,555],[585,540],[805,552],
   [565,373],[680,369],[455,277],[824,478],
  ],
  obstacles:[
   {x:214,y:315,width:64,height:70},{x:610,y:248,width:66,height:68},
   {x:362,y:458,width:66,height:68},{x:722,y:416,width:64,height:66},
  ],
  mud:[],flowSpawns:[{x:340,y:407},{x:682,y:489}],
  palette:{wash:0x966c58,accent:0xffd3a0},
  lighting:lighting([0xffc88a,0xe5a08d,0x9dcadd,0xf8dba0,0xb2c5de,0xf4b582],[0xb9836b,0x80a1b8,0xd2ab77,0xa1777b],{width:201,period:7800,sweep:.31,alpha:.051}),
 },
];
function freeze(value){if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
freeze(SMF_PREVIEW_STAGES);
export function smfPreviewStage(id){const stage=SMF_PREVIEW_STAGES.find(s=>s.id===id);if(!stage)throw new Error(`Unknown preview venue: ${String(id)}`);return stage;}
