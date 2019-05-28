import {
  BULLET_SPEED,
  BULLET_DROP,
  GAME_WIDTH,
  GAME_HEIGHT,
} from './constants.js';

export default class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.xSpeed = Math.cos(angle) * BULLET_SPEED;
    this.ySpeed = Math.sin(angle) * BULLET_SPEED;
  }

  update(onRemove) {
    this.ySpeed += BULLET_DROP;
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    if (this.x > GAME_WIDTH || this.x < 0 || this.y > GAME_HEIGHT || this.y < 0)
      onRemove(this);
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, 3, 0, 2 * Math.PI);
    context.fillStyle = '#000';
    context.fill();
  }
}
