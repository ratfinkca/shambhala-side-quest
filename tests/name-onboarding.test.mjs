import test from 'node:test';
import assert from 'node:assert/strict';
import * as onboarding from '../src/onboarding.js';
test('new runs require a valid name even for a previously confirmed character',()=>{
 assert.equal(typeof onboarding.requiresCharacterSetup,'function');
 assert.equal(onboarding.requiresCharacterSetup({characterConfirmed:true,playerName:''}),true);
 assert.equal(onboarding.requiresCharacterSetup({characterConfirmed:true,playerName:'Good Name'}),false);
 assert.equal(onboarding.requiresCharacterSetup({characterConfirmed:false,playerName:'Good Name'}),true);
 assert.equal(onboarding.requiresCharacterSetup({characterConfirmed:true,playerName:'sh1t'}),true);
});
test('first-play name form stays visible before opening full appearance controls',()=>{
 const node=className=>({className,classList:{added:[],add(value){this.added.push(value);}},matches(selector){return selector.split(',').includes(`.${className}`);}});
 const setup=node('player-setup'),wardrobe=node('wardrobe-grid');
 const container={children:[setup,wardrobe],classList:{add(){}},insertAdjacentHTML(){},querySelector(){return null;}};
 onboarding.mountCharacterWelcome(container);assert.equal(setup.classList.added.includes('character-extra'),false);assert.equal(wardrobe.classList.added.includes('character-extra'),true);
 assert.match(onboarding.characterWelcomeHTML(),/Choose your rave name/);
});
