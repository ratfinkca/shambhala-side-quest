const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function renderControlPractice(root,{choices=[]}={}){
 root.classList.add('control-lab');
 root.dataset.hand='left';
 root.dataset.control='swipe';
 root.innerHTML=`
  <header class="control-heading">
   <div><span class="control-eyebrow">Movement lab · practice only</span><h1>Find your moves</h1></div>
   <a class="quiet-button" href="./?rehearsal&venues">Back to venues</a>
  </header>
  <section class="control-tools" aria-label="Movement comparison settings">
   <label>Controls<select id="control-mode"><option value="swipe">Swipe bursts</option><option value="stick">Thumbstick</option></select></label>
   <label>Venue<select id="control-venue">${choices.map(c=>`<option value="${escapeHtml(c.id)}"${c.id==='smf-fractal'?' selected':''}>${escapeHtml(c.label)}</option>`).join('')}</select></label>
   <label>Steering hand<select id="control-hand"><option value="left">Left</option><option value="right">Right</option></select></label>
   <div class="control-toggles"><label class="control-toggle"><input type="checkbox" id="control-stamina" checked><span>Stamina</span></label><label class="control-toggle"><input type="checkbox" id="control-sound"><span>Sound</span></label></div>
   <div class="control-buttons"><button id="control-start" class="primary-button">Start fresh</button><button id="control-pause" class="quiet-button" disabled>Pause</button></div>
  </section>
  <p id="control-hint" class="control-hint"></p>
  <div class="control-workspace">
   <section class="control-panel" aria-label="Movement practice dance floor">
    <div class="control-arena">
     <div id="game" tabindex="0" role="application" aria-label="Movement practice dance floor. Swipe anywhere and release to move in that screen direction. Tap to brake. Escape pauses."></div>
     <div id="control-floor" aria-hidden="true"></div>
     <button id="bass-head" class="bass-control" hidden disabled aria-label="Bass Head"><span class="bass-control-icon" aria-hidden="true">ϟ</span><span class="bass-control-name" aria-hidden="true">Bass Head</span><span class="bass-control-detail" aria-hidden="true">0%</span></button>
     <button id="control-sprint" hidden aria-label="Hold to sprint">Sprint<span>hold</span></button>
     <div id="control-pause-note">Choose your controls, then Start fresh.</div>
    </div>
    <div class="control-stats">
     <span>Score<strong id="control-score">0</strong></span>
     <span>Smooth passes<strong id="control-passes">0</strong></span>
     <span>Bumps<strong id="control-bumps">0</strong></span>
     <span>Speed<strong id="control-speed">0</strong></span>
     <span>Time left<strong id="control-time">Ready</strong></span>
     <div class="control-energy"><span>Stamina <strong id="control-energy">100%</strong></span><div class="control-energy-track" role="meter" aria-label="Stamina" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><div id="control-energy-fill"></div></div></div>
    </div>
   </section>
  </div>
  <footer class="control-footer">Keyboard: WASD / arrows · Shift to sprint. Practice only. Scores, wardrobe and playtest data are not saved.</footer>
  <div id="control-stick" hidden aria-hidden="true"><div id="control-stick-knob"></div></div>`;
 updateControlHint(root,'swipe');
}

export function updateControlHint(root,mode){
 const stick=mode==='stick';
 root.dataset.control=stick?'stick':'swipe';
 root.querySelector('#control-hint').textContent=stick
  ?'Drag anywhere on the dance floor to steer. Release to glide to a stop. Hold Sprint (or Shift + drag) for extra speed. B activates Bass Head; Escape pauses.'
  :'Swipe anywhere, then release to move in that screen direction. Longer goes farther; quicker goes faster. Keep it continuous—pauses, backtracking and slow drags are ignored. Tap to brake.';
 root.querySelector('#control-sprint').hidden=!stick;
 root.querySelector('#game').setAttribute('aria-label',stick
  ?'Movement practice dance floor. Drag to steer and release to stop. Hold Sprint for extra speed. Escape pauses.'
  :'Movement practice dance floor. Swipe anywhere and release to move in that screen direction. Longer strokes travel farther; quicker strokes move faster. Pauses, backtracking and slow drags are ignored. Tap to brake. Escape pauses.');
}
