import {renderPlayerSetup,renderChallengePicker,hasChallenge} from './player-setup-view.js';
import {displayNameFor} from '../supabase/functions/_shared/player-name.js';
import {normalizeChallenge,CHALLENGES} from '../supabase/functions/_shared/challenges.js';
import {GENERIC_RULES} from '../supabase/functions/_shared/edition-rules.js';
import {renderRecovery} from './recovery-view.js';
import {renderResults} from './results-view.js';
import {requirement} from './progression.js';
import {renderPassport,renderReward,renderEndlessRewards} from './progression-view.js';
import {SCORING_VERSION,SCORING_VERSIONS,SCORING_SEASONS,runScoringVersion} from './online/version.js';
import {scoreSeason} from './profile.js';
import {renderOnlineBoard} from './online/view.js';
import {renderPlaytestConsent} from './playtest/view.js';
import {renderTitle,renderFestivalStyles,renderPerks,renderEndlessPerks} from './theme-screens.js';
import { WARDROBE } from './wardrobe.js';
import {renderCharacterControls} from './character-view.js';
import { PERKS } from './run.js';
import {renderControlSettings,controlSettingValue} from './control-settings-view.js';
import {renderHowToPlay} from './how-to-play.js';
export const createScreenState = () => ({name:'title',returnTo:'title'});
export function transition(s,event) {
  const type=event.type;
  if(type==='START'&&['title','rules'].includes(s.name))return {...s,name:'playing'};
  if(type==='RULES'&&s.name==='title')return {...s,name:'rules'};
  if(type==='HELP'&&s.name==='title')return {name:'help',returnTo:'title'};
  if(['PAUSE','HIDDEN'].includes(type)&&s.name==='playing')return {...s,name:'paused'};
  if(type==='RESUME'&&s.name==='paused')return {...s,name:'playing'};
  if(type==='SETTINGS'&&['title','paused','playing'].includes(s.name))return {name:'settings',returnTo:s.name==='title'?'title':'paused'};
  if(type==='BACK'&&['settings','wardrobe','scores','style','help'].includes(s.name))return {name:s.returnTo,returnTo:'title'};
  if(type==='STYLE'&&s.name==='title')return {name:'style',returnTo:'title'};
  if(type==='WARDROBE'&&['title','paused'].includes(s.name))return {name:'wardrobe',returnTo:s.name};
  if(type==='SCORES'&&['title','results'].includes(s.name))return {name:'scores',returnTo:s.name};
  if(type==='END'&&s.name==='playing')return {...s,name:event.qualified?'summary':'results'};
  if(type==='UPGRADE'&&s.name==='summary')return {...s,name:'upgrade'};
  if(type==='CHOOSE'&&s.name==='upgrade')return {...s,name:'rules'};
  if(type==='EXIT'&&['paused','rules','summary','upgrade'].includes(s.name))return {...s,name:'confirmExit',returnTo:s.name};
  if(type==='FINISH'&&s.name==='confirmExit')return {...s,name:'results'};
  if(type==='LEAVE'&&s.name==='results')return {...s,name:'confirmLeave',destination:event.destination};
  if(type==='LEAVE_CONFIRMED'&&s.name==='confirmLeave')return {...s,name:'results'};
  if(type==='CANCEL'&&s.name==='confirmLeave')return {...s,name:'results'};
  if(type==='CANCEL'&&s.name==='confirmExit')return {...s,name:s.returnTo};
  if(type==='CONFIRM'&&s.name==='confirmExit'||type==='TITLE'&&s.name==='results')return createScreenState();
  if(type==='REPLAY'&&s.name==='results')return {...s,name:'rules'};
  return s;
}
const button=(action,text,primary=false)=>`<button type="button" class="${primary?'primary-button':'menu-button'}" data-action="${action}">${text}</button>`;
function ruleTips(run){
  const perks=run?.perks??[];
  const current=!run||runScoringVersion(run)===SCORING_VERSION;
  const tips=[
    '<p><strong>Flow and points.</strong> Golden Flow pickups attract nearby sparks. Bass drops double all points.</p>',
    current?`<p><strong>Friendship.</strong> Dancers have different personal-space sizes. Bumps block and slow you. ${hasChallenge(run?.scoringVersion)?CHALLENGES[normalizeChallenge(run.challenge)].friendPasses:4} smooth passes with one dancer earn a heart and let you move through them until the next stage.</p>`:'<p><strong>Original season.</strong> Bumps slow you. Dancers let you move through them.</p>',
    `<p><strong>Bass pressure.</strong> Speakers block your path. About ${perks.includes('battery')?'6.7':'10'} seconds near them fully charges Bass Head. Spending your charge gives 1.5 to 6 seconds of protection and doubles spark points when you and the spark are in the bass zone. Mud and bumps still slow you.</p>`,
    `<p><strong>Mystery candy.</strong> Optional candy gives ${perks.includes('sweet')?'seven':'five'} seconds of super speed, reversed controls or wavy colours. Flow leaves candy alone.</p>`,
  ];
  if(run?.mode==='endless')tips.push('<p><strong>Endless.</strong> Missing a target ends the run. Later loops change the speaker, mud and crowd layouts. Equip up to four perks and swap them between stages. Completed stages save XP. Runs can resume paused from the last checkpoint on this browser when storage is available. Optional online posting needs a connection at the start and a finished run posted within 24 hours.</p>');
  return tips;
}
export function createScreens(root,callbacks) {
  const content=root.querySelector('#menu-content');
  root.addEventListener('error',e=>{if(e.target.tagName==='IMG'){e.target.hidden=true;e.target.parentElement.classList.add('asset-error');}},true);
  root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled)callbacks.action(b.dataset.action,b.dataset.value)});
  root.addEventListener('input',e=>{if(e.target.matches('input[data-control-setting]'))callbacks.controls?.(e.target.dataset.controlSetting,controlSettingValue(e.target.dataset.controlSetting,e.target.value));if(e.target.matches('[data-volume]'))callbacks.volume(e.target.dataset.volume,Number(e.target.value)/100);if(e.target.id==='initials'){if(!e.target.hasAttribute('data-rave-name'))e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);callbacks.initials?.(e.target.value)}});
  root.addEventListener('change',e=>{if(e.target.matches('select[data-control-setting]'))callbacks.controls?.(e.target.dataset.controlSetting,e.target.value);if(e.target.matches('[data-outfit]'))callbacks.outfit(e.target.dataset.outfit,e.target.value);if(e.target.matches('[data-appearance]'))callbacks.appearance?.(e.target.dataset.appearance,e.target.value)});
  return {
    show(name,data={}) {
      root.hidden=name==='playing';root.dataset.screen=name;
      if(name==='playing')return;
      const profile=data.profile;
      const selectedSeason=SCORING_VERSIONS.includes(data.scoreSeason)?data.scoreSeason:SCORING_VERSION;
      const seasonLabel=version=>SCORING_SEASONS.find(season=>season.id===version)?.label??'Original season';
      const canFinish=data.run?.mode==='endless'&&data.run.scoreStages.length>0;
      const exitLabel=canFinish?'Finish run & save score':'Return to title';
      const header=(eyebrow,title,copy='')=>`${eyebrow?`<p class="menu-eyebrow">${eyebrow}</p>`:''}<h2>${title}</h2>${copy?`<p class="menu-copy">${copy}</p>`:''}`;
      let html='';
      if(['recovery','discardRecovery','recoveryInvalid','recoveryBusy'].includes(name))html=renderRecovery(name,data.recovery);
      if(name==='title')html=renderTitle(data.themeId,profile.playtestConsent,data.playtestAvailable,undefined,profile.challengePreference);
      if(name==='style')html=renderFestivalStyles(profile);
      if(name==='wardrobe')html=header('YOUR FOREST ALTER EGO','Character','Choose your look, then dress for the dancefloor.')+`<p id="outfit-feedback" role="status"></p>`+renderPlayerSetup(profile)+renderCharacterControls(profile.outfit)+`<h3>Clothes & accessories</h3>`+Object.entries(WARDROBE).map(([key,options])=>`<label class="setting-row">${key==='onesie'?'Onesie':key==='hat'?'Hat':key==='flair'?'Flourish':'Totem'}<select data-outfit="${key}" aria-label="${key}">${options.map(o=>`<option value="${o.id}" ${requirement(profile.progress,`${key}:${o.id}`)?'disabled':''} ${profile.outfit[key]===o.id?'selected':''}>${o.name}${requirement(profile.progress,`${key}:${o.id}`)?' · Locked':''}</option>`).join('')}</select></label>`).join('')+button('back','Back to title',true);
      if(name==='wardrobe')html+=renderEndlessRewards(profile.progress)+renderPassport(profile.progress)+`<details class="unlock-list"><summary>How to unlock wardrobe pieces</summary><ul>${Object.entries(WARDROBE).flatMap(([key,options])=>options.map(o=>{const need=requirement(profile.progress,`${key}:${o.id}`);return need?`<li><strong>${o.name}</strong> · ${need} <button class="menu-button" data-action="preview-outfit" data-value="${key}:${o.id}">Preview ${o.name}</button></li>`:''})).join('')}</ul></details>`;
      if(name==='settings')html=header('FIND YOUR FREQUENCY','Sound & settings','Your choices save on this device.')+renderControlSettings(data.controls)+`<button class="menu-button" data-action="mute" aria-pressed="${profile.audio.enabled}">${profile.audio.enabled?'Sound on':'Sound muted'}</button>`+['music','effects'].map(key=>`<label class="setting-row" for="volume-${key}">${key==='music'?'Music':'Sound effects'} <output id="value-${key}">${Math.round(profile.audio[key]*100)}%</output><input id="volume-${key}" data-volume="${key}" type="range" min="0" max="100" value="${Math.round(profile.audio[key]*100)}"></label>`).join('')+`<p class="menu-footnote">Reduced motion follows your device preference.</p>`+button('back',data.returnTo==='paused'?'Back to pause':'Back to title',true);
      if(name==='help')html=header('','How to play','Collect sparks before time runs out.')+renderHowToPlay({controls:data.controls,tips:[
        '<p><strong>Festival Run</strong> takes you through '+GENERIC_RULES.mainStageIds.length+' stages. <strong>Quick Rush</strong> is one minute. <strong>Endless Festival</strong> keeps going while you clear each target.</p>',
        ...ruleTips(),
      ]})+button('back','Back to title',true);
      if(name==='rules'){
        const {run,stage,controls}=data;
        const endless=run.mode==='endless',rush=run.mode==='rush';
        const eyebrow=rush?'ONE MINUTE, ALL GOOD VIBES':endless?`ENDLESS · STAGE ${run.stageIndex+1} · LOOP ${stage.loop}`:`STAGE ${run.stageIndex+1} OF ${GENERIC_RULES.mainStageIds.length}`;
        const title=stage.name+(endless&&stage.variationId!=='original'&&stage.variationName?' · '+stage.variationName:'');
        const objective=rush?'Chase your best score in 60 seconds.':`Collect ${stage.target} sparks in 60 seconds to ${endless?'keep the festival going':run.stageIndex===GENERIC_RULES.mainStageIds.length-1?'complete your night':'earn your encore'}.`;
        html=header(eyebrow,title,objective);
        if(hasChallenge(run.scoringVersion))html+=`<p class="menu-footnote">${CHALLENGES[normalizeChallenge(run.challenge)].name} · ${CHALLENGES[normalizeChallenge(run.challenge)].friendPasses} passes to friendship</p>`;
        if(stage.variationDescription)html+=`<p class="menu-copy">${stage.variationDescription}</p>`;
        if(run.perks.length)html+=`<p class="menu-copy">${run.perks.map(p=>PERKS[p].name).join(' · ')}</p>`;
        const startAction=button('start',run.stageIndex?'Next stage ↗':'Enter the forest ↗',true);
        html+=renderHowToPlay({controls,tips:ruleTips(run),startAction})+button('exit',exitLabel);
      }
      if(name==='paused')html=header('TAKE A BREATHER','Your flow can wait.','The clock, crowd and music are paused.')+`<div class="menu-actions">${button('resume','Back to the forest ↗',true)}${button('settings','Sound & settings')}${button('wardrobe','Character')}${button('exit',exitLabel)}</div>`;
      if(name==='confirmExit')html=canFinish?header('YOUR NIGHT, YOUR CALL','Finish and bank your score?',`${data.run.stagesCleared} completed stage${data.run.stagesCleared===1?'':'s'} · ${data.run.totalScore} points. Any unfinished stage is excluded. Next: choose local saving or public posting.`)+button('confirm','Continue to save score',true)+button('cancel','Keep playing'):header('LEAVING SO SOON?','End this run?','No score will be saved. Only fully completed stages can be banked. XP already awarded stays saved.')+button('cancel','Keep my run',true)+button('confirm','End run & return to title');
      if(name==='confirmLeave')html=header('BEFORE YOU GO','Leave without saving?', 'This score has not been saved on this device or posted online. Leaving will discard it. Your earned XP stays saved.')+button('cancel','Back to save score',true)+button('leave-confirm','Leave without saving');
      if(name==='summary')html=header('YOU EARNED YOUR ENCORE','Keep the night going.',`${data.summary.pickups} / ${data.summary.target} sparks · ${data.summary.score} stage points`)+`<p class="result-total">${data.run.totalScore}<small>total vibes</small></p>`+button('upgrade','Choose your next upgrade ↗',true)+button('exit',exitLabel);
      if(name==='upgrade')html=(data.run.mode==='endless'?renderEndlessPerks(data.choices,data.themeId,data.run):renderPerks(data.choices,data.themeId))+(canFinish?button('exit',exitLabel):'');
      if(name==='results')html=`<p class="menu-footnote">${seasonLabel(runScoringVersion(data.run))}</p>`+renderResults(data);
      if(name==='scores')html=header('THE ONE MORE CROWD','Arcade scores','Your next personal best belongs here.')+`<nav class="menu-actions horizontal" aria-label="Score season">${SCORING_SEASONS.map(season=>`<button class="menu-button" data-action="score-season" data-value="${season.id}" aria-pressed="${selectedSeason===season.id}">${season.label}</button>`).join('')}</nav><p class="menu-footnote">${seasonLabel(selectedSeason)} · local and online rankings</p>`+(hasChallenge(selectedSeason)?renderChallengePicker(data.boardChallenge,{action:'board-challenge',label:'Leaderboard challenge'}):'')+(data.onlineBoard?renderOnlineBoard(data.onlineBoard):'')+`<h3>On this device</h3><p class="menu-footnote">Local scores stay separate from the online board.</p><div class="score-boards">${['rush','festival','endless'].map(mode=>`<section><h3>${mode==='rush'?'Quick Rush':mode==='endless'?'Endless Festival':'Festival Run'}</h3><ol id="board-${mode}" class="score-list"></ol></section>`).join('')}</div>`+button('back','Back',true);
      if(name==='results')html+=renderReward(data.progressReward);
      if(['summary','results'].includes(name))html+=(name==='summary'?renderReward(data.progressReward):'')+renderPassport(profile.progress);
      if(name==='settings')html+=renderPlaytestConsent(profile.playtestConsent,!!data.playtestAvailable);
      content.innerHTML=html;
      if(name==='scores')for(const mode of ['rush','festival','endless']){
        const list=content.querySelector(`#board-${mode}`),entries=profile.boards[mode].filter(entry=>scoreSeason(entry)===selectedSeason&&(!hasChallenge(selectedSeason)||normalizeChallenge(entry.challenge)===normalizeChallenge(data.boardChallenge)));
        if(!entries.length){const li=document.createElement('li');li.textContent='Your first adventure goes here.';list.append(li)}
        entries.forEach(e=>{const li=document.createElement('li'),initials=document.createElement('strong'),detail=document.createElement('span');initials.textContent=displayNameFor(e);detail.textContent=`${e.score} vibes${mode==='endless'?` · ${e.stagesCleared} stages cleared`:mode==='festival'?` · ${e.stagesCleared}/${GENERIC_RULES.mainStageIds.length}`:''}`;li.append(initials,detail);li.title=`${e.outfit.onesie} · ${e.outfit.hat} · ${e.outfit.totem}`;list.append(li)});
      }
      content.scrollTop=0;root.scrollTop=0;root.parentElement.scrollTop=0;
      requestAnimationFrame(()=>content.querySelector('button:not(:disabled),select:not(:disabled),input:not(:disabled)')?.focus({preventScroll:true}));
    },
  };
}
