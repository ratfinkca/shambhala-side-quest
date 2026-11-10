// Disposable creative sketches. None of these values are ranked tour rules.
const points=items=>items.map(([id,x,y,label])=>({id,x,y,label,radius:32}));
const configs=[
 {id:'rabbit-hole',name:'Rabbit Hole',parent:'Living Room',dj:'Hoola b2b Lioness',activity:'trail',goal:6,
  reward:'Rabbit ears',caption:'Something wonderful got left behind.',
  instruction:'Follow the glowing trail. Find six lost party trinkets.',
  points:points([['key',210,460,'Tiny key'],['heart',340,290,'Velvet heart'],['mushroom',650,300,'Mushroom charm'],['moon',780,470,'Pocket moon'],['record',540,540,'Little record'],['rabbit',280,550,'Lucky rabbit']])},
 {id:'secret-garden',name:'Secret Garden',parent:'Grove',dj:'Footprints',activity:'garden',goal:3,
  reward:'Glow blossom',caption:'Leave this little clearing brighter than you found it.',
  instruction:'Find a glowing seed, then bring it to the circular garden bed.',
  points:points([['seed-1',200,480,'Amber seed'],['seed-2',780,450,'Rose seed'],['seed-3',480,540,'Moon seed']]),bed:{id:'bed',x:480,y:270,radius:38}},
 {id:'ikigai-mori',name:'Ikigai Mori',parent:'Pagoda',dj:'Soup',activity:'greet',goal:5,
  reward:'Lantern totem',caption:'Good company. Small room. Big feeling.',
  instruction:'Smooth-pass five different dancers. Each clean pass lights a lantern.',points:[]},
 {id:'villagio',name:'Villagio',parent:'Village',dj:'Subvert',activity:'putt',goal:2,reward:'Golden Chicken Totem',
  caption:'The least serious country club in the forest.',
  instruction:'Sink both holes in 8 shots to win the Golden Chicken Totem.',points:[]},
];
export const BONUS_VENUES=configs.map(config=>{
 const timingId=`smf-${config.id}-bonus-preview-1`;
 const crowdAnchors=config.activity==='greet'
  ?[[270,335],[480,325],[700,335],[350,495],[610,500],[790,510]]
  :[[350,375],[580,370],[740,390],[330,510],[650,520],[510,460]];
 const stage={id:`smf-${config.id}`,name:config.name,timingId,target:config.goal,
  spawn:{x:480,y:590},playBounds:{minX:60,maxX:900,minY:240,maxY:610},
  crowdAnchors,crowdSpeed:config.activity==='greet'?.3:.4,
  obstacles:[],mud:[],flowSpawns:[],palette:{wash:0x302a51,accent:0xffd69a}};
 return {...config,timingId,stage};
});
export function getBonusVenue(id){
 const config=BONUS_VENUES.find(c=>c.id===id);
 if(!config)throw new Error(`Unknown bonus rehearsal: ${String(id)}`);
 return config;
}
