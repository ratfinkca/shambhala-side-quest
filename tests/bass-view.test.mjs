import test from 'node:test';
import assert from 'node:assert/strict';
import {createBass,activateBass} from '../src/bass-head.js';
import {createRound} from '../src/game.js';
import {bassButtonState,activationInput,updateBassButton} from '../src/bass-view.js';
test('on-field meter exposes quarter/half/full spending and locks active or non-playing states',()=>{
 for(const [charge,enabled,phase,detail]of [[2499,false,'charging','24%'],[2500,true,'ready','1.5s'],[5000,true,'ready','3s'],[10000,true,'full','6s']]){
  const view=bassButtonState(createBass(charge),{playing:true,hasSpeakers:true});
  assert.equal(view.disabled,!enabled);assert.equal(view.phase,phase);assert.equal(view.detail,detail);assert.equal(view.hidden,false);
  if(enabled)assert.match(view.ariaLabel,/Activate/);
 }
 const r=createRound();r.bass.chargeMs=2500;activateBass(r);r.bass.activeMs=750;
 const active=bassButtonState(r.bass,{playing:true,hasSpeakers:true});assert.equal(active.disabled,true);assert.equal(active.phase,'active');assert.equal(active.progress,.5);
 for(const flags of [{playing:false,hasSpeakers:true},{playing:true,hasSpeakers:false}]){const s=bassButtonState(createBass(10000),flags);assert.equal(s.hidden,true);assert.equal(s.disabled,true);}
});
test('native button renders a consistent state and classifies touch, mouse and keyboard activation',()=>{
 const attrs={},properties={},classes=new Set(),detail={};
 const button={dataset:{},style:{setProperty:(k,v)=>properties[k]=v},setAttribute:(k,v)=>attrs[k]=v,querySelector:()=>detail,classList:{toggle:(k,on)=>on?classes.add(k):classes.delete(k)}};
 updateBassButton(button,createBass(5000),{playing:true,hasSpeakers:true});
 assert.equal(button.disabled,false);assert.equal(button.hidden,false);assert.equal(detail.textContent,'3s');assert.ok(classes.has('ready'));assert.equal(properties['--bass-angle'],'180deg');assert.match(attrs['aria-label'],/50%/);
 assert.equal(activationInput({detail:1,pointerType:'touch'}),'touch');
 assert.equal(activationInput({detail:1},'touch'),'touch');
 assert.equal(activationInput({detail:1,pointerType:'mouse'},'touch'),'mouse');
 assert.equal(activationInput({detail:0},'touch'),'keyboard');
});
