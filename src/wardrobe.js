export const WARDROBE = {
 onesie:[{id:'lime',name:'Forest Lime'},{id:'moth',name:'Purple Moth'},{id:'rainbow',name:'Rainbow'}],
 hat:[{id:'bucket',name:'Bucket Hat'},{id:'wizard',name:'Wizard Hat'},{id:'none',name:'No Hat'}],
 totem:[{id:'star',name:'Star Totem'},{id:'mushroom',name:'Mushroom Totem'},{id:'none',name:'No Totem'}],
};
export const DEFAULT_OUTFIT={onesie:'lime',hat:'bucket',totem:'none'};
export function normalizeOutfit(value){return Object.fromEntries(Object.entries(WARDROBE).map(([key,options])=>[key,options.some(o=>o.id===value?.[key])?value[key]:DEFAULT_OUTFIT[key]]));}
