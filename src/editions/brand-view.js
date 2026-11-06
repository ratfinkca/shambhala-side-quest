import {getTheme} from '../themes.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderBrand(edition,themeId){
 const theme=getTheme(themeId),art=edition.brand.titleArtByTheme[theme.id];
 const base=typeof import.meta.env==='object'?import.meta.env.BASE_URL:'./';
 return `<div class="title-art${art?'':' neutral-title'}"><img src="${escape(art?base+art:theme.backdrop)}" alt="" fetchpriority="high" width="1200" height="1200"><h1 class="${art?'title-fallback':'neutral-wordmark'}">${escape(edition.brand.title)}</h1></div>`;
}
