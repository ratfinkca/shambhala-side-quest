import test from 'node:test';
import assert from 'node:assert/strict';
import {drawCandyColours} from '../src/candy-colours.js';
import {createRound,advanceRound} from '../src/game.js';
import {collectMystery} from '../src/mystery.js';
import {candyPreviewRoll} from '../src/rehearsal.js';
function commands(m,reduced=false){const list=[];const g=new Proxy({}, {get:(_,key)=>(...args)=>{list.push([key,...args]);return g;}});drawCandyColours(g,m,reduced);return list;}
const wave=(age=500,remaining=4500)=>({effect:'waves',effectMs:remaining,effectStartedAtMs:12000,elapsedMs:12000+age});
const alpha=list=>Math.max(0,...list.filter(([key])=>key==='fillStyle'||key==='lineStyle').map(c=>c.at(-1)));
test('Wavy Colours fades in and out, shifts gently, and draws nothing after expiry',()=>{
 const full=commands(wave());assert.ok(alpha(full)>.1&&alpha(full)<=.2);
 assert.ok(alpha(commands(wave(100,4900)))<alpha(full));
 assert.ok(alpha(commands(wave(4800,200)))<alpha(full));
 assert.notDeepEqual(commands(wave(500)),commands(wave(1500,3500)));
 assert.deepEqual(commands(wave(5000,0)),[]);assert.deepEqual(commands({...wave(),effect:'dizzy'}),[]);
 assert.ok(full.length<50);for(const command of full)for(const value of command.slice(1))if(Array.isArray(value)){assert.ok(value.length<=66);assert.ok(value.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));}
});
test('Candy lab selects real collector outcomes and rejects unknown fixtures',()=>{
 for(const effect of ['speed','dizzy','waves']){const r=createRound();r.mystery.phase='available';assert.equal(collectMystery(r,()=>candyPreviewRoll(effect)),effect);}
 assert.equal(candyPreviewRoll('invalid'),null);assert.equal(candyPreviewRoll('constructor'),null);
});
test('reduced-motion colours are static and effect age comes from active round time',()=>{
 assert.deepEqual(commands(wave(500),true),commands(wave(3500,1500),true));
 const r=createRound({candyDurationMs:7000});r.mystery.phase='available';r.mystery.elapsedMs=12000;
 collectMystery(r,()=>.9);assert.equal(r.mystery.effectStartedAtMs,12000);assert.equal(r.mystery.effectMs,7000);
 advanceRound(r,6999);assert.equal(r.mystery.effect,'waves');advanceRound(r,1);assert.equal(r.mystery.effect,null);
 assert.deepEqual(commands(r.mystery),[]);
});
