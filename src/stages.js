const forestAnchors=[[235,250],[385,255],[565,235],[735,260],[300,365],[665,365],[225,490],[410,490],[585,495],[750,485]];
const festivalAnchors=[200,340,480,620,760,850].flatMap(x=>[210,455,555].map(y=>[x,y]));
// One sampled shoreline drives both rendering and movement checks.
function puddle(x,y,width,height,phase){
 const points=Array.from({length:48},(_,i)=>{
  const angle=i/48*Math.PI*2;
  const radius=.9+.075*Math.sin(angle*3+phase)+.025*Math.cos(angle*5-phase);
  return {x:x+width/2+Math.cos(angle)*width/2*radius,y:y+height/2+Math.sin(angle)*height/2*radius};
 });
 return {x,y,width,height,points};
}
export const STAGES=[
 {id:'forest',name:'Living Forest',target:20,crowdAnchors:forestAnchors,obstacles:[],mud:[],spawn:{x:480,y:380},palette:{wash:0x7adca7,accent:0xc8f68c},flowSpawns:[{x:410,y:290},{x:650,y:440}]},
 {id:'neon',name:'Neon Grove',target:25,crowdAnchors:festivalAnchors.slice(0,14),obstacles:[{x:285,y:280,width:90,height:65},{x:655,y:340,width:90,height:65}],mud:[],spawn:{x:480,y:400},palette:{wash:0x9759e2,accent:0x95e8ff},flowSpawns:[{x:480,y:240},{x:770,y:440}]},
 {id:'sunrise',name:'Sunrise Clearing',target:30,crowdAnchors:festivalAnchors,obstacles:[{x:265,y:280,width:60,height:65},{x:335,y:325,width:60,height:65},{x:655,y:315,width:60,height:65}],mud:[puddle(305,470,140,84,.4),puddle(680,190,120,90,2.1)],spawn:{x:480,y:410},palette:{wash:0xef9879,accent:0xffdd97},flowSpawns:[{x:400,y:240},{x:740,y:420}]},
];
