export const THEME_DEFAULT='forest-freakout';
const base=typeof import.meta.env==='object'?import.meta.env.BASE_URL:'./';
const art=(name,theme='forest-freakout')=>`${base}themes/${theme}/${name}.webp`;
const moon=name=>art(name,'moonlit-mycelium');
const neon=name=>art(name,'neon-field-trip');
export const THEMES=[
 {id:THEME_DEFAULT,name:'Forest Freakout',ready:true,description:'Warm lanterns. Weird little creatures. One wild forest.',preview:art('title'),backdrop:art('backdrop'),perks:{boots:art('boots'),moth:art('moth'),noodle:art('noodle'),bracelet:art('bracelet')}},
 {id:'moonlit-mycelium',name:'Moonlit Mycelium',ready:true,description:'Moonlight, little wonders and luminous woodland magic.',preview:moon('title'),backdrop:moon('backdrop'),perks:{boots:moon('boots'),moth:moon('moth'),noodle:moon('noodle'),bracelet:moon('bracelet')}},
 {id:'neon-field-trip',name:'Neon Field Trip',ready:true,description:'Bold rave stickers and electric colour.',preview:neon('title'),backdrop:neon('backdrop'),perks:{boots:neon('boots'),moth:neon('moth'),noodle:neon('noodle'),bracelet:neon('bracelet')}},
];
export function isThemePreference(value){return value==='surprise'||THEMES.some(t=>t.ready&&t.id===value);}
export function normalizeThemePreference(value){return isThemePreference(value)?value:THEME_DEFAULT;}
export function resolveTheme(preference,rng=Math.random,registry=THEMES){
 const available=registry.filter(t=>t.ready);
 if(preference==='surprise')return available[Math.min(available.length-1,Math.max(0,Math.floor(rng()*available.length)))]?.id??THEME_DEFAULT;
 return available.find(t=>t.id===preference)?.id??THEME_DEFAULT;
}
export function getTheme(id){return THEMES.find(t=>t.ready&&t.id===id)??THEMES[0];}
