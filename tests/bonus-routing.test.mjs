import test from 'node:test';
import assert from 'node:assert/strict';
import {bonusPracticeRequested,startEdition} from '../src/editions/registry.js';
test('bonus URL is recognised only for four explicit DEV SMF rehearsals',()=>{
 for(const id of ['rabbit-hole','secret-garden','ikigai-mori','villagio']){
  const url=`?rehearsal&bonus=${id}`;
  assert.equal(bonusPracticeRequested({DEV:true,VITE_EDITION:'smf'},url),true);
  assert.equal(bonusPracticeRequested({DEV:false,VITE_EDITION:'smf'},url),false);
  assert.equal(bonusPracticeRequested({DEV:true,VITE_EDITION:'generic'},url),false);
 }
 for(const url of ['?bonus=rabbit-hole','?rehearsal&bonus=unknown','?rehearsal&bonus='])assert.equal(bonusPracticeRequested({DEV:true,VITE_EDITION:'smf'},url),false);
});
test('even a forged bonus routing flag cannot enter production or generic preview',async()=>{
 const actions={bonus:()=> 'bonus',game:()=> 'game',scaffold:()=> 'scaffold'};
 assert.equal(await startEdition({DEV:true,VITE_EDITION:'smf'},actions,{bonusPractice:true}),'bonus');
 assert.equal(await startEdition({DEV:false,VITE_EDITION:'smf'},actions,{bonusPractice:true}),'scaffold');
 assert.equal(await startEdition({DEV:true},actions,{bonusPractice:true}),'game');
});
