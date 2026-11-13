import {test} from 'node:test';
import assert from 'node:assert/strict';
import {titleHTML,wardrobeHTML,settingsHTML,stylesHTML,summaryHTML,boardsHTML,rulesHTML,shellHTML} from '../src/smf-tour/view.js';
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
 const html=boardsHTML(p,{boardVersion:'smf-v1',mode:'rush'});assert.doesNotMatch(html,/<X>/);assert.match(html,/&lt;X&gt;/);assert.match(html,/On this device/);assert.match(html,/Online/);
});
test('shell keeps finish confirmation outside steering and pause settings reachable',()=>{
 const html=shellHTML();for(const id of ['tour-pause','tour-proceed','tour-running','tour-stage','tour-points','tour-time','game','tour-paused','tour-pause-message','tour-menu','tour-order','tour-status','tour-putt'])assert.match(html,new RegExp(`id="${id}"`));
 assert.ok(html.indexOf('id="tour-pause"')<html.indexOf('id="tour-running"'));
 assert.ok(html.indexOf('id="tour-proceed"')<html.indexOf('id="game"'));
 const pause=html.slice(html.indexOf('class="tour-pause-card"'),html.indexOf('<div class="tour-objectives">'));
 for(const action of ['pause','settings','leave'])assert.match(pause,new RegExp(`data-action="${action}"`));
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
 const swipe=rulesHTML(createTourProfile(),{controls:{mode:'swipe'}});
 assert.match(swipe,/Swipe: make one continuous stroke anywhere, then release/);assert.match(swipe,/Shift \/ Sprint spend stamina/);assert.match(swipe,/normal movement is always available/);
 const stick=rulesHTML(createTourProfile(),{controls:{mode:'stick'}});
 assert.match(stick,/Thumbstick: touch anywhere to place it/);assert.match(stick,/Sprint ring/);assert.doesNotMatch(stick,/Tap \/ click: choose a destination/);
});

test('local and online board rows show readable control types',()=>{
 const p=createTourProfile();p.boards={rush:[{initials:'AAA',score:5,inputType:'mouse'}],festival:[],endless:[]};
 const html=boardsHTML(p,{boardVersion:'smf-v1',boardMode:'rush',onlineEnabled:true,board:{status:'ready',rows:[{initials:'BBB',score:7,inputType:'touch'},{initials:'CCC',score:4,inputType:'keyboard'},{initials:'DDD',score:3,inputType:'mixed'},{initials:'EEE',score:2,inputType:'unknown'}]}});
 for(const type of ['Mouse','Touch','Keyboard','Mixed','Unknown'])assert.match(html,new RegExp(type));
});

test('Rush boards show only the selected venue and its locally saved best',()=>{
 const p=createTourProfile();p.boards.rush=[
  {initials:'OLD',score:900},
  {initials:'AMP',score:320,rushStageId:'smf-amp'},
  {initials:'<A>',score:480,rushStageId:'smf-amp'},
  {initials:'PAG',score:800,rushStageId:'smf-pagoda'},
 ];
 const html=boardsHTML(p,{boardVersion:'smf-v1',boardMode:'rush',boardVenue:'smf-amp',onlineEnabled:true,board:{mode:'rush',rushStageId:'smf-amp',status:'ready',rows:[{initials:'WEB',score:600,rushStageId:'smf-amp'},{initials:'LEAK',score:850,rushStageId:'smf-grove'},{initials:'OLDWEB',score:700}]}});
 assert.match(html,/<label[^>]*for="tour-board-venue"/);
 assert.match(html,/<select[^>]*id="tour-board-venue"[^>]*data-board-venue/);
 assert.match(html,/<option value="smf-amp" selected>The AMP<\/option>/);
 for(const name of ['The Living Room','Fractal Forest','The Grove','The AMP','The Pagoda','The Village'])assert.ok(html.includes(name));
 assert.match(html,/On this device · Quick Rush · The AMP/);assert.match(html,/Online · Quick Rush · The AMP/);
 assert.match(html,/Your saved best · The AMP[\s\S]*480 points/);
 assert.match(html,/AMP/);assert.match(html,/&lt;A&gt;/);assert.match(html,/WEB/);
 assert.doesNotMatch(html,/<A>|>OLD<|>PAG<|>LEAK<|>OLDWEB<|900 points|800 points/);
});

