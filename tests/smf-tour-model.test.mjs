import test from 'node:test';
import assert from 'node:assert/strict';
import {
 ROUTE,BONUSES,createTourProfile,createFestival,createTourRun,stageForRun,collectInvitation,finishMain,
 choosePerk,beginBonus,finishBonus,returnBonus,endFestival,closeResults,
} from '../src/smf-tour/model.js';
import {createRound} from '../src/game.js';
import {DEFAULT_APPEARANCE} from '../src/wardrobe.js';

const fresh=()=>createFestival(createTourProfile(),'tour-one');
function ended(profile,overrides={}){
 const stage=stageForRun(profile.active);
 return {...createRound({},stage.timingId),runId:profile.active.id,ended:true,remainingMs:0,pickups:stage.target,score:100,...overrides};
}
const clear=profile=>finishMain(profile,ended(profile));
function parentSummary(index,{discover=true}={}){
 let p=fresh();
 for(let i=0;i<=index;i++){
  if(discover)p=collectInvitation(p);
  p=clear(p);
  if(i<index)p=choosePerk(p,null);
 }
 return p;
}

test('SMF Festival starts with its own empty profile and leaves input objects unchanged',()=>{
 const profile=createTourProfile(),before=structuredClone(profile),p=createFestival(profile,'tour-one');
 assert.deepEqual(profile,before);assert.equal(profile.active,null);
 assert.equal(profile.progress.xp,0);assert.deepEqual(profile.discoveries,[]);assert.deepEqual(profile.rewards,[]);
 assert.deepEqual(p.active,{id:'tour-one',mode:'festival',scoringVersion:'smf-v3',challenge:'been-around',displayNameDraft:'',themeId:'neon-field-trip',stageIndex:0,status:'playing',score:0,cleared:0,perks:[],bassChargeMs:0,pendingInvitation:false,summary:null,bonus:null,scene:null,scoreStages:[],initialsDraft:'',inputType:'unknown',submission:null,buildId:'dev',scoreSaved:false,needsIntro:true,remixPending:false});
 assert.deepEqual(p.outfit,{onesie:'lime',hat:'bucket',totem:'none',flair:'none',appearance:DEFAULT_APPEARANCE});
 assert.equal(createFestival(p,'replacement'),p);
 assert.equal(createFestival(profile,''),profile);
});

test('collecting an invitation only commits discovery when the parent qualifies',()=>{
 const p=fresh(),found=collectInvitation(p);
 assert.equal(p.active.pendingInvitation,false);assert.equal(found.active.pendingInvitation,true);
 assert.deepEqual(found.discoveries,[]);assert.equal(found.progress.xp,0);
 const finished=finishMain(found,ended(found));
 assert.deepEqual(finished.discoveries,['rabbit-hole']);
 assert.equal(finished.active.status,'summary');assert.equal(finished.active.summary.bonusId,'rabbit-hole');
 assert.equal(finished.active.summary.bonusOffered,true);assert.equal(finished.active.pendingInvitation,false);
 assert.equal(finished.active.score,100);assert.equal(finished.active.cleared,1);
 assert.equal(finished.progress.xp,96);assert.equal(finished.active.summary.xp,96);
 assert.equal(finishMain(finished,ended(found)),finished);
});

test('failure rejects pending discovery but banks the ended stage score only once',()=>{
 const p=collectInvitation(fresh()),failed=finishMain(p,ended(p,{pickups:22,score:50}));
 assert.deepEqual(failed.discoveries,[]);assert.equal(failed.active.status,'results');
 assert.equal(failed.active.score,50);assert.equal(failed.active.cleared,0);
 assert.equal(failed.active.summary.bonusId,null);assert.equal(failed.progress.xp,64);
 assert.equal(collectInvitation(failed),failed);assert.equal(beginBonus(failed,'rabbit-hole','visit'),failed);
 assert.equal(finishMain(failed,ended(p)),failed);
});

