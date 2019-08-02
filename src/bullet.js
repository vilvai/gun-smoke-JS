import {
  BULLET_SPEED,
  BULLET_DROP,
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
} from './constants.js';

export default class Bullet {
  constructor(x, y, angle, id) {
    this.x = x;
    this.y = y;
    this.xSpeed = Math.cos(angle) * BULLET_SPEED;
    this.ySpeed = Math.sin(angle) * BULLET_SPEED;
    this.id = id;
  }

  update(onRemove, onHitPlayer, onHitPlatform, playerX, playerY, platforms) {
    this.ySpeed += BULLET_DROP;
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    if (
      this.x > GAME_WIDTH ||
      this.x < 0 ||
      this.y > GAME_HEIGHT ||
      this.y < 0
    ) {
      onRemove(this.id);
    } else if (
      this.x >= playerX &&
      this.y >= playerY &&
      this.x <= playerX + PLAYER_WIDTH &&
      this.y <= playerY + PLAYER_HEIGHT
    ) {
      const angle = -Math.atan2(this.xSpeed, this.ySpeed) + Math.PI / 2;
      onHitPlayer(this.x, this.y, angle, this.id);
      onRemove(this.id);
    }
    if (
      platforms.some(
        platform =>
          this.x >= platform.x &&
          this.y >= platform.y &&
          this.x <= platform.x + platform.width &&
          this.y <= platform.y + platform.height
      )
    ) {
      onHitPlatform(this.id);
    }
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, 3, 0, 2 * Math.PI);
    context.fillStyle = '#000';
    context.fill();
  }
}
