import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  HAT_WIDTH,
  HAT_HEIGHT,
} from './constants.js';

var TO_RADIANS = Math.PI / 180;

export default class Hat {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.ySpeed = -10;
    const direction = Math.round(Math.random()) * 2 - 1; // -1 (left) or 1 (right)
    this.xSpeed = direction * 8;
    this.rotation = direction * (Math.floor(Math.random() * 5) + 20);
    this.angle = 0;
  }

  update(x, y, isDead) {
    if (!isDead) {
      this.x = x;
      this.y = y;
    } else {
      this.ySpeed = Math.min(this.ySpeed + 0.5, 20);
      this.xSpeed *= 0.95;
      if (Math.abs(this.xSpeed) < 0.1) this.xSpeed = 0;
      this.angle += this.rotation;
      this.rotation *= 0.97;

      this.x += this.xSpeed;
      this.y += this.ySpeed;
    }
  }

  draw(context) {
    context.fillStyle = '#666';
    context.translate(this.x + PLAYER_WIDTH / 2, this.y + HAT_HEIGHT / 2);
    context.rotate(this.angle * TO_RADIANS);
    context.translate(0, HAT_HEIGHT / 2);
    context.fillRect(-PLAYER_WIDTH / 2, -HAT_HEIGHT, PLAYER_WIDTH, HAT_HEIGHT);
    context.fillRect(
      -HAT_WIDTH / 2,
      -HAT_HEIGHT / 4,
      HAT_WIDTH,
      HAT_HEIGHT / 4
    );
    context.fillRect(
      -HAT_WIDTH / 2,
      (-3 * HAT_HEIGHT) / 4,
      HAT_WIDTH / 14,
      HAT_HEIGHT / 2
    );
    context.fillRect(
      HAT_WIDTH / 2 - HAT_WIDTH / 14,
      (-3 * HAT_HEIGHT) / 4,
      HAT_WIDTH / 14,
      HAT_HEIGHT / 2
    );
    context.setTransform(1, 0, 0, 1, 0, 0);
  }
}