test('incomplete, unrelated or invalid round completions cannot advance the tour',()=>{
 const p=fresh();
 for(const change of [{ended:false},{remainingMs:1},{runId:'different'},{timingId:'generic-60-v1'},{score:-1},{score:Infinity},{pickups:NaN},{pickups:1.1}]){
  assert.equal(finishMain(p,ended(p,change)),p);
 }
 assert.equal(finishMain(p,null),p);assert.equal(finishMain(createTourProfile(),ended(p)).active,null);
});

test('a skipped detour stays discovered but needs a fresh invitation next run',()=>{
 let p=parentSummary(0);
 p=choosePerk(p,null);
 assert.equal(p.active.stageIndex,1);assert.deepEqual(p.discoveries,['rabbit-hole']);
 assert.equal(collectInvitation(p),p); // Fractal has no bonus invitation.
 p=closeResults(endFestival(p));p=createFestival(p,'tour-two');
 const withoutInvite=clear(p);
 assert.equal(withoutInvite.active.summary.bonusId,null);assert.equal(withoutInvite.active.summary.bonusOffered,false);
 assert.equal(beginBonus(withoutInvite,'rabbit-hole','unearned'),withoutInvite);
 p=collectInvitation(p);assert.equal(p.active.pendingInvitation,true);
 assert.equal(collectInvitation(p),p);
 p=clear(p);assert.equal(p.active.summary.bonusId,'rabbit-hole');assert.equal(p.active.summary.bonusOffered,true);
 assert.deepEqual(p.discoveries,['rabbit-hole'],'repeat invites do not duplicate the permanent discovery');
});

test('a completed bonus parks main points, perks, charge and the pending upgrade',()=>{
 let p=fresh();p.active.bassChargeMs=500;
 const round=ended(p);round.bass.chargeMs=4000;
 p=finishMain(collectInvitation(p),round);
 const parent=structuredClone(p.active),xp=p.progress.xp;
 const visiting=beginBonus(p,'rabbit-hole','visit-one');
 assert.equal(visiting.active.status,'summary');assert.equal(visiting.active.bonus.returnTo,'summary');
 assert.deepEqual(visiting.active.summary,{...parent.summary,bonusOffered:false});assert.equal(visiting.active.bassChargeMs,4000);
 assert.equal(choosePerk(visiting,'boots'),visiting);assert.equal(endFestival(visiting),visiting);
 const won=finishBonus(visiting,{completed:true});
 assert.deepEqual(won.rewards,['rabbit-ears']);assert.equal(won.souvenir,'rabbit-ears');
 assert.equal(won.progress.xp,xp);assert.equal(won.active.score,parent.score);assert.equal(won.active.cleared,parent.cleared);
 assert.equal(finishBonus(won,{completed:true}),won);
 const back=returnBonus(won);
 assert.equal(back.active.status,'summary');assert.equal(back.active.bonus,null);
 assert.equal(back.active.summary.bonusOffered,false);assert.deepEqual(back.active.perks,parent.perks);
 assert.equal(back.active.bassChargeMs,4000);assert.equal(beginBonus(back,'rabbit-hole','repeat'),back);
 const next=choosePerk(back,'boots');assert.equal(next.active.stageIndex,1);assert.deepEqual(next.active.perks,['boots']);
});

test('original three souvenirs require a completed visit or win, not entry or early exit',()=>{
 for(const [index,id,reward] of [[0,'rabbit-hole','rabbit-ears'],[2,'secret-garden','glow-blossom'],[4,'ikigai-mori','lantern-totem']]){
  const p=parentSummary(index),visiting=beginBonus(p,id,`${id}-visit`);
  assert.deepEqual(visiting.rewards,[]);
  const left=returnBonus(finishBonus(visiting));assert.deepEqual(left.rewards,[]);
  assert.deepEqual(finishBonus(visiting,{completed:true}).rewards,[reward]);
  assert.deepEqual(finishBonus(visiting,{won:true}).rewards,[reward]);
 }
});

