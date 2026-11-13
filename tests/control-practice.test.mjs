import test from 'node:test';
import assert from 'node:assert/strict';
import {controlPracticeRequested,startEdition} from '../src/editions/registry.js';

test('movement lab requires DEV SMF rehearsal, including forced routing flags',async()=>{
 for(const DEV of [true,false])for(const VITE_EDITION of ['smf','generic'])for(const search of ['','?controls','?rehearsal','?rehearsal&controls']){
  assert.equal(controlPracticeRequested({DEV,VITE_EDITION},search),DEV&&VITE_EDITION==='smf'&&search==='?rehearsal&controls');
 }
 for(const [env,expected] of [[{DEV:true,VITE_EDITION:'smf'},'controls'],[{DEV:false,VITE_EDITION:'smf'},'tour'],[{DEV:true,VITE_EDITION:'generic'},'game']]){
  const calls=[];
  await startEdition(env,Object.fromEntries(['controls','tour','game'].map(k=>[k,()=>calls.push(k)])),{controlPractice:true});
  assert.deepEqual(calls,[expected]);
 }
});
