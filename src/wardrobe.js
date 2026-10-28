export const WARDROBE = {
 onesie:[{id:'lime',name:'Forest Lime'},{id:'moth',name:'Purple Moth'},{id:'rainbow',name:'Rainbow'},{id:'tiger',name:'Sunset Tiger'},{id:'frog',name:'Pond Frog'},{id:'cosmic',name:'Cosmic Dreamer'},{id:'bee',name:'Disco Bee'},{id:'skeleton',name:'Glow Bones'},{id:'patchwork',name:'Patchwork Party'}],
 hat:[{id:'bucket',name:'Bucket Hat'},{id:'wizard',name:'Wizard Hat'},{id:'none',name:'No Hat'},{id:'mushroom',name:'Mushroom Cap'},{id:'flower',name:'Flower Crown'},{id:'cat',name:'Cat Ears'},{id:'antenna',name:'Alien Antennae'},{id:'crown',name:'Forest Royalty'},{id:'headphones',name:'Bass Headphones'}],
 totem:[{id:'star',name:'Star Totem'},{id:'mushroom',name:'Mushroom Totem'},{id:'none',name:'No Totem'},{id:'moon',name:'Crescent Moon'},{id:'eye',name:'Cosmic Eye'},{id:'heart',name:'Love Beam'},{id:'peace',name:'Peace Sign'},{id:'jellyfish',name:'Jellyfish Lantern'},{id:'ufo',name:'Take Me Dancing'}],
 flair:[{id:'none',name:'No Flourish'},{id:'fireflies',name:'Firefly Sparkles'},{id:'stardust',name:'Orbiting Stardust'},{id:'prism',name:'Prismatic Aura'}],
};
export const DEFAULT_OUTFIT={onesie:'lime',hat:'bucket',totem:'none',flair:'none'};
export function normalizeOutfit(value){return Object.fromEntries(Object.entries(WARDROBE).map(([key,options])=>[key,options.some(o=>o.id===value?.[key])?value[key]:DEFAULT_OUTFIT[key]]));}