test('AMP and Villagio prizes require actual wins; a full visit or timeout is insufficient',()=>{
 for(const [index,id,reward] of [[3,'amp-backstage','cheese-totem'],[5,'villagio','golden-chicken']]){
  const visiting=beginBonus(parentSummary(index),id,`${id}-visit`);
  assert.deepEqual(finishBonus(visiting,{completed:true}).rewards,[]);
  assert.deepEqual(finishBonus(visiting).rewards,[]);
  assert.deepEqual(finishBonus(visiting,{won:true}).rewards,[reward]);
 }
});

test('permanent discoveries cannot bypass invitation entry from the catalogue',()=>{
 let p=closeResults(endFestival(parentSummary(0)));
 const result=structuredClone(p.lastResult);
 assert.equal(beginBonus(p,'secret-garden','locked',{explore:true}),p);
 assert.equal(beginBonus(p,'rabbit-hole','wrong-mode'),p);
 assert.equal(beginBonus(p,'rabbit-hole','explore-one',{explore:true}),p);
 assert.equal(p.active,null);assert.deepEqual(p.lastResult,result);assert.deepEqual(p.discoveries,['rabbit-hole']);
 assert.equal(p.progress.xp,96);
});

test('using an invite consumes entry while cosmetics survive later invitation-gated visits',()=>{
 let p=beginBonus(parentSummary(0),'rabbit-hole','first-visit');
 assert.equal(p.active.summary.bonusOffered,false,'entry consumes the invite before the activity starts');
 p=returnBonus(finishBonus(p,{completed:true}));
 assert.equal(beginBonus(p,'rabbit-hole','reused-invite'),p);
 p=closeResults(endFestival(p));p.souvenir=null;
 p=createFestival(p,'second-run');
 assert.deepEqual(p.rewards,['rabbit-ears']);assert.deepEqual(p.discoveries,['rabbit-hole']);
 const noInvite=clear(p);assert.equal(beginBonus(noInvite,'rabbit-hole','no-invite'),noInvite);
 p=beginBonus(clear(collectInvitation(p)),'rabbit-hole','second-visit');
 p=finishBonus(p,{completed:true});assert.equal(p.active.bonus.newReward,false);
 assert.deepEqual(p.rewards,['rabbit-ears']);assert.equal(p.souvenir,null);
});

test('Endless requires another invitation when the parent returns in a later loop',()=>{
 let p=createTourRun(createTourProfile(),'endless','endless-invites');
 p=returnBonus(finishBonus(beginBonus(clear(collectInvitation(p)),'rabbit-hole','loop-one'),{completed:true}));
 for(let i=0;i<6;i++){p=choosePerk(p,null);if(i<5)p=clear(p);}
 assert.equal(p.active.stageIndex,6);assert.equal(p.active.pendingInvitation,false);
 assert.equal(clear(p).active.summary.bonusOffered,false);
 p=clear(collectInvitation(p));assert.equal(p.active.summary.bonusOffered,true);
 p=beginBonus(p,'rabbit-hole','loop-two');assert.equal(p.active.summary.bonusOffered,false);
 assert.equal(p.active.bonus.visitId,'loop-two');assert.deepEqual(p.discoveries,['rabbit-hole']);
});

test('bonus entry rejects wrong parents, nested visits, unknown IDs and stale offers',()=>{
 const p=parentSummary(0),visiting=beginBonus(p,'rabbit-hole','one');
 assert.equal(beginBonus(p,'secret-garden','one'),p);assert.equal(beginBonus(p,'unknown','one'),p);
 assert.equal(beginBonus(p,'rabbit-hole',''),p);assert.equal(beginBonus(p,'rabbit-hole','one',{explore:true}),p);
 assert.equal(beginBonus(visiting,'rabbit-hole','two'),visiting);assert.equal(closeResults(visiting),visiting);
 assert.equal(collectInvitation(visiting),visiting);assert.equal(finishMain(visiting,ended(p)),visiting);
});