test('a stale online mode or venue is not displayed under the selected Rush venue',()=>{
 const p=createTourProfile(),rows=[{initials:'LEAK',score:800,rushStageId:'smf-amp'}];
 for(const board of [
  {mode:'festival',rushStageId:'smf-amp',status:'ready',rows},
  {mode:'rush',rushStageId:'smf-grove',status:'ready',rows},
  {mode:'rush',status:'ready',rows},
 ]){
  const html=boardsHTML(p,{boardVersion:'smf-v1',boardMode:'rush',boardVenue:'smf-amp',onlineEnabled:true,board});
  assert.doesNotMatch(html,/>LEAK<|800 points/);assert.match(html,/Loading online scores/);
 }
});

test('legacy Rush scores remain on Pagoda and an empty venue has no invented best',()=>{
 const p=createTourProfile();p.boards.rush=[{initials:'OLD',score:900},{initials:'ZERO',score:0,rushStageId:'smf-grove'}];
 const legacy=boardsHTML(p,{boardVersion:'smf-v1'});assert.match(legacy,/On this device · Quick Rush · The Pagoda/);assert.match(legacy,/>OLD</);
 assert.doesNotMatch(legacy,/>ZERO</);
 const empty=boardsHTML(p,{boardVersion:'smf-v1',boardVenue:'smf-fractal'});assert.match(empty,/No score saved for this venue yet/);assert.doesNotMatch(empty,/>OLD<|900 points/);
 const zero=boardsHTML(p,{boardVersion:'smf-v1',boardVenue:'smf-grove'});assert.match(zero,/Your saved best · The Grove[\s\S]*0 points/);assert.doesNotMatch(zero,/No score saved for this venue yet/);
 const invalid=boardsHTML(p,{boardVersion:'smf-v1',boardVenue:'"><script>alert(1)</script>'});assert.doesNotMatch(invalid,/<script>|alert\(1\)/);assert.match(invalid,/On this device · Quick Rush · The Pagoda/);
 const festival=boardsHTML(p,{boardVersion:'smf-v1',boardMode:'festival',boardVenue:'smf-amp'});assert.doesNotMatch(festival,/tour-board-venue|Your saved best/);
});

test('Rush introduction names the selected venue with its own duration and saved best',()=>{
 const p=createTourProfile();p.active={status:'playing',needsIntro:true,mode:'rush',rushStageId:'smf-amp',score:999};
 p.boards.rush=[{initials:'AMP',score:345,rushStageId:'smf-amp'},{initials:'PAG',score:900}];
 const html=rulesHTML(p,{stage:{name:'The AMP',target:0,durationMs:54857}});
 assert.match(html,/<h2>The AMP<\/h2>/);assert.match(html,/55 seconds/);
 assert.match(html,/Your saved best · The AMP[\s\S]*345 points/);
 assert.doesNotMatch(html,/900 points|999 points|60-second set at Pagoda|lasts 60 seconds/);
 assert.match(html,/data-action="enter"/);assert.match(html,/no secret invitations/);
});

test('Rush results keep an unsaved personal best out of the saved venue record',()=>{
 const p=createTourProfile();p.active={id:'new',status:'results',stageIndex:0,mode:'rush',rushStageId:'smf-grove',score:600,cleared:1,perks:[],scoreStages:[{}],scoreSaved:false};
 p.boards.rush=[{id:'old',initials:'OLD',score:420,rushStageId:'smf-grove'},{id:'other',initials:'PAG',score:900}];
 let html=summaryHTML(p);
 assert.match(html,/<h2>The Grove · Quick Rush results<\/h2>/);
 assert.match(html,/Your saved best · The Grove[\s\S]*420 points/);assert.match(html,/This score is not saved yet/);
 assert.doesNotMatch(html,/900 points|data-action="perk"|data-action="keep"/);
 p.active.scoreSaved=true;p.boards.rush.push({id:'new',initials:'NEW',score:600,rushStageId:'smf-grove'});
 html=summaryHTML(p);assert.match(html,/Your saved best · The Grove[\s\S]*600 points/);assert.doesNotMatch(html,/This score is not saved yet/);
 const session=summaryHTML(p,{saved:false});assert.match(session,/session/i);assert.doesNotMatch(session,/Your saved best|Saved on this device/);
});
