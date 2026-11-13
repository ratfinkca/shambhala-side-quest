const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function renderCollisionPractice(root,{choices=[]}={}){
 root.classList.add('collision-lab');
 Object.assign(root.dataset,{playing:'false',paused:'true',hand:'left',control:'stick'});
 root.innerHTML=`
  <section class="collision-arena" aria-label="Crowd practice dancefloor">
   <div id="game" tabindex="0" role="application" aria-label="Crowd practice. Touch anywhere to steer with the thumbstick. Push farther to sprint. WASD or arrows also move. B activates Bass Head. Escape pauses."></div>
   <button id="bass-head" class="bass-control" hidden disabled aria-keyshortcuts="B" aria-label="Bass Head"><span class="bass-control-icon" aria-hidden="true">ϟ</span><span class="bass-control-name" aria-hidden="true">Bass Head</span><span class="bass-control-detail" aria-hidden="true">0%</span></button>
  </section>
  <header class="collision-hud" aria-label="Practice status">
   <div class="collision-location"><span class="collision-eyebrow">Practice · nothing saved</span><strong id="collision-venue-name">Fractal Forest</strong><span id="collision-mode-name">Mixed crowd</span></div>
   <div class="collision-timer"><span>Time left</span><strong id="collision-time">Ready</strong></div>
   <nav class="collision-actions" aria-label="Practice controls"><button id="collision-pause" class="quiet-button" aria-keyshortcuts="Escape" disabled>Pause</button><button id="collision-settings" class="quiet-button">Settings</button></nav>
   <div class="collision-scores"><span>Points <strong id="collision-score">0</strong></span><span>Passes <strong id="collision-passes">0</strong></span><span>Contacts <strong id="collision-contacts">0</strong></span><span>Friends <strong id="collision-friends">0</strong></span></div>
  </header>
  <section id="collision-menu" class="collision-menu" aria-labelledby="collision-title">
   <div class="collision-card">
    <span class="collision-eyebrow">A little room to dance</span>
    <h1 id="collision-title">Meet the crowd</h1>
    <p class="collision-intro">Every floor has a mix of personal space. Smooth-pass the same dancer four times to make a friend you can move straight through.</p>
    <p id="collision-note" class="collision-note" role="status">Choose your feel, then start a fresh practice.</p>
    <div class="collision-menu-actions"><button id="collision-start" class="primary-button">Start fresh</button><button id="collision-resume" class="quiet-button" hidden>Resume</button></div>
    <fieldset class="collision-options"><legend>Crowd feel</legend>
     <label class="collision-field" for="collision-mode"><span>Make contact</span><select id="collision-mode"><option value="off">Off · move through</option><option value="mixed" selected>Mixed personal space</option></select></label>
     <label class="collision-field" for="collision-venue"><span>Dancefloor</span><select id="collision-venue">${choices.map(choice=>`<option value="${escapeHTML(choice.id)}"${choice.id==='smf-fractal'?' selected':''}>${escapeHTML(choice.label??choice.name??choice.id)}</option>`).join('')}</select></label>
     <label class="collision-field collision-wide" for="collision-radius"><span>Personal-space baseline <output id="collision-radius-value" for="collision-radius">26</output></span><input id="collision-radius" type="range" min="20" max="32" step="1" value="26" aria-describedby="collision-radius-hint"><span id="collision-radius-hint" class="collision-range-hint"><span>Gentle</span><span>Larger</span></span></label>
     <label class="collision-field collision-wide" for="collision-density"><span>Crowd size</span><select id="collision-density"><option value="0">Original crowd</option><option value="6">Busy · 6 more dancers</option><option value="12">Packed · 12 more dancers</option></select></label>
     <p class="collision-help collision-wide collision-types"><span>● Small</span><span>● Medium</span><span>● Large</span> · same smooth-pass boundary</p>
     <label class="collision-toggle"><input id="collision-boxes" type="checkbox"><span>Show contact / pass circles</span></label>
     <label class="collision-toggle"><input id="collision-emotes" type="checkbox" checked><span>Dancer reactions</span></label>
     <p class="collision-help collision-wide">Each clean pass shrinks that dancer’s ring. Four dots become a heart: you’re friends. Bumps don’t undo progress. Friends reset each round. Changing the crowd or dancefloor starts fresh.</p>
    </fieldset>
    <fieldset class="collision-options"><legend>Your moves</legend>
     <label class="collision-field" for="collision-control"><span>Move with</span><select id="collision-control"><option value="tap">Tap / click</option><option value="swipe">Swipe bursts</option><option value="stick" selected>Thumbstick</option></select></label>
     <label class="collision-field" for="collision-hand"><span>Steering hand</span><select id="collision-hand"><option value="left" selected>Left</option><option value="right">Right</option></select></label>
     <label class="collision-field collision-wide" for="collision-sensitivity"><span>Gesture sensitivity</span><input id="collision-sensitivity" type="range" min="0.6" max="1.6" step="0.05" value="1" aria-describedby="collision-sensitivity-hint"><span id="collision-sensitivity-hint" class="collision-help">Higher needs less finger movement.</span></label>
     <label class="collision-toggle"><input id="collision-sound" type="checkbox"><span>Sound</span></label>
     <p class="collision-help collision-wide">WASD / arrows also move. Shift sprints. B activates Bass Head. Escape pauses.</p>
    </fieldset>
    <footer class="collision-footer">Practice only. Nothing is saved or sent: no scores, progress or playtest data.<a href="./?rehearsal&tour">Back to festival practice</a></footer>
   </div>
  </section>`;
}
