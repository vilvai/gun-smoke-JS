import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants.js';
import {
  STILL,
  ACCELERATING_RIGHT,
  ACCELERATING_LEFT,
  MOVING_RIGHT,
} from './movement_states.js';

import Particle from './particle.js';

const EMIT_INTERVAL = 3;

export default class ParticleSystem {
  constructor() {
    this.particles = [];
    this.emitCounter = EMIT_INTERVAL;
  }

  createJumpParticles(playerX, playerY) {
    const jumpParticleCount = 6;
    for (
      let direction = -0.99;
      direction < 0.99;
      direction += 2 / jumpParticleCount
    ) {
      this.particles.push(
        new Particle(
          playerX
            + PLAYER_WIDTH / 2
            + direction * PLAYER_WIDTH * (0.5 + Math.random() / 2),
          playerY + PLAYER_HEIGHT - 10 - Math.random() * 20,
          direction * (2 + Math.random() * 2),
          4 + Math.random() * 4
        )
      );
    }
  }

  createLandParticles(playerX, playerY, ySpeed) {
    const force = ySpeed ** 2;
    const landingParticleCount = Math.floor(force / 40);
    for (
      let direction = -0.99;
      direction < 0.99;
      direction += 2 / landingParticleCount
    ) {
      this.particles.push(
        new Particle(
          playerX
            + PLAYER_WIDTH / 2
            + direction * PLAYER_WIDTH * (0.5 + Math.random() / 2),
          playerY + PLAYER_HEIGHT + 10 - Math.random() * 20,
          direction * (2 + Math.random() * 2),
          (-force / 40) * (0.5 + Math.random())
        )
      );
    }
  }

  update(playerX, playerY, isTouchingGround, movementType) {
    if (this.emitCounter <= 0 && movementType !== STILL && isTouchingGround) {
      this.createWalkingParticle(playerX, playerY, movementType);
    }
    this.emitCounter -= 1;

    this.particles.forEach(particle => particle.update());

    if (this.particles.length > 0) {
      this.particles = this.particles.filter(
        particle => particle.alpha >= 0.01
      );
    }
  }

  createWalkingParticle(playerX, playerY, movementType) {
    let direction;
    if (movementType === MOVING_RIGHT || movementType === ACCELERATING_RIGHT) {
      direction = 1;
    } else {
      direction = -1;
    }
    this.particles.push(
      new Particle(
        playerX
          + (direction === -1
            ? PLAYER_WIDTH - Math.random() * 10
            : Math.random() * 10),
        playerY + PLAYER_HEIGHT,
        -direction * 5,
        -1 - Math.random() * 4
      )
    );
    if (
      movementType === ACCELERATING_RIGHT
      || movementType === ACCELERATING_LEFT
    ) {
      this.emitCounter = EMIT_INTERVAL;
    } else {
      this.emitCounter = EMIT_INTERVAL * 4;
    }
  }

  draw(context) {
    this.particles.forEach(particle => particle.draw(context));
  }
}
