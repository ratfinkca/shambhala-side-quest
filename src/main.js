import '../styles.css';
import './themes.css';
import './editions/brand.css';
import {startEdition,clockPracticeRequested} from './editions/registry.js';

await startEdition(import.meta.env,{
 ...(import.meta.env.DEV?{clock:()=>import('./clock-practice-entry.js')}:{}),
 game:()=>import('./game-entry.js'),
 scaffold:async edition=>{
  const [{renderScaffold},{applyTheme}]=await Promise.all([import('./editions/scaffold-view.js'),import('./theme-view.js')]);
  applyTheme('forest-freakout');
  const cleanup=renderScaffold(document.querySelector('.shell'),edition);
  if(import.meta.hot)import.meta.hot.dispose(cleanup);
 },
},{clockPractice:import.meta.env.DEV&&clockPracticeRequested(import.meta.env,window.location.search)});
