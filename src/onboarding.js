const MODES=new Set(['rush','festival','endless']);

// A missing marker on a valid old profile means returning player, not a reset.
export function normalizeCharacterConfirmed(value,legacy=false){
 return value===undefined?legacy:value===true;
}

export function createCharacterOnboarding(){
 let pendingMode=null;
 return {
  get pendingMode(){return pendingMode;},
  request(mode,confirmed){if(!MODES.has(mode)||confirmed)return false;pendingMode=mode;return true;},
  confirm(){const mode=pendingMode;pendingMode=null;return mode;},
  cancel(){pendingMode=null;},
 };
}

export function characterWelcomeHTML(){
 return `<section class="character-welcome" aria-label="Your first festival look"><span class="menu-eyebrow">YOUR NIGHT STARTS HERE</span><h2>Meet your festival self.</h2><p>Pick a look below, or jump in just as you are.</p><button type="button" class="primary-button" data-action="character-ready">That's me — let's go!</button><button type="button" class="quiet-button" data-action="character-customize" aria-expanded="false">Make it mine</button><button type="button" class="quiet-button" data-action="character-cancel">Back to title</button></section>`;
}

// Keep the full, existing wardrobe available without making it the first-use form.
export function mountCharacterWelcome(container){
 container.classList.add('character-onboarding');
 container.insertAdjacentHTML('afterbegin',characterWelcomeHTML());
 const identity=container.querySelector('.character-identity');
 for(const node of [...container.children]){
  if(node.matches('.character-welcome,.character-identity,#outfit-feedback'))continue;
  node.classList.add('character-extra');
 }
 if(identity)for(const node of identity.children){
  if(!node.matches('.character-presets,h3'))node.classList.add('character-extra');
 }
}
