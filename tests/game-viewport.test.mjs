import test from 'node:test';
import assert from 'node:assert/strict';
import {phoneViewport,resizeGameViewport,playViewport,viewportRotated} from '../src/game-viewport.js';
test('immersive rotation distinguishes a phone turn from browser bar or keyboard height changes',()=>{
 const portrait=playViewport(390,844),landscape=playViewport(844,390);
 assert.deepEqual(portrait,{width:390,height:844,orientation:'portrait'});
 assert.equal(viewportRotated(portrait,landscape),true);
 assert.equal(viewportRotated(landscape,portrait),true);
 assert.equal(viewportRotated(portrait,playViewport(390,350)),false);
 assert.equal(viewportRotated(portrait,playViewport(390,800)),false);
 assert.equal(viewportRotated(null,portrait),false);
 assert.deepEqual(playViewport(390.9,844.8),portrait);
 assert.deepEqual(playViewport(NaN,0),{width:960,height:640,orientation:'landscape'});
});
test('phone camera auto covers both orientations while desktops keep the full floor',()=>{
 assert.equal(phoneViewport(390,844),true);assert.equal(phoneViewport(844,390),true);
 assert.equal(phoneViewport(1280,800),false);assert.equal(phoneViewport(1920,400),false);
});
test('real viewport changes cancel movement and putting aim once, unchanged HUD layouts never cancel input',()=>{
 const calls=[],game={scale:{gameSize:{width:960,height:640},setGameSize(width,height){this.gameSize={width,height};calls.push('size');}}};
 const scene={clearInput(){calls.push('input');},puttingView:{cancelAim(){calls.push('putt');}},playerCamera:{resize(){calls.push('camera');}}};
 assert.equal(resizeGameViewport(game,390,560,scene),true);assert.deepEqual(calls,['input','putt','size','camera']);
 assert.equal(resizeGameViewport(game,390.9,560.9,scene),false);assert.equal(calls.length,4);
 assert.equal(resizeGameViewport(game,NaN,560,scene),false);
 assert.equal(resizeGameViewport(game,820,270,scene),true);assert.equal(calls.length,8);
});
