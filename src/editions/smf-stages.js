// Original preview layouts, not surveyed festival maps or ranked rulesets.
const lighting=(colours,pools,options)=>({colours,pools,width:155,core:25,period:10000,sweep:.23,spread:1,alpha:.042,...options});
export const SMF_PREVIEW_STAGES=[
 {id:'smf-living-room',name:'The Living Room',caption:'Sister cedars · river reflections · a little room to breathe',timingId:'smf-living-room-clock-preview-1',target:23,
  spawn:{x:480,y:425},crowdAnchors:[[350,250],[470,260],[620,250],[735,300],[350,380],[600,365],[265,500],[425,515],[590,510],[700,535]],
  obstacles:[{x:205,y:245,width:60,height:65},{x:745,y:420,width:60,height:65}],mud:[],flowSpawns:[{x:385,y:325},{x:650,y:435}],palette:{wash:0xd0a06d,accent:0xf6d297},
  lighting:lighting([0xffd495,0x8fd8c7,0xefb57b,0xf3d8a2,0xa6dccc,0xffce92],[0x87ccc0,0xdfae78,0xebc78e,0x86b4ac],{}),
 },
 {id:'smf-pagoda',name:'The Pagoda',caption:'A temple of light · twin lanes · follow the returning pulse',timingId:'smf-pagoda-clock-preview-1',target:28,
  spawn:{x:480,y:430},crowdAnchors:[[185,245],[380,240],[500,225],[610,235],[790,250],[185,390],[390,375],[500,350],[590,400],[790,415],[380,515],[500,520],[620,520],[185,550],[790,550],[450,285],[720,515],[500,445]],
  obstacles:[{x:255,y:265,width:60,height:70},{x:655,y:305,width:60,height:70},{x:250,y:460,width:60,height:65}],mud:[],flowSpawns:[{x:395,y:290},{x:740,y:465}],palette:{wash:0x6463c7,accent:0xd6ccff},
  lighting:lighting([0xc9c2ff,0x81d9e5,0xffce8b,0xe4d9ff,0x86cde3,0xbcb0ff],[0x8680d9,0x77b9d0,0xc6a16a,0x7977bb],{width:190,core:30,period:6500,sweep:.34,spread:1.1,alpha:.05}),
 },
];
function freeze(value){if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
freeze(SMF_PREVIEW_STAGES);
export function smfPreviewStage(id){const stage=SMF_PREVIEW_STAGES.find(s=>s.id===id);if(!stage)throw new Error(`Unknown preview venue: ${String(id)}`);return stage;}
