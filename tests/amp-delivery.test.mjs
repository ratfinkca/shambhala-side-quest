import test from 'node:test';
import assert from 'node:assert/strict';
import {createDelivery, stepDelivery} from '../src/amp-delivery.js';

const recipientIds = ['dancer-0', 'dancer-1', 'dancer-2'];
const visit = (options = {}) => createDelivery({recipientIds, ...options});
const encounter = (id, options = {}) => ({id, bumped: false, closePass: false, active: false, ...options});
const pass = id => encounter(id, {closePass: true});
const step = (state, encounters = [], atVendor = false) => stepDelivery(state, {atVendor, encounters});
const pickup = state => step(state, [], true);
function replacement(state) {
  step(state);
  return pickup(state);
}

test('a fresh visit starts empty with its first order and three deliveries to earn', () => {
  const state = visit();
  assert.equal(state.carrying, false);
  assert.equal(state.delivered, 0);
  assert.equal(state.goal, 3);
  assert.equal(state.recipientId, 'dancer-0');
  assert.equal(state.complete, false);
  assert.deepEqual(pickup(state), {type: 'pickup', recipientId: 'dancer-0'});
  assert.equal(state.carrying, true);
});

test('empty-handed passes and physical bumps have no delivery effect', () => {
  const state = visit();
  assert.equal(step(state, [pass('dancer-0'), encounter('dancer-2', {bumped: true, active: true})]), null);
  assert.equal(state.carrying, false);
  assert.equal(state.delivered, 0);
  assert.equal(state.recipientId, 'dancer-0');
});

test('only a correct clean pass consumes the item and advances the order', () => {
  const state = visit();
  pickup(state);
  assert.equal(step(state, [encounter('dancer-0', {active: true})]), null);
  assert.equal(state.carrying, true);
  assert.deepEqual(step(state, [pass('dancer-0')]), {
    type: 'delivered', dancerId: 'dancer-0', recipientId: 'dancer-1', delivered: 1,
  });
  assert.equal(state.carrying, false);
  assert.equal(state.delivered, 1);
  assert.equal(state.recipientId, 'dancer-1');
});

for (const id of ['dancer-2', 'ordinary-dancer', undefined, null]) {
  test(`a wrong or unidentified pass consumes the item without rerolling the order (${id})`, () => {
    const state = visit();
    pickup(state);
    const event = step(state, [pass(id)]);
    assert.equal(event.type, 'wrong');
    assert.equal(event.dancerId, id ?? null);
    assert.equal(event.recipientId, 'dancer-0');
    assert.equal(state.carrying, false);
    assert.equal(state.delivered, 0);
    assert.equal(state.recipientId, 'dancer-0');
    assert.deepEqual(replacement(state), {type: 'pickup', recipientId: 'dancer-0'});
  });
}

test('physical contact drops the sandwich even when a shield suppresses the ordinary penalty', () => {
  const state = visit();
  pickup(state);
  // bumped is physical contact; the delivery rules never consult shield/penalty fields.
  const contact = {...encounter('dancer-0', {bumped: true, active: true}), shielded: true, penalty: 0};
  assert.deepEqual(step(state, [contact]), {type: 'dropped', dancerId: 'dancer-0', recipientId: 'dancer-0'});
  assert.equal(state.carrying, false);
  assert.equal(state.delivered, 0);
  assert.equal(state.recipientId, 'dancer-0');
  assert.equal(step(state, [contact]), null);
});

for (const bumpFirst of [true, false]) {
  test(`a simultaneous bump beats a correct pass with the bump ${bumpFirst ? 'first' : 'last'}`, () => {
    const state = visit();
    pickup(state);
    const bump = encounter('ordinary-dancer', {bumped: true, active: true});
    const clean = pass('dancer-0');
    const event = step(state, bumpFirst ? [bump, clean] : [clean, bump]);
    assert.equal(event.type, 'dropped');
    assert.equal(event.dancerId, 'ordinary-dancer');
    assert.equal(state.delivered, 0);
    assert.equal(state.recipientId, 'dancer-0');
  });
}

test('a record reporting both contact and a clean pass is a drop', () => {
  const state = visit();
  pickup(state);
  assert.equal(step(state, [encounter('dancer-0', {bumped: true, closePass: true})]).type, 'dropped');
  assert.equal(state.delivered, 0);
});

test('one sandwich resolves only once when multiple passes complete together', () => {
  const state = visit();
  pickup(state);
  assert.equal(step(state, [pass('dancer-0'), pass('dancer-1'), pass('dancer-2')]).type, 'delivered');
  assert.equal(state.delivered, 1);
  assert.equal(state.recipientId, 'dancer-1');
  assert.equal(state.carrying, false);
  assert.equal(step(state, [pass('dancer-0'), pass('dancer-1')]), null);
});

test('a first wrong pass consumes the item before any other same-frame handoff', () => {
  const state = visit();
  pickup(state);
  assert.equal(step(state, [pass('ordinary-dancer'), pass('dancer-0')]).type, 'wrong');
  assert.equal(state.delivered, 0);
  assert.equal(state.carrying, false);
});

test('vendor pickup requires re-entry and never occurs on an item-resolution frame', () => {
  const state = visit();
  pickup(state);
  assert.equal(step(state, [], true), null);
  step(state); // Leave carrying the first sandwich.
  assert.equal(step(state, [pass('ordinary-dancer')], true).type, 'wrong');
  assert.equal(state.carrying, false);
  assert.equal(step(state, [], true), null);
  assert.equal(state.carrying, false);
  assert.equal(replacement(state).type, 'pickup');
  assert.equal(state.carrying, true);
});

