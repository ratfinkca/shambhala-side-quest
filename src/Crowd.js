import {getTiming,roundTiming,elapsedMs} from './stage-clock.js';
import {createAvatar,setOutfit,animateAvatar} from './Avatar.js';
import { STAGES } from './stages.js';
import {bassOffset} from './bass-motion.js';
import {cycleAt} from './festival.js';
import { applyBump, awardClosePass, createEncounter, crowdPosition, updateEncounter } from './festival.js';

const LOOKS=[['moth','flower'],['tiger','bucket'],['frog','headphones'],['cosmic','wizard'],['rainbow','cat'],['bee','none'],['patchwork','crown'],['skeleton','antenna']];
export function setCrowdOutfit(person,outfit,options={}){if(person?.avatar)setOutfit(person.avatar,outfit,options);person?.body?.clear?.();}

export class Crowd {
  constructor(scene) {
    this.scene = scene;
    this.configure(STAGES[0]);
  }
  configure(stage) {
    this.people?.forEach(p=>p.node.destroy());
    this.stage = stage;
    const scene = this.scene;
    this.people = Array.from({ length: stage.crowdAnchors.length }, (_, index) => {
      const node = scene.add.container(0, 0).setDepth(15);
      const ring = scene.add.circle(0, 0, 42).setStrokeStyle(1, 0xbad9c5, .16).setAlpha(0);
      node.add(ring);
      const smoothRings = [27, 37, 48].map(radius => scene.add.circle(0, 0, radius).setStrokeStyle(1.5, 0x93ffd6, .8));
      const smooth = scene.add.container(0, 0, smoothRings).setAlpha(0);
      node.add(smooth);
      node.add(scene.add.ellipse(0, 13, 29, 11, 0x031619, .45));
      // Keep the compatibility Graphics for bespoke bonus renderers while the
      // shared avatar carries the real layered pixel wardrobe.
      const body = scene.add.graphics();node.add(body);
      const [onesie,hat]=LOOKS[index%LOOKS.length];
      const avatar=createAvatar(scene,{onesie,hat,totem:index===3||index===7?'peace':'none',flair:'none'},{dancing:true,phase:index*173,skinTone:['light','medium','deep'][index%3]});
      node.add(avatar);
      return { id: `dancer-${index}`, node, body, avatar, ring, smooth, smoothAt: -Infinity, smoothStrength: 0, encounter: createEncounter() };
    });
    this.reset();
  }

  reset() {
    this.people.forEach((person, index) => {
      const position = crowdPosition(index, 0, this.stage.crowdAnchors);
      person.node.setPosition(position.x, position.y);
      person.body.setRotation(0);
      person.body.setPosition(0,0);
      person.avatar?.setPosition(0,0);
      if(person.avatar)animateAvatar(person.avatar,0,true);
      person.ring.setAlpha(0);
      person.smooth.setAlpha(0).setScale(1);
      person.smoothAt = -Infinity;
      person.encounter = createEncounter();
    });
    this.lastBumpAt = -Infinity;
  }

  restoreRecovery(encounters,elapsed,timing=getTiming()) {
    this.people.forEach((person,index)=>{const p=crowdPosition(index,elapsed,this.stage.crowdAnchors,this.stage.crowdSpeed??1,timing);person.node.setPosition(p.x,p.y);person.encounter=structuredClone(encounters[index]);if(person.avatar)animateAvatar(person.avatar,elapsed,true);});
  }

  update(player, round, reducedMotion) {
    const elapsed = elapsedMs(round),timing=roundTiming(round);
    return this.people.map((person, index) => {
      const position = crowdPosition(index, elapsed, this.stage.crowdAnchors,this.stage.crowdSpeed??1,timing);
      person.node.setPosition(position.x, position.y);
      person.body.rotation = 0;
      const shake=bassOffset(position,this.stage.obstacles,elapsed,cycleAt(elapsed,timing).phase,reducedMotion,timing);
      person.body.setPosition(Math.round(shake.x),Math.round(shake.y));
      person.avatar?.setPosition(Math.round(shake.x),Math.round(shake.y));
      if(person.avatar)animateAvatar(person.avatar,elapsed,reducedMotion,cycleAt(elapsed,timing).phase==='drop');
      const distance = Math.hypot(player.x - position.x, player.y - position.y);
      person.ring.setAlpha(distance < 100 ? .7 : 0);
      const encounter = updateEncounter(person.encounter, player, position, elapsed, this.scene.crowdEncounterMeasurement?.(index));
      if(encounter.contactStarted)this.scene.game.events.emit('round:contact',{runId:round.runId});
      if (applyBump(round, person.encounter, encounter)) {
        person.ring.setStrokeStyle(2, 0xf2b59b, .45);
        if (elapsed - this.lastBumpAt > 1600) {
          this.scene.game.events.emit('round:bump');
          this.lastBumpAt = elapsed;
        }
      } else person.ring.setStrokeStyle(1, 0xbad9c5, .16);
      if (encounter.closePass) {
        person.smoothAt = elapsed;
        person.smoothStrength = 1 - Math.min(21, Math.max(0, encounter.clearance)) / 21;
        const points = awardClosePass(round);
        this.scene.effect(position.x, position.y, 0x93ffd6, points, false, `SMOOTH +${points}`);
        this.scene.game.events.emit('round:closepass', { points,runId:round.runId,clearance:encounter.clearance });
      }
      // Round time freezes on pause and resets between stages: no orphaned tweens.
      const progress = Math.min(1, Math.max(0, (elapsed - person.smoothAt) / 650));
      person.smooth.setAlpha((.3 + person.smoothStrength * .5) * (1 - progress));
      person.smooth.setScale(reducedMotion ? 1 : 1 + progress * .14);
      // Report physical contact even when a shield or sound cooldown suppresses feedback.
      return { id: person.id, ...encounter, active: person.encounter.active };
    });
  }
}
