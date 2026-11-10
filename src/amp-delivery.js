/** A disposable delivery visit. All fields survive a JSON round trip. */
export function createDelivery({recipientIds, goal = 3}) {
  return {
    carrying: false,
    delivered: 0,
    goal,
    recipientId: recipientIds[0] ?? null,
    complete: false,
    recipientIds: [...recipientIds],
    atVendor: false,
    blockedEncounterIds: [],
    passEventIds: [],
  };
}

/**
 * Apply one whole crowd update, returning at most one item/reward event.
 * `bumped` means physical contact, independent of score penalties or shields.
 * `active` describes the encounter after this update, including false on exit.
 */
export function stepDelivery(state, {atVendor = false, encounters = []}) {
  if (state.complete) return null;

  const enteringVendor = Boolean(atVendor) && !state.atVendor;
  state.atVendor = Boolean(atVendor);

  // Keep the old block set for this frame: an exiting stale encounter can
  // report closePass and active:false together, and must still be ignored.
  const blocked = new Set(state.blockedEncounterIds);
  const activeIds = new Set(encounters.filter(encounter => encounter.active).map(encounter => encounter.id));
  state.blockedEncounterIds = state.blockedEncounterIds.filter(id => activeIds.has(id));
  // A repeated closePass pulse is still the same event, even across pickup.
  const previousPassIds = new Set(state.passEventIds);
  state.passEventIds = [...new Set(encounters.filter(encounter => encounter.closePass).map(encounter => encounter.id ?? null))];

  if (state.carrying) {
    // Resolve contact across the entire batch before looking at any passes.
    // Stale handoff protection never makes physical contact safe.
    const bump = encounters.find(encounter => encounter.bumped);
    if (bump) {
      state.carrying = false;
      return {type: 'dropped', dancerId: bump.id ?? null, recipientId: state.recipientId};
    }

    const pass = encounters.find(encounter => encounter.closePass
      && !blocked.has(encounter.id) && !previousPassIds.has(encounter.id ?? null));
    if (!pass) return null;
    state.carrying = false;
    if (pass.id == null || pass.id !== state.recipientId) {
      return {type: 'wrong', dancerId: pass.id ?? null, recipientId: state.recipientId};
    }

    state.delivered += 1;
    state.complete = state.delivered >= state.goal;
    state.recipientId = state.complete ? null : state.recipientIds[state.delivered % state.recipientIds.length];
    return {
      type: state.complete ? 'complete' : 'delivered',
      dancerId: pass.id,
      recipientId: state.recipientId,
      delivered: state.delivered,
    };
  }

  if (enteringVendor) {
    state.carrying = true;
    state.blockedEncounterIds = [...activeIds].filter(id => id != null);
    return {type: 'pickup', recipientId: state.recipientId};
  }
  return null;
}
