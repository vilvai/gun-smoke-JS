import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants.js';
import {
  STILL,
  ACCELERATING_RIGHT,
  ACCELERATING_LEFT,
  MOVING_RIGHT,
  MOVING_LEFT,
} from './movement_states.js';

const EMIT_INTERVAL = 3;

export default class ParticleSystem {
  constructor() {
    this.particles = [];
    this.emitCounter = EMIT_INTERVAL;
  }

  update(playerX, playerY, isTouchingGround, movementType) {
    if (this.emitCounter <= 0 && movementType !== STILL && isTouchingGround) {
      const random = Math.random();
      const direction =
        movementType === MOVING_RIGHT || movementType == ACCELERATING_RIGHT
          ? 1
          : -1;
      this.particles.push({
        random,
        startX:
          playerX +
          (direction === -1 ? PLAYER_WIDTH - random * 20 : random * 20),
        startY: playerY + PLAYER_HEIGHT,
        direction,
        time: 1,
      });
      if (
        movementType === ACCELERATING_RIGHT ||
        movementType == ACCELERATING_LEFT
      )
        this.emitCounter = EMIT_INTERVAL;
      else this.emitCounter = EMIT_INTERVAL * 4;
    }
    if (this.particles.length > 0)
      this.particles = this.particles
        .map(particle => {
          const { startX, startY, time, direction, random } = particle;
          return {
            startX,
            startY,
            direction,
            random,
            x: startX + Math.log(time) * -direction * (5 + random * 6),
            y: startY - Math.log(time) * (1 + random * 6),
            alpha: 0.9 ** time,
            scale: 0.25 + Math.log(time) / 3,
            time: time + 1,
          };
        })
        .filter(particle => particle.alpha >= 0.01);
    this.emitCounter -= 1;
  }

  draw(context, player) {
    this.particles.forEach(particle => {
      context.fillStyle = '#bd9268';
      context.globalAlpha = particle.alpha;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.scale * 10, 0, 2 * Math.PI);
      context.fill();
      context.globalAlpha = 1;
    });
  }
}
