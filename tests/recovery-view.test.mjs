import test from 'node:test';import assert from 'node:assert/strict';import {renderRecovery} from '../src/recovery-view.js';import {makeRecovery,readRecovery} from '../src/recovery.js';import {recoveryFixture} from './helpers/recovery-fixtures.mjs';
test('recovery prompt leads with explicit resume and clear partial points/time; discard is a separate confirmation',()=>{
 const state=readRecovery(makeRecovery(recoveryFixture())),html=renderRecovery('recovery',state);assert.match(html,/Resume run/);assert.match(html,/44s/);assert.match(html,/20/);assert.match(html,/Discard run/);assert.doesNotMatch(html,/data-action="start"/);
 const confirm=renderRecovery('discardRecovery',state);assert.match(confirm,/Keep my run/);assert.match(confirm,/Discard this run/);assert.doesNotMatch(confirm,/data-action="recover-resume"/);
 assert.match(renderRecovery('recoveryBusy',null),/another tab/);assert.doesNotMatch(renderRecovery('recoveryInvalid',{code:'invalid'}),/Resume run/);
});
