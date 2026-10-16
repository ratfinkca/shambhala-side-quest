import {getTheme} from './themes.js';
export function applyTheme(id){
 const theme=getTheme(id);
 document.documentElement.dataset.theme=theme.id;
 document.documentElement.style.setProperty('--theme-backdrop',`url("${theme.backdrop}")`);
 let preload=document.querySelector('#theme-title-preload');
 if(!preload){preload=document.createElement('link');preload.id='theme-title-preload';preload.rel='preload';preload.as='image';document.head.append(preload);}
 preload.href=theme.preview;
 const mark=document.querySelector('.brand-mark');
 if(mark)mark.src=theme.perks.moth;
 return theme.id;
}
