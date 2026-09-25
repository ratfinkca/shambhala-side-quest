import { WARDROBE } from './wardrobe.js';
import { PERKS } from './run.js';
export const createScreenState = () => ({name:'title',returnTo:'title'});
export function transition(s,event) {
  const type=event.type;
  if(type==='START'&&['title','rules'].includes(s.name))return {...s,name:'playing'};
  if(type==='RULES'&&s.name==='title')return {...s,name:'rules'};
  if(['PAUSE','HIDDEN'].includes(type)&&s.name==='playing')return {...s,name:'paused'};
  if(type==='RESUME'&&s.name==='paused')return {...s,name:'playing'};
  if(type==='SETTINGS'&&['title','paused','playing'].includes(s.name))return {name:'settings',returnTo:s.name==='title'?'title':'paused'};
  if(type==='BACK'&&['settings','wardrobe','scores'].includes(s.name))return {name:s.returnTo,returnTo:'title'};
  if(type==='WARDROBE'&&s.name==='title')return {name:'wardrobe',returnTo:'title'};
  if(type==='SCORES'&&['title','results'].includes(s.name))return {name:'scores',returnTo:s.name};
  if(type==='END'&&s.name==='playing')return {...s,name:event.qualified?'summary':'results'};
  if(type==='UPGRADE'&&s.name==='summary')return {...s,name:'upgrade'};
  if(type==='CHOOSE'&&s.name==='upgrade')return {...s,name:'rules'};
  if(type==='EXIT'&&['paused','rules','summary','upgrade'].includes(s.name))return {...s,name:'confirmExit',returnTo:s.name};
  if(type==='CANCEL'&&s.name==='confirmExit')return {...s,name:s.returnTo};
  if(type==='CONFIRM'&&s.name==='confirmExit'||type==='TITLE'&&s.name==='results')return createScreenState();
  if(type==='REPLAY'&&s.name==='results')return {...s,name:'rules'};
  return s;
}
const button=(action,text,primary=false)=>`<button type="button" class="${primary?'primary-button':'menu-button'}" data-action="${action}">${text}</button>`;
export function createScreens(root,callbacks) {
  const content=root.querySelector('#menu-content');
  root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled)callbacks.action(b.dataset.action,b.dataset.value)});
  root.addEventListener('input',e=>{if(e.target.matches('[data-volume]'))callbacks.volume(e.target.dataset.volume,Number(e.target.value)/100);if(e.target.id==='initials')e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3)});
  root.addEventListener('change',e=>{if(e.target.matches('[data-outfit]'))callbacks.outfit(e.target.dataset.outfit,e.target.value)});
  return {
    show(name,data={}) {
      root.hidden=name==='playing';root.dataset.screen=name;
      if(name==='playing')return;
      const profile=data.profile;
      const header=(eyebrow,title,copy='')=>`<p class="menu-eyebrow">${eyebrow}</p><h2>${title}</h2>${copy?`<p class="menu-copy">${copy}</p>`:''}`;
      let html='';
      if(name==='title')html=header('SHAMBHALA SIDE QUEST','A little lost.<br><em>A lot of good vibes.</em>','Your outfit. Your rhythm. One more stage.')+`<div class="menu-actions">${button('rush','Quick Rush · 60 seconds',true)}${button('festival','Festival Run · 3 stages')}${button('wardrobe','Dress your raver')}${button('settings','Sound & settings')}${button('scores','Local arcade scores')}</div><p class="menu-footnote">WASD / arrows · mouse · touch<br>Unofficial fan game · No accounts needed</p>`;
      if(name==='wardrobe')html=header('YOUR FOREST ALTER EGO','Make it your own.','All starter fits are yours. Appearance never changes your abilities.')+Object.entries(WARDROBE).map(([key,options])=>`<label class="setting-row">${key==='onesie'?'Onesie':key==='hat'?'Hat':'Totem'}<select data-outfit="${key}" aria-label="${key}">${options.map(o=>`<option value="${o.id}" ${profile.outfit[key]===o.id?'selected':''}>${o.name}</option>`).join('')}</select></label>`).join('')+button('back','Back to title',true);
      if(name==='settings')html=header('FIND YOUR FREQUENCY','Sound & settings','Your choices save on this device.')+`<button class="menu-button" data-action="mute" aria-pressed="${profile.audio.enabled}">${profile.audio.enabled?'Sound on':'Sound muted'}</button>`+['music','effects'].map(key=>`<label class="setting-row" for="volume-${key}">${key==='music'?'Music':'Sound effects'} <output id="value-${key}">${Math.round(profile.audio[key]*100)}%</output><input id="volume-${key}" data-volume="${key}" type="range" min="0" max="100" value="${Math.round(profile.audio[key]*100)}"></label>`).join('')+`<p class="menu-footnote">Reduced motion follows your device preference.</p>`+button('back',data.returnTo==='paused'?'Back to pause':'Back to title',true);
      if(name==='rules')html=header(data.run.mode==='rush'?'ONE MINUTE, ALL GOOD VIBES':`STAGE ${data.run.stageIndex+1} OF 3`,data.stage.name,data.run.mode==='rush'?'Chase your best score in 60 seconds.':`Collect ${data.stage.target} sparks in 60 seconds to ${data.run.stageIndex===2?'complete your night':'earn your encore'}.`)+`<div class="rule-grid"><p>✦ Catch sparks quickly to build combos.</p><p>◇ Golden Flow pickups attract nearby sparks.</p><p>◎ Skim dancers for bonus points. Bumps slow you.</p><p>▣ Speakers block your path. Mud slows your steps.</p></div><p class="menu-copy">${data.run.perks.map(p=>PERKS[p].name).join(' · ')||'Bass drops double all points.'}</p>`+button('start',data.run.stageIndex?'Next stage ↗':'Enter the forest ↗',true)+button('exit','Return to title');
      if(name==='paused')html=header('TAKE A BREATHER','Your flow can wait.','The clock, crowd and music are paused.')+`<div class="menu-actions">${button('resume','Back to the forest ↗',true)}${button('settings','Sound & settings')}${button('exit','Return to title')}</div>`;
      if(name==='confirmExit')html=header('LEAVING SO SOON?','End this run?','Your unfinished run will be discarded. Your saved scores and outfit stay.')+button('cancel','Keep my run',true)+button('confirm','End run & return to title');
      if(name==='summary')html=header('YOU EARNED YOUR ENCORE','Keep the night going.',`${data.summary.pickups} / ${data.summary.target} sparks · ${data.summary.score} stage points`)+`<p class="result-total">${data.run.totalScore}<small>total vibes</small></p>`+button('upgrade','Choose your next upgrade ↗',true)+button('exit','End run');
      if(name==='upgrade')html=header('A LITTLE FESTIVAL MAGIC','Choose your upgrade.','Your pick lasts for the rest of this run.')+`<div class="perk-options">${data.choices.map(id=>`<button class="perk-card" data-action="choose" data-value="${id}"><span>${PERKS[id].icon}</span><strong>${PERKS[id].name}</strong><small>${PERKS[id].description}</small></button>`).join('')}</div>`;
      if(name==='results')html=header(data.run.mode==='festival'&&data.run.stagesCleared===3?'YOU MADE IT TO SUNRISE':'THAT WAS A GOOD WANDER',data.run.mode==='festival'&&data.run.stagesCleared===3?'What a night.':'Same time, same forest?',data.run.mode==='festival'?`${data.run.stagesCleared} / 3 stages cleared · Last stage: ${data.summary.pickups} / ${data.summary.target} sparks`:'A minute well wasted.')+`<p class="result-total">${data.run.totalScore}<small>good vibes${data.run.mode==='rush'?` · personal best ${profile.bestRush}`:''}</small></p><div class="score-entry"><label for="initials">Your arcade initials</label><input id="initials" maxlength="3" pattern="[A-Z0-9]{3}" value="AAA" autocomplete="off" aria-describedby="score-note"><button class="menu-button" data-action="submit" ${data.run.submitted?'disabled':''}>${data.run.submitted?'Entry submitted':'Save score'}</button><small id="score-note">Saved on this device · optional</small></div><p id="save-feedback" role="status"></p><div class="menu-actions horizontal">${button('replay','One more run ↗',true)}${button('scores','View scores')}${button('title','Title screen')}</div>`;
      if(name==='scores')html=header('THE ONE MORE CROWD','Local arcade scores','Saved on this device. Quick Rush and Festival Run have separate boards.')+`<div class="score-boards">${['rush','festival'].map(mode=>`<section><h3>${mode==='rush'?'Quick Rush':'Festival Run'}</h3><ol id="board-${mode}" class="score-list"></ol></section>`).join('')}</div>`+button('back','Back',true);
      content.innerHTML=html;
      if(name==='scores')for(const mode of ['rush','festival']){
        const list=content.querySelector(`#board-${mode}`),entries=profile.boards[mode];
        if(!entries.length){const li=document.createElement('li');li.textContent='Your first adventure goes here.';list.append(li)}
        entries.forEach(e=>{const li=document.createElement('li'),initials=document.createElement('strong'),detail=document.createElement('span');initials.textContent=e.initials;detail.textContent=`${e.score} vibes${mode==='festival'?` · ${e.stagesCleared}/3`:''}`;li.append(initials,detail);li.title=`${e.outfit.onesie} · ${e.outfit.hat} · ${e.outfit.totem}`;list.append(li)});
      }
      content.scrollTop=0;
      requestAnimationFrame(()=>content.querySelector('button:not(:disabled),select:not(:disabled),input:not(:disabled)')?.focus({preventScroll:true}));
    },
  };
}
