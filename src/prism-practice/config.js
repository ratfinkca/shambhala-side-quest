import {PRISM} from './model.js';

const ANCHORS=[[350,415],[575,380],[550,465],[480,340],[400,400],[630,440],[400,465],[500,425],[310,455],[570,420],[680,465],[455,380]];

// The rehearsal can vary its crowd while the saved Festival visit has one
// stable layout, so crowd recovery retains the same dancer identities.
export function prismStage({preview=false,dancers=9}={}){
 return {id:preview?'smf-prism-party-preview':'smf-prism-party',name:'Prism Party',timingId:'smf-fractal-clock-preview-1',target:0,
  spawn:{...PRISM.spawn},playBounds:{minX:100,maxX:860,minY:240,maxY:610},crowdAnchors:ANCHORS.slice(0,dancers),crowdSpeed:.28,
  obstacles:[],mud:[],flowSpawns:[],palette:{wash:0x383568,accent:0x64f6e3}};
}

export const PRISM_CONFIG={id:'prism-party',name:'Prism Party',activity:'prism',timingId:'smf-fractal-clock-preview-1',goal:3,
 instruction:'Walk up the ramp. Keep moving in the lit floor section. Light all three faces; your progress stays.',stage:prismStage()};
