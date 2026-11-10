import '../styles.css';
import './themes.css';
import './editions/brand.css';
import {startEdition,clockPracticeRequested,venuePracticeRequested,backstagePracticeRequested,bonusPracticeRequested} from './editions/registry.js';

await startEdition(import.meta.env,{
 ...(import.meta.env.DEV?{clock:()=>import('./clock-practice-entry.js'),venues:()=>import('./clock-practice-entry.js'),backstage:()=>import('./amp-delivery-entry.js'),bonus:()=>import('./bonus-practice/entry.js')}:{}),
 ...(import.meta.env.VITE_EDITION==='smf'?{tour:()=>import('./smf-tour/entry.js')}:{game:()=>import('./game-entry.js')}),
 scaffold:async edition=>{
  const [{renderScaffold},{applyTheme}]=await Promise.all([import('./editions/scaffold-view.js'),import('./theme-view.js')]);
  applyTheme('forest-freakout');
  const cleanup=renderScaffold(document.querySelector('.shell'),edition);
  if(import.meta.hot)import.meta.hot.dispose(cleanup);
 },
},{bonusPractice:import.meta.env.DEV&&bonusPracticeRequested(import.meta.env,window.location.search),backstagePractice:import.meta.env.DEV&&backstagePracticeRequested(import.meta.env,window.location.search),venuePractice:import.meta.env.DEV&&venuePracticeRequested(import.meta.env,window.location.search),clockPractice:import.meta.env.DEV&&clockPracticeRequested(import.meta.env,window.location.search)});
