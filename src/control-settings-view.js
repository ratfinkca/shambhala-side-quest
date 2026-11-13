import {sanitizeControlPreferences} from './control-preferences.js';

const hints={
 tap:'Click or tap a destination. Use Sprint or hold Shift for a speed boost. Keyboard movement is always available.',
 swipe:'Swipe anywhere, then release to move in that screen direction. Longer strokes travel farther; quicker strokes move faster and spend stamina. Keep it continuous: pauses, backtracking and slow drags are ignored. Tap to brake.',
 stick:'Touch anywhere to place the thumbstick. Steer gently inside the ring. Push past the marked Sprint ring to build speed gradually: farther out means faster, reaching full sprint at the outer edge. Ease back to recover stamina. Release to glide to a stop.',
};
const percent=value=>`${Math.round(value*100)}%`;
const options=(choices,value)=>choices.map(([id,label])=>`<option value="${id}"${value===id?' selected':''}>${label}</option>`).join('');

export function controlInstructions(value){
 const mode=sanitizeControlPreferences(value).mode;
 const instruction={tap:'Tap / click: choose a destination.',swipe:'Swipe: make one continuous stroke anywhere, then release. Move in the stroke’s screen direction; longer goes farther, quicker goes faster. Tap to brake.',stick:'Thumbstick: touch anywhere to place it. Steer inside the ring, then push beyond the Sprint ring to build speed gradually. Farther out means faster; ease back to recover stamina. Release to glide to a stop.'}[mode];
 return `Choose tap, swipe or thumbstick in Settings. ${instruction} WASD / arrows work too. Fast swipes or Shift / Sprint spend stamina; normal movement is always available. Escape pauses.`;
}

export function renderControlSettings(value){
 const p=sanitizeControlPreferences(value);
 return `<fieldset class="control-settings"><legend>Movement & camera</legend>
 <label class="control-setting-row" for="movement-mode"><span>Move with</span><select id="movement-mode" data-control-setting="mode">${options([['tap','Tap / click'],['swipe','Swipe bursts'],['stick','Thumbstick']],p.mode)}</select></label>
 <p class="control-setting-hint" data-control-hint>${hints[p.mode]}</p>
 <p class="control-setting-hint">Boosted movement uses stamina. You can still move at normal speed when it runs out.</p>
 <label class="control-setting-row" for="movement-hand"><span>Steering hand</span><select id="movement-hand" data-control-setting="hand">${options([['left','Left hand'],['right','Right hand']],p.hand)}</select></label>
 <p class="control-setting-hint">Mirrors the action layout. The thumbstick still appears wherever you touch.</p>
 <label class="control-setting-row" for="movement-sensitivity"><span>Gesture sensitivity <output for="movement-sensitivity" data-control-output="sensitivity">${percent(p.sensitivity)}</output></span><input id="movement-sensitivity" data-control-setting="sensitivity" type="range" min="0.6" max="1.6" step="0.05" value="${p.sensitivity}" aria-describedby="movement-sensitivity-help"${p.mode==='tap'?' disabled':''}></label>
 <p id="movement-sensitivity-help" class="control-setting-hint">Higher sensitivity needs less finger movement. Maximum speed stays the same.</p>
 <label class="control-setting-row" for="movement-camera"><span>Camera</span><select id="movement-camera" data-control-setting="camera">${options([['auto','Auto · follows on phones'],['follow','Follow player'],['overview','Whole dancefloor']],p.camera)}</select></label>
 <label class="control-setting-row" for="movement-zoom"><span>Follow camera zoom <output for="movement-zoom" data-control-output="zoom">${percent(p.zoom)}</output></span><input id="movement-zoom" data-control-setting="zoom" type="range" min="0.8" max="1.5" step="0.05" value="${p.zoom}"${p.camera==='overview'?' disabled':''}></label>
 <p class="control-setting-hint">Portrait and landscape both work. Whole dancefloor keeps the entire venue in view; Follow brings you closer.</p>
 <p class="control-setting-feedback" data-control-feedback role="status"></p></fieldset>`;
}

// Update the visible controls in place so changing a range keeps finger/focus.
export function updateControlSettings(root,value){
 const p=sanitizeControlPreferences(value);
 for(const [key,v] of Object.entries(p)){
  const input=root.querySelector(`[data-control-setting="${key}"]`);
  if(input)input.value=String(v);
  const output=root.querySelector(`[data-control-output="${key}"]`);
  if(output)output.textContent=percent(v);
 }
 const hint=root.querySelector('[data-control-hint]');if(hint)hint.textContent=hints[p.mode];
 const sensitivity=root.querySelector('[data-control-setting="sensitivity"]');if(sensitivity)sensitivity.disabled=p.mode==='tap';
 const zoom=root.querySelector('[data-control-setting="zoom"]');if(zoom)zoom.disabled=p.camera==='overview';
}

export function controlSettingValue(field,value){
 return field==='sensitivity'||field==='zoom'?Number(value):value;
}