test('remaining in the vendor zone after a drop cannot refill the sandwich', () => {
  const state = visit();
  pickup(state);
  assert.equal(step(state, [encounter('dancer-2', {bumped: true})], true).type, 'dropped');
  assert.equal(step(state, [], true), null);
  assert.equal(state.carrying, false);
  assert.equal(replacement(state).type, 'pickup');
});

test('an encounter active at pickup is ignored through its finishing frame', () => {
  const state = visit();
  assert.equal(step(state, [encounter('dancer-0', {active: true})], true).type, 'pickup');
  assert.equal(step(state, [encounter('dancer-0', {active: true})]), null);
  assert.equal(step(state, [pass('dancer-0')]), null);
  assert.equal(state.carrying, true);
  assert.equal(state.delivered, 0);
  step(state, [encounter('dancer-0', {active: true})]);
  assert.equal(step(state, [pass('dancer-0')]).type, 'delivered');
});

test('stale ordinary passes cannot steal a newly picked-up sandwich', () => {
  const state = visit();
  step(state, [encounter('ordinary-dancer', {active: true})], true);
  assert.equal(step(state, [pass('ordinary-dancer')]), null);
  assert.equal(state.carrying, true);
  assert.equal(step(state, [pass('dancer-0')]).type, 'delivered');
});

test('repeating a stale finishing event cannot turn it into a fresh delivery', () => {
  const state = visit();
  step(state, [encounter('dancer-0', {active: true})], true);
  const finishing = pass('dancer-0');
  assert.equal(step(state, [finishing]), null);
  assert.equal(step(state, [finishing]), null);
  assert.equal(state.carrying, true);
  step(state, [encounter('dancer-0', {active: true})]);
  assert.equal(step(state, [pass('dancer-0')]).type, 'delivered');
});

test('repeating a pass across vendor pickup cannot consume the replacement', () => {
  const state = visit();
  pickup(state);
  const wrongPass = pass('ordinary-dancer');
  assert.equal(step(state, [wrongPass]).type, 'wrong');
  assert.equal(step(state, [wrongPass], true).type, 'pickup');
  assert.equal(step(state, [wrongPass]), null);
  assert.equal(state.carrying, true);
  step(state, [encounter('ordinary-dancer', {active: true})]);
  assert.equal(step(state, [wrongPass]).type, 'wrong');
});

test('stale encounter protection does not excuse physical contact after pickup', () => {
  const state = visit();
  step(state, [encounter('dancer-0', {active: true})], true);
  assert.equal(step(state, [encounter('dancer-0', {bumped: true, active: true})]).type, 'dropped');
  assert.equal(state.delivered, 0);
});

test('passes finishing on the pickup frame cannot use the newly collected sandwich', () => {
  const state = visit();
  assert.equal(step(state, [pass('dancer-0')], true).type, 'pickup');
  assert.equal(state.carrying, true);
  assert.equal(state.delivered, 0);
});

test('both mistake types retain banked deliveries and the outstanding recipient', () => {
  const state = visit();
  pickup(state);
  step(state, [pass('dancer-0')]);
  replacement(state);
  assert.equal(step(state, [pass('dancer-2')]).type, 'wrong');
  assert.equal(state.delivered, 1);
  assert.equal(state.recipientId, 'dancer-1');
  replacement(state);
  assert.equal(step(state, [encounter('ordinary-dancer', {bumped: true})]).type, 'dropped');
  assert.equal(state.delivered, 1);
  assert.equal(state.recipientId, 'dancer-1');
  replacement(state);
  assert.equal(step(state, [pass('dancer-1')]).type, 'delivered');
  assert.equal(state.delivered, 2);
  assert.equal(state.recipientId, 'dancer-2');
});

test('the third correct handoff produces exactly one completion event and no further state changes', () => {
  const state = visit();
  pickup(state);
  step(state, [pass('dancer-0')]);
  replacement(state);
  step(state, [pass('dancer-1')]);
  replacement(state);
  assert.deepEqual(step(state, [pass('dancer-2')]), {
    type: 'complete', dancerId: 'dancer-2', recipientId: null, delivered: 3,
  });
  assert.equal(state.complete, true);
  assert.equal(state.carrying, false);
  assert.equal(state.delivered, 3);
  assert.equal(state.recipientId, null);
  const completed = JSON.stringify(state);
  assert.equal(step(state, [pass('dancer-2')], true), null);
  assert.equal(step(state), null);
  assert.equal(pickup(state), null);
  assert.equal(JSON.stringify(state), completed);
});

test('a custom goal completes at the configured number of handoffs', () => {
  const state = visit({goal: 1});
  pickup(state);
  assert.equal(step(state, [pass('dancer-0')]).type, 'complete');
  assert.equal(state.delivered, 1);
  assert.equal(state.complete, true);
});

test('serializing the visit retains the held sandwich and stale-encounter protection', () => {
  const state = visit();
  step(state, [encounter('dancer-0', {active: true})], true);
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(step(restored, [pass('dancer-0')]), null);
  assert.equal(restored.carrying, true);
  step(restored, [encounter('dancer-0', {active: true})]);
  assert.equal(step(restored, [pass('dancer-0')]).type, 'delivered');
});

test('creating a new visit clears previous progress, held state and vendor/encounter latches', () => {
  const oldVisit = visit({goal: 1});
  pickup(oldVisit);
  step(oldVisit, [pass('dancer-0')]);
  const state = visit();
  assert.equal(state.complete, false);
  assert.equal(state.delivered, 0);
  assert.equal(state.carrying, false);
  assert.equal(state.recipientId, 'dancer-0');
  assert.equal(pickup(state).type, 'pickup');
  assert.equal(step(state, [pass('dancer-0')]).type, 'delivered');
  assert.equal(oldVisit.complete, true);
  assert.equal(oldVisit.delivered, 1);
});
