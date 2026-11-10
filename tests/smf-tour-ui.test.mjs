import {test} from 'node:test';
import assert from 'node:assert/strict';
import {titleHTML,wardrobeHTML,settingsHTML,stylesHTML,summaryHTML,boardsHTML,shellHTML} from '../src/smf-tour/view.js';
import {createTourProfile} from '../src/smf-tour/model.js';

test('title offers all modes and reachable player menus',()=>{
 const html=titleHTML(createTourProfile());
 for(const value of ['festival','rush','endless']) assert.match(html,new RegExp(`data-id="${value}"`));
 for(const action of ['wardrobe','style','settings','scores','rules']) assert.match(html,new RegExp(`data-action="${action}"`));
});
test('wardrobe shows every category and keeps secret names concealed',()=>{
 const html=wardrobeHTML(createTourProfile());
 for(const category of ['onesie','hat','totem','flair']) assert.match(html,new RegExp(`data-outfit="${category}"`));
 assert.match(html,/preview-outfit/); assert.doesNotMatch(html,/Golden Chicken/);
});
test('style and settings expose choices and truthful default consent',()=>{
 const p=createTourProfile(),style=stylesHTML(p),settings=settingsHTML(p);
 for(const id of ['forest-freakout','moonlit-mycelium','neon-field-trip','surprise']) assert.match(style,new RegExp(`data-id="${id}"`));
 assert.match(settings,/tour-music/);assert.match(settings,/tour-fx/);assert.match(settings,/consent-accept/);assert.match(settings,/off/i);
});
test('boards escape player names and local and online results are distinct',()=>{
 const p=createTourProfile();p.boards={rush:[{initials:'<X>',score:5}],festival:[],endless:[]};
 const html=boardsHTML(p,{mode:'rush'});assert.doesNotMatch(html,/<X>/);assert.match(html,/&lt;X&gt;/);assert.match(html,/On this device/);assert.match(html,/Online/);
});
test('shell keeps live controls in header and exposes game nodes',()=>{
 const html=shellHTML();for(const id of ['tour-pause','tour-running','tour-stage','tour-points','tour-time','game','tour-paused','tour-menu'])assert.match(html,new RegExp(`id="${id}"`));
 assert.ok(html.indexOf('id="tour-pause"')<html.indexOf('id="tour-running"'));
});

test('compact HUD conveys combo, effects and phase without touching instructions',async()=>{
 const {updateTourHUD}=await import('../src/smf-tour/view.js');
 const node={textContent:''},root={querySelector:s=>s==='#tour-details'?node:null};
 updateTourHUD(root,{round:{remainingMs:55000,multiplier:2,chain:6,closePasses:3,flowMs:2300,shieldsRemaining:1,mystery:{effect:'speed',effectMs:1000}}});
 assert.match(node.textContent,/2× · 6 combo/);assert.match(node.textContent,/FLOW 3s/);assert.match(node.textContent,/Shield ready/);assert.match(node.textContent,/SUGAR RUSH/);
 updateTourHUD(root,{round:{},bonus:true});assert.equal(node.textContent,'');
});

test('short-viewport CSS constrains the game field to visible height',async()=>{
 const {readFile}=await import('node:fs/promises');const css=await readFile(new URL('../src/smf-tour/style.css',import.meta.url),'utf8');
 assert.match(css,/100dvh\s*-\s*106px/);assert.match(css,/@media\(max-height:500px\)/);
});

test('stage introduction is gated and always provides a way back',async()=>{
 const {rulesHTML}=await import('../src/smf-tour/ui.js');const p=createTourProfile();
 assert.doesNotMatch(rulesHTML(p),/data-action="enter"/);assert.match(rulesHTML(p),/data-action="back"/);
 p.active={status:'playing',needsIntro:true,bonus:null,mode:'festival'};assert.match(rulesHTML(p),/data-action="enter"/);assert.match(rulesHTML(p),/data-action="back"/);
 p.active.needsIntro=false;assert.doesNotMatch(rulesHTML(p),/data-action="enter"/);
});
test('posted initials are locked for an immutable retry',()=>{
 const p=createTourProfile();p.active={status:'results',mode:'rush',score:10,cleared:1,perks:[],scoreStages:[{}],initialsDraft:'NEW'};
 const html=summaryHTML(p,{onlineEnabled:true,submission:{status:'error',initials:'OLD'}});assert.match(html,/value="OLD" autocomplete="off" disabled/);assert.match(html,/retry-score/);
});

test('sharing can be changed directly on title with honest configuration state',()=>{
 const p=createTourProfile();let html=titleHTML(p,{noticeURL:'https://example.org/notice'});assert.match(html,/data-action="consent-accept"/);assert.match(html,/playtest notice/i);assert.match(html,/Off: no playtest data is shared/);
 p.playtestConsent='accepted';html=titleHTML(p,{playtestEnabled:false});assert.match(html,/data-action="consent-decline"/);assert.match(html,/sharing is unavailable/);
});
test('stage summary can finish and results can replay',()=>{
 const p=createTourProfile();p.active={status:'summary',stageIndex:0,mode:'endless',score:5,cleared:1,perks:[],summary:null};
 assert.match(summaryHTML(p),/data-action="leave"/);p.active.status='results';assert.match(summaryHTML(p),/data-action="replay"/);
});
test('full mode help explains all three paths',async()=>{
 const {rulesHTML}=await import('../src/smf-tour/ui.js');const html=rulesHTML(createTourProfile());for(const s of ['Quick Rush','Festival Run','Endless Festival'])assert.match(html,new RegExp(s));
});

test('local and online board rows show readable control types',()=>{
 const p=createTourProfile();p.boards={rush:[{initials:'AAA',score:5,inputType:'mouse'}],festival:[],endless:[]};
 const html=boardsHTML(p,{boardMode:'rush',onlineEnabled:true,board:{status:'ready',rows:[{initials:'BBB',score:7,inputType:'touch'},{initials:'CCC',score:4,inputType:'keyboard'},{initials:'DDD',score:3,inputType:'mixed'},{initials:'EEE',score:2,inputType:'unknown'}]}});
 for(const type of ['Mouse','Touch','Keyboard','Mixed','Unknown'])assert.match(html,new RegExp(type));
});
