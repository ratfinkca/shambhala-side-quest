const forestAnchors=[[235,250],[385,255],[565,235],[735,260],[300,365],[665,365],[225,490],[410,490],[585,495],[750,485]];
const festivalAnchors=[200,340,480,620,760,850].flatMap(x=>[210,455,555].map(y=>[x,y]));
export const STAGES=[
 {id:'forest',name:'Living Forest',target:20,crowdAnchors:forestAnchors,obstacles:[],mud:[],spawn:{x:480,y:380},palette:{wash:0x7adca7,accent:0xc8f68c},flowSpawns:[{x:410,y:290},{x:650,y:440}]},
 {id:'neon',name:'Neon Grove',target:25,crowdAnchors:festivalAnchors.slice(0,14),obstacles:[{x:330,y:310,width:90,height:65},{x:620,y:310,width:90,height:65}],mud:[],spawn:{x:480,y:400},palette:{wash:0x9759e2,accent:0x95e8ff},flowSpawns:[{x:480,y:240},{x:770,y:440}]},
 {id:'sunrise',name:'Sunrise Clearing',target:30,crowdAnchors:festivalAnchors,obstacles:[{x:250,y:310,width:60,height:65},{x:440,y:310,width:60,height:65},{x:630,y:310,width:60,height:65}],mud:[{x:320,y:480,width:110,height:65},{x:690,y:200,width:100,height:70}],spawn:{x:480,y:410},palette:{wash:0xef9879,accent:0xffdd97},flowSpawns:[{x:400,y:240},{x:740,y:420}]},
];
