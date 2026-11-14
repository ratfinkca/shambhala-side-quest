// Device-local character identity is independent of earned clothing. These
// cosmetic choices never belong in score submissions or playtest events.
export const DEFAULT_APPEARANCE=Object.freeze({face:'smile',hair:'bob',skinTone:'light'});
export const CHARACTER_OPTIONS={
 face:[{id:'smile',name:'Easy smile'},{id:'grin',name:'Big grin'},{id:'chill',name:'Chill'}],
 hair:[{id:'bob',name:'Soft bob'},{id:'crop',name:'Short crop'},{id:'curls',name:'Curls'},{id:'locs',name:'Locs'}],
 skinTone:[
  {id:'light',name:'Light peach',color:'#f1bc8c'},
  {id:'fair',name:'Fair rose',color:'#f2cfb4'},
  {id:'medium',name:'Warm medium',color:'#cd8e65'},
  {id:'tan',name:'Golden tan',color:'#b57550'},
  {id:'deep',name:'Deep brown',color:'#925e47'},
  {id:'rich',name:'Rich brown',color:'#634338'},
 ],
};
export const CHARACTER_PRESETS=[
 {id:'meadow',name:'Meadow',appearance:{face:'smile',hair:'bob',skinTone:'light'}},
 {id:'sunbeam',name:'Sunbeam',appearance:{face:'grin',hair:'crop',skinTone:'fair'}},
 {id:'riverstone',name:'Riverstone',appearance:{face:'smile',hair:'curls',skinTone:'medium'}},
 {id:'night-bloom',name:'Night Bloom',appearance:{face:'chill',hair:'locs',skinTone:'rich'}},
];
export function normalizeAppearance(value){
 const source=value!==null&&typeof value==='object'&&!Array.isArray(value)?value:null;
 return Object.fromEntries(Object.entries(CHARACTER_OPTIONS).map(([key,options])=>[key,options.some(option=>option.id===source?.[key])?source[key]:DEFAULT_APPEARANCE[key]]));
}
