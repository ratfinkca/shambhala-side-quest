import { awardClosePass, createEncounter, crowdPosition, updateEncounter } from './festival.js';

const CLOTHES = [0xb59bdd, 0xdd9d83, 0x87bacc, 0xd09bb7, 0xa1b58a];

export class Crowd {
  constructor(scene) {
    this.scene = scene;
    this.people = Array.from({ length: 10 }, (_, index) => {
      const node = scene.add.container(0, 0).setDepth(15);
      const ring = scene.add.circle(0, 0, 42).setStrokeStyle(1, 0xbad9c5, .16).setAlpha(0);
      node.add(ring);
      node.add(scene.add.ellipse(0, 13, 29, 11, 0x031619, .45));
      const body = scene.add.graphics();
      const color = CLOTHES[index % CLOTHES.length];
      body.lineStyle(3, 0x899c9a).lineBetween(-4, 9, -6, 17).lineBetween(4, 9, 6, 17);
      body.fillStyle(color).fillRoundedRect(-7, -5, 14, 18, 4);
      body.lineStyle(3, color).lineBetween(-6, -1, -13, -9).lineBetween(6, -1, 13, -9);
      body.fillStyle(index % 2 ? 0xb98467 : 0xe3b396).fillCircle(0, -11, 6);
      if (index % 3 === 0) {
        body.fillStyle(0x525578).fillEllipse(0, -15, 20, 6).fillRoundedRect(-6, -21, 12, 7, 3);
      } else if (index % 3 === 1) {
        body.fillStyle(0x544853).fillCircle(0, -17, 6);
      } else {
        body.lineStyle(3, 0xb2c7c0).lineBetween(-6, -12, 6, -12);
      }
      if (index === 3 || index === 7) {
        body.lineStyle(2, 0x9ba790).lineBetween(13, -8, 13, -44);
        body.lineStyle(2, color).strokeCircle(13, -47, 7);
        body.lineStyle(1, color).lineBetween(13, -53, 13, -41).lineBetween(13, -46, 8, -42).lineBetween(13, -46, 18, -42);
      }
      node.add(body);
      return { node, body, ring, encounter: createEncounter() };
    });
    this.reset();
  }

  reset() {
    this.people.forEach((person, index) => {
      const position = crowdPosition(index, 0);
      person.node.setPosition(position.x, position.y);
      person.body.setRotation(0);
      person.ring.setAlpha(0);
      person.encounter = createEncounter();
    });
    this.lastBumpAt = -Infinity;
  }

  update(player, round, reducedMotion) {
    const elapsed = 60000 - round.remainingMs;
    this.people.forEach((person, index) => {
      const position = crowdPosition(index, elapsed);
      person.node.setPosition(position.x, position.y);
      person.body.rotation = reducedMotion ? 0 : Math.sin(elapsed * .005 + index) * .14;
      const distance = Math.hypot(player.x - position.x, player.y - position.y);
      person.ring.setAlpha(distance < 100 ? .7 : 0);
      const encounter = updateEncounter(person.encounter, player, position, elapsed);
      if (encounter.bumped) {
        round.slowedMs = 600;
        person.ring.setStrokeStyle(2, 0xf2b59b, .45);
        if (elapsed - this.lastBumpAt > 1600) {
          this.scene.game.events.emit('round:bump');
          this.lastBumpAt = elapsed;
        }
      } else person.ring.setStrokeStyle(1, 0xbad9c5, .16);
      if (encounter.closePass) {
        const points = awardClosePass(round);
        this.scene.effect(position.x, position.y, 0x93ffd6, points, false, `SMOOTH +${points}`);
        this.scene.game.events.emit('round:closepass', { points });
      }
    });
  }
}
