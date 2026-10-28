// Device-local progression unlocks cosmetic rewards and run-only perk choices.
const count=value=>Number.isSafeInteger(value)&&value>=0?Math.min(value,1e9):0;
export const RANKS=[{xp:0,name:'Fresh Arrival'},{xp:100,name:'Forest Wanderer'},{xp:300,name:'Dancefloor Regular'},{xp:650,name:'Night Creature'},{xp:1200,name:'Sunrise Soul'},{xp:2000,name:'Forest Legend'}];
export const ACHIEVEMENTS=[
 {id:'sparks',name:'Follow the Glow',description:'Collect 50 sparks across your runs',target:50,reward:'onesie:cosmic'},
 {id:'passes',name:'Smooth Operator',description:'Make 25 clean passes across your runs',target:25,reward:'hat:cat'},
 {id:'stages',name:'Find Your Feet',description:'Clear 3 stages or finish 3 Quick Rush rounds',target:3,reward:'onesie:frog'},
 {id:'flows',name:'In the Flow',description:'Collect 10 Flow pickups',target:10,reward:'totem:jellyfish'},
 {id:'bass',name:'Bass Believer',description:'Activate Bass Head 5 times',target:5,reward:'hat:headphones'},
 {id:'festivals',name:'Made It to Sunrise',description:'Finish all 3 stages of a Festival Run',target:1,reward:'flair:stardust'},
];
export const RANK_REWARDS={'perk:surfer':2,'perk:battery':3,'perk:encore':4,'perk:sweet':5,'onesie:tiger':1,'hat:mushroom':1,'totem:heart':1,'onesie:bee':2,'hat:flower':2,'totem:peace':2,'flair:fireflies':2,'onesie:skeleton':3,'hat:antenna':3,'totem:eye':3,'onesie:patchwork':4,'hat:crown':4,'totem:moon':4,'totem:ufo':5,'flair:prism':5};
export function normalizeProgress(value,legacy=false){
 return {xp:count(value?.xp),legacyWardrobe:value?value.legacyWardrobe===true:legacy,totals:Object.fromEntries(ACHIEVEMENTS.map(a=>[a.id,count(value?.totals?.[a.id])])),receipts:Array.isArray(value?.receipts)?[...new Set(value.receipts.filter(x=>typeof x==='string'&&x.length<150))].slice(-256):[]};
}
export function rankFor(progress){let rank=0;RANKS.forEach((r,i)=>{if(progress.xp>=r.xp)rank=i});return rank;}
export function requirement(progress,key){
 if(key.endsWith(':none'))return null;
 if(progress.legacyWardrobe&&['onesie','hat','totem'].includes(key.split(':')[0]))return null;
 const achievement=ACHIEVEMENTS.find(a=>a.reward===key);
 if(achievement)return progress.totals[achievement.id]>=achievement.target?null:`${achievement.name}: ${progress.totals[achievement.id]} / ${achievement.target}`;
 const rank=RANK_REWARDS[key];
 return rank!==undefined&&rankFor(progress)<rank?`Reach ${RANKS[rank].name} · ${progress.xp} / ${RANKS[rank].xp} XP`:null;
}
export function awardStage(progress,{id,pickups=0,passes=0,flows=0,bass=0,qualified=false,festivalComplete=false}){
 if(typeof id!=='string'||!id||id.length>=150||progress.receipts.includes(id))return {progress,xp:0,rewards:[]};
 const next=structuredClone(progress);
 next.receipts=[...next.receipts,id].slice(-256);
 const gains={sparks:count(pickups),passes:count(passes),flows:count(flows),bass:count(bass),stages:qualified?1:0,festivals:festivalComplete?1:0};
 for(const [key,value] of Object.entries(gains))next.totals[key]=Math.min(1e9,next.totals[key]+value);
 const xp=20+gains.sparks*2+gains.passes*5+(qualified?30:0)+(festivalComplete?100:0);
 next.xp=Math.min(1e9,next.xp+xp);
 const keys=[...Object.keys(RANK_REWARDS),...ACHIEVEMENTS.map(a=>a.reward)];
 return {progress:next,xp,rewards:keys.filter(key=>requirement(progress,key)!==null&&requirement(next,key)===null)};
}

export function availablePerks(progress){
 const starter=progress.legacyWardrobe?['boots','bracelet','noodle','moth']:['boots','bracelet',...(rankFor(progress)>=1?['noodle']:[]),...(rankFor(progress)>=2?['moth']:[])];
 return [...starter,...['surfer','battery','encore','sweet'].filter(id=>rankFor(progress)>=RANK_REWARDS[`perk:${id}`])];
}
