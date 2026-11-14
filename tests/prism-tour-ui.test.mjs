import test from 'node:test';
import assert from 'node:assert/strict';
import {prismHUD} from '../src/prism-practice/hud.js';
import {createPrismPractice,PRISM} from '../src/prism-practice/model.js';
import {catalogueHTML,wardrobeHTML,titleHTML} from '../src/smf-tour/view.js';
import {createTourProfile} from '../src/smf-tour/model.js';

test('Prism HUD describes entry, retained charge and musical cues without a round deadline',()=>{
 const s=createPrismPractice().state;
 assert.deepEqual(prismHUD(s),{progress:'0 / 3 faces',clockLabel:'BONUS',clock:'No rush',instruction:'Walk up the glowing ramp. Dance in the lit section to charge its face.'});
 Object.assign(s,{entered:true,phase:'party',activeZone:0,partyMs:20});
 const first=prismHUD(s);assert.equal(first.clockLabel,'NEXT CUE');assert.equal(first.clock,'8s');assert.match(first.instruction,/Cyan ◆/);
 s.partyMs=990;assert.equal(prismHUD(s).clock,first.clock);
 s.partyMs=1000;assert.equal(prismHUD(s).clock,'7s');
 s.charges[0]=PRISM.chargeMs;s.progress=1;assert.match(prismHUD(s).instruction,/Face lit/);assert.equal(prismHUD(s).progress,'1 / 3 faces');
 s.phase='celebrating';s.activeZone=-1;s.progress=3;assert.equal(prismHUD(s).clock,'All lit');assert.match(prismHUD(s).instruction,/Prism Crown/);
 s.phase='complete';s.complete=true;assert.equal(prismHUD(s).clock,'Done');
});
test('Fractal keeps the sixth party and its crown concealed until discovery',()=>{
 const p=createTourProfile();assert.match(titleHTML(p),/SIX HIDDEN PARTIES/);
 for(const html of [catalogueHTML(p),wardrobeHTML(p)])assert.doesNotMatch(html,/Prism Party|Prism Crown|prism-crown/);
 p.discoveries=['prism-party'];const revealed=wardrobeHTML(p);assert.match(revealed,/Prism Crown/);assert.match(revealed,/Light all three pyramid faces/);assert.match(revealed,/data-souvenir-icon="prism-crown"/);assert.doesNotMatch(revealed,/data-action="equip"[^>]*data-id="prism-crown"/);
 p.rewards=['prism-crown'];p.souvenir='prism-crown';assert.match(wardrobeHTML(p),/data-id="prism-crown" aria-pressed="true"/);
 assert.match(catalogueHTML(p),/fresh invitation at Fractal Forest/);
});
