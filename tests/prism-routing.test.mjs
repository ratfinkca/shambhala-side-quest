import test from 'node:test';
import assert from 'node:assert/strict';
import {prismPracticeRequested,startEdition} from '../src/editions/registry.js';

test('Prism preview requires a local SMF rehearsal and cannot replace either production game',async()=>{
 const actions={prism:()=> 'prism',tour:()=> 'tour',game:()=> 'game'};
 for(const edition of ['smf','generic'])for(const dev of [true,false]){
  const env={DEV:dev,VITE_EDITION:edition},expected=dev&&edition==='smf';
  assert.equal(prismPracticeRequested(env,'?rehearsal&prism'),expected);
  assert.equal(prismPracticeRequested(env,'?prism'),false);
  assert.equal(prismPracticeRequested(env,'?rehearsal'),false);
  assert.equal(await startEdition(env,actions,{prismPractice:true}),expected?'prism':edition==='smf'?'tour':'game');
 }
});
