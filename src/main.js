import '../styles.css';
import './themes.css';
import './editions/brand.css';
import './pixel-art/ui.css';
import './pixel-art/menus.css';
import './character.css';
import {pixelLabRequested} from './pixel-lab/animation.js';
import {wardrobeFitRequested} from './wardrobe-fit/model.js';
import {startEdition,prismPracticeRequested,collisionPracticeRequested,clockPracticeRequested,venuePracticeRequested,backstagePracticeRequested,bonusPracticeRequested,controlPracticeRequested} from './editions/registry.js';

if(import.meta.env.DEV&&wardrobeFitRequested(import.meta.env,window.location.search)){
 await import('./wardrobe-fit/entry.js');
}else if(import.meta.env.DEV&&pixelLabRequested(import.meta.env,window.location.search)){
 await import('./pixel-lab/entry.js');
}else await startEdition(import.meta.env,{
 ...(import.meta.env.DEV?{prism:()=>import('./prism-practice/entry.js'),collision:()=>import('./collision-practice-entry.js'),controls:()=>import('./control-practice-entry.js'),clock:()=>import('./clock-practice-entry.js'),venues:()=>import('./clock-practice-entry.js'),backstage:()=>import('./amp-delivery-entry.js'),bonus:()=>import('./bonus-practice/entry.js')}:{}),
 ...(import.meta.env.VITE_EDITION==='smf'?{tour:()=>import('./smf-tour/entry.js')}:{game:()=>import('./game-entry.js')}),
 scaffold:async edition=>{
  const [{renderScaffold},{applyTheme}]=await Promise.all([import('./editions/scaffold-view.js'),import('./theme-view.js')]);
  applyTheme('forest-freakout');
  const cleanup=renderScaffold(document.querySelector('.shell'),edition);
  if(import.meta.hot)import.meta.hot.dispose(cleanup);
 },
},{prismPractice:import.meta.env.DEV&&prismPracticeRequested(import.meta.env,window.location.search),collisionPractice:import.meta.env.DEV&&collisionPracticeRequested(import.meta.env,window.location.search),controlPractice:import.meta.env.DEV&&controlPracticeRequested(import.meta.env,window.location.search),bonusPractice:import.meta.env.DEV&&bonusPracticeRequested(import.meta.env,window.location.search),backstagePractice:import.meta.env.DEV&&backstagePracticeRequested(import.meta.env,window.location.search),venuePractice:import.meta.env.DEV&&venuePracticeRequested(import.meta.env,window.location.search),clockPractice:import.meta.env.DEV&&clockPracticeRequested(import.meta.env,window.location.search)});
