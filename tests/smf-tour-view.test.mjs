import test from 'node:test';
import assert from 'node:assert/strict';
import {BONUSES,ROUTE,createTourProfile,createFestival,beginBonus,finishBonus,finishMain} from '../src/smf-tour/model.js';
import {catalogueHTML,wardrobeHTML,titleHTML,summaryHTML,bonusResultHTML} from '../src/smf-tour/view.js';
import {invitedBonusVisit} from './fixtures/smf-bonus-profile.mjs';
import {mainStage} from '../src/smf-tour/content.js';
import {createRound,advanceRound} from '../src/game.js';
import {PERKS} from '../src/run.js';

const result=({owned=false,won=false,completed=won}={})=>{
 let p=createTourProfile();p.discoveries=['villagio'];if(owned)p.rewards=['golden-chicken'];
 p=invitedBonusVisit('villagio','view-test-visit',p);return finishBonus(p,{won,completed});
};
const cleared=index=>{
 let p=createFestival(createTourProfile(),'view-test-festival');p.active.stageIndex=index;p.active.cleared=index;
 const stage=mainStage(ROUTE[index]),round=createRound({},stage.timingId);
 round.runId=p.active.id;round.pickups=stage.target;advanceRound(round,round.remainingMs);
 return finishMain(p,round);
};

test('unvisited secret names and rewards are absent from catalogue and wardrobe HTML',()=>{
 const p=createTourProfile(),catalogue=catalogueHTML(p),wardrobe=wardrobeHTML(p);
 assert.equal((catalogue.match(/A secret awaits/g)||[]).length,5);
 assert.equal((wardrobe.match(/Sealed keepsake/g)||[]).length,5);
 for(const bonus of BONUSES){
  assert.ok(!catalogue.includes(bonus.name));assert.ok(!catalogue.includes(`data-id="${bonus.id}"`));
  assert.ok(!wardrobe.includes(bonus.name));assert.ok(!wardrobe.includes(bonus.reward.name));assert.ok(!wardrobe.includes(`data-id="${bonus.reward.id}"`));
 }
 assert.doesNotMatch(catalogue+wardrobe,/bonus-practice|rabbit-hole-v1|secret-garden-v1|ikigai-mori-v1|villagio-v1/);
});

test('discovery reveals only its own map card and earned souvenir equip choice',()=>{
 const p=createTourProfile();p.discoveries=['rabbit-hole'];
 let catalogue=catalogueHTML(p),wardrobe=wardrobeHTML(p);
 assert.match(catalogue,/Rabbit Hole/);assert.match(catalogue,/fresh invitation/i);assert.doesNotMatch(catalogue,/data-action="explore"/);assert.match(wardrobe,/Rabbit Ears/);
 assert.doesNotMatch(wardrobe,/data-action="equip"[^>]*data-id="rabbit-ears"/);
 p.rewards=['rabbit-ears'];p.souvenir='rabbit-ears';wardrobe=wardrobeHTML(p);
 assert.match(wardrobe,/data-id="rabbit-ears" aria-pressed="true"/);
 for(const bonus of BONUSES.filter(b=>b.id!=='rabbit-hole'))assert.ok(!catalogue.includes(bonus.name)&&!wardrobe.includes(bonus.reward.name));
});

test('title carries the edition artwork and restores an adventure instead of starting over',()=>{
 const fresh=titleHTML(createTourProfile());assert.match(fresh,/title-neon-field-trip-v1\.webp/);assert.match(fresh,/data-action="start"/);
 const ongoing=titleHTML(createFestival(createTourProfile(),'view-test'));assert.match(ongoing,/data-action="resume"/);assert.match(ongoing,/resumes paused/);assert.doesNotMatch(ongoing,/data-action="start"/);
});

test('four equipped perks retain a keep-and-continue control before Village',()=>{
 const p=cleared(4);p.active.perks=Object.keys(PERKS).slice(0,4);
 const html=summaryHTML(p);assert.match(html,/4 \/ 4 active/);assert.match(html,/id="tour-replace"/);
 assert.match(html,/data-action="keep"[^>]*>Keep perks · Continue to The Village/);
});

test('final results have no nonexistent seventh-stage perk choices',()=>{
 const html=summaryHTML(cleared(5));assert.match(html,/You danced the whole festival/);assert.match(html,/6 \/ 6 stages cleared/);
 assert.match(html,/data-action="close"/);assert.doesNotMatch(html,/data-action="perk"|data-action="keep"|tour-replace/);
});

test('an unfinished repeat challenge acknowledges an owned item without a new win claim',()=>{
 const html=bonusResultHTML(result({owned:true,won:false}),true);
 assert.doesNotMatch(html,/is yours!|Your souvenir is saved/);
 assert.match(html,/already (?:own|in your wardrobe)/i);
 assert.match(html,/another try|did not earn|unfinished/i);
});

test('new and repeat successes distinguish a new souvenir from existing ownership',()=>{
 const first=bonusResultHTML(result({won:true}),true);assert.match(first,/Golden Chicken Totem unlocked!/);assert.match(first,/saved/);
 const repeat=bonusResultHTML(result({owned:true,won:true}),true);assert.match(repeat,/already (?:own|in your wardrobe)/i);assert.match(repeat,/no duplicate/i);assert.doesNotMatch(repeat,/is yours!/);
});

test('failed storage is never presented as successful saving on reward or Festival results',()=>{
 const bonus=bonusResultHTML(result({won:true}),false);assert.match(bonus,/session|unavailable/i);assert.doesNotMatch(bonus,/is saved|are saved/);
 const festival=summaryHTML(cleared(5),{saved:false});assert.match(festival,/session|unavailable/i);assert.doesNotMatch(festival,/Results and rewards are saved/);
});