test('perks unlock using newly earned XP, cap at four, replace one, and allow keeping all',()=>{
 let p=createTourProfile();p.progress.xp=1900;p=createFestival(p,'perks');
 for(const perk of ['boots','bracelet','noodle','moth'])p=choosePerk(clear(p),perk);
 assert.equal(p.active.stageIndex,4);assert.deepEqual(p.active.perks,['boots','bracelet','noodle','moth']);
 const summary=clear(p);
 assert.equal(choosePerk(summary,'sweet'),summary);
 assert.equal(choosePerk(summary,'sweet','missing'),summary);
 assert.equal(choosePerk(summary,'boots','moth'),summary);
 const swapped=choosePerk(summary,'sweet','moth');
 assert.deepEqual(swapped.active.perks,['boots','bracelet','noodle','sweet']);assert.equal(swapped.active.stageIndex,5);
 assert.deepEqual(choosePerk(summary,null).active.perks,['boots','bracelet','noodle','moth']);
 const low=clear(fresh());assert.equal(choosePerk(low,'sweet'),low);assert.equal(choosePerk(low,'noodle'),low);
 const advanced=choosePerk(low,'boots'),afterSecond=clear(advanced);
 assert.deepEqual(choosePerk(afterSecond,'noodle').active.perks,['boots','noodle']);
});

test('six venues follow the approved route and final Villagio returns to earned results',()=>{
 let p=fresh();const visited=[];
 for(let i=0;i<6;i++){
  p=collectInvitation(p);visited.push(ROUTE[p.active.stageIndex]);p=clear(p);
  if(i<5)p=choosePerk(p,null);
 }
 assert.deepEqual(visited,['smf-living-room','smf-fractal','smf-grove','smf-amp','smf-pagoda','smf-village']);
 assert.deepEqual(p.discoveries,['rabbit-hole','secret-garden','amp-backstage','ikigai-mori','villagio']);
 assert.equal(p.active.status,'results');assert.equal(p.active.cleared,6);assert.equal(p.active.score,600);
 assert.equal(p.progress.totals.festivals,1);assert.equal(p.active.summary.bonusId,'villagio');
 const result=structuredClone(p.active);
 p=beginBonus(p,'villagio','final-putt');assert.equal(p.active.bonus.returnTo,'results');
 assert.equal(closeResults(p),p);
 p=returnBonus(finishBonus(p,{won:true}));
 assert.equal(p.active.status,'results');assert.equal(p.active.stageIndex,5);assert.equal(p.active.score,result.score);
 assert.equal(p.active.cleared,6);assert.equal(choosePerk(p,'boots'),p);
 assert.equal(p.progress.totals.festivals,1);
 p=closeResults(p);assert.equal(p.active,null);
 assert.deepEqual(p.lastResult,{id:'tour-one',mode:'festival',scoringVersion:'smf-v3',challenge:'been-around',score:600,cleared:6,completed:true});
});

test('voluntary finish discards current live progress and pending invitations',()=>{
 let p=choosePerk(clear(fresh()),null);p=collectInvitation(p);
 p.active.scene={round:{score:9999,pickups:999},player:{x:10,y:20}};
 const finished=endFestival(p);
 assert.equal(finished.active.status,'results');assert.equal(finished.active.score,100);assert.equal(finished.active.cleared,1);
 assert.equal(finished.active.scene,null);assert.equal(finished.active.pendingInvitation,false);
 assert.deepEqual(finished.discoveries,[]);assert.equal(finished.progress.xp,96);
 assert.equal(endFestival(finished),finished);
 assert.equal(closeResults(fresh()).active.status,'playing');
});

test('exported bonus metadata resolves every parent and permanent prize exactly once',()=>{
 assert.equal(new Set(BONUSES.map(b=>b.id)).size,5);assert.equal(new Set(BONUSES.map(b=>b.reward.id)).size,5);
 for(const b of BONUSES){
  assert.ok(ROUTE.includes(b.parentId));assert.equal(b.stageId,`smf-${b.id}`);
  assert.ok(b.name&&b.reward.name);assert.ok(['visit','challenge'].includes(b.kind));
 }
});
