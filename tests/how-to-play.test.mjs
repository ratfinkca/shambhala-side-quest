import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderHowToPlay} from '../src/how-to-play.js';
import {createScreenState,transition} from '../src/screens.js';

test('shared help shows three essentials, chosen controls and optional details',()=>{
  const help=renderHowToPlay({startAction:'<button data-action="enter">Enter the dancefloor</button>',controls:{mode:'swipe'},tips:['<p>A deeper rule.</p>']});
  assert.equal((help.match(/class="how-to-essential"/g)??[]).length,3);
  assert.match(help,/Catch sparks/);
  assert.match(help,/Smooth pass/);
  assert.match(help,/Bass Head/);
  assert.match(help,/Swipe: make one continuous stroke/);
  assert.doesNotMatch(help,/Thumbstick: touch anywhere/);
  assert.match(help,/<details[^>]*>[\s\S]*A deeper rule\./);
  assert.match(help,/<p class="how-to-controls">Swipe and release to move\. WASD or arrows also work\./);
  assert.match(help,/data-action="enter"[\s\S]*data-action="show-demo"[\s\S]*class="how-to-essentials"/);
});

test('generic Help can be opened and dismissed without a run',()=>{
  const initial=createScreenState();
  const help=transition(initial,{type:'HELP'});
  assert.equal(help.name,'help');
  assert.deepEqual(transition(help,{type:'BACK'}),initial);
});
