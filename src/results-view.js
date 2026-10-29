import {renderSubmission} from './online/view.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function resultsExitState(run,submission){
 if(submission?.status==='pending')return 'pending';
 return run.submitted||submission?.status==='succeeded'?'saved':'unsaved';
}
export function renderResults({run,summary,profile,onlineSubmission,onlineInput='unknown'}){
 const sunrise=run.mode==='festival'&&run.stagesCleared===3;
 const detail=run.mode==='endless'?`${run.stagesCleared} stage${run.stagesCleared===1?'':'s'} cleared${run.endedVoluntarily?' · Completed stages banked. Unfinished-stage points are excluded.':` · Last stage: ${summary.pickups} / ${summary.target} sparks`}`:run.mode==='festival'?`${run.stagesCleared} / 3 stages cleared · Last stage: ${summary.pickups} / ${summary.target} sparks`:'A minute well wasted.';
 const initials=escape(run.initials??onlineSubmission?.initials??run.initialsDraft??'AAA');
 return `<p class="menu-eyebrow">${run.endedVoluntarily?'RUN FINISHED':sunrise?'YOU MADE IT TO SUNRISE':'THAT WAS A GOOD WANDER'}</p><h2>Save your score.</h2><p class="menu-copy">${detail}</p><p class="result-total">${run.totalScore}<small>good vibes${run.mode==='rush'?` · personal best ${profile.bestRush}`:''}</small></p>
 <section class="score-save-panel" aria-label="Save your score"><div class="score-entry"><label for="initials">Your arcade initials</label><input id="initials" maxlength="3" pattern="[A-Z0-9]{3}" value="${initials}" autocomplete="off" aria-describedby="score-note"><button class="primary-button" data-action="submit" ${run.submitted?'disabled':''}>${run.submitted?'Saved on this device':'Save on this device'}</button><small id="score-note">Local saving and public posting are separate choices.</small></div><p id="save-feedback" role="status"></p>${run.mode==='endless'?'<p class="menu-footnote">Stages cleared first · points break ties.</p>':''}${renderSubmission(onlineSubmission,run,onlineInput)}</section>
 <nav class="menu-actions horizontal result-navigation" aria-label="After saving"><button class="menu-button" data-action="replay">One more run ↗</button><button class="menu-button" data-action="scores">View scores</button><button class="menu-button" data-action="title">Title screen</button></nav>`;
}
