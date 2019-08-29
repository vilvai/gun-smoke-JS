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
    this.trail1X = x;
    this.trail1Y = y;
    this.trail2X = x;
    this.trail2Y = y;
    this.trail3X = x;
    this.trail3Y = y;
    this.xSpeed = Math.cos(angle) * BULLET_SPEED;
    this.ySpeed = Math.sin(angle) * BULLET_SPEED;
    this.id = id;
    this.removeTimer = -1;
  }

  setToBeRemoved() {
    this.removeTimer = 3;
  }

  update(onRemove, onHitPlayer, onHitPlatform, playerX, playerY, platforms) {
    this.ySpeed += BULLET_DROP;
    this.trail3X = this.trail2X;
    this.trail3Y = this.trail2Y;
    this.trail2X = this.trail1X;
    this.trail2Y = this.trail1Y;
    this.trail1X = this.x;
    this.trail1Y = this.y;
    if (this.removeTimer < 0) {
      this.x += this.xSpeed;
      this.y += this.ySpeed;
      this.checkForCollision(
        onRemove,
        onHitPlayer,
        onHitPlatform,
        playerX,
        playerY,
        platforms
      );
    } else {
      this.removeTimer -= 1;
    }
  }

  checkForCollision(
    onRemove,
    onHitPlayer,
    onHitPlatform,
    playerX,
    playerY,
    platforms
  ) {
    if (
      this.x > GAME_WIDTH
      || this.x < 0
      || this.y > GAME_HEIGHT
      || this.y < 0
    ) {
      onRemove(this.id);
    } else if (
      this.x >= playerX
      && this.y >= playerY
      && this.x <= playerX + PLAYER_WIDTH
      && this.y <= playerY + PLAYER_HEIGHT
    ) {
      const angle = -Math.atan2(this.xSpeed, this.ySpeed) + Math.PI / 2;
      onHitPlayer(angle, this.id);
    } else if (
      platforms.some(
        platform =>
          this.x >= platform.x
          && this.y >= platform.y
          && this.x <= platform.x + platform.width
          && this.y <= platform.y + platform.height
      )
    ) {
      onHitPlatform(this.id);
    }
  }

  draw(context) {
    this.drawBulletTrail(context);
    if (this.removeTimer < 0) this.drawBullet(context);
  }

  drawBulletTrail(context) {
    context.strokeStyle = '#eee';
    context.lineWidth = 3;
    context.globalAlpha = 0.1;
    context.beginPath();
    context.moveTo(this.trail3X, this.trail3Y);
    context.lineTo(this.trail2X, this.trail2Y);
    context.stroke();
    context.lineWidth = 4;
    context.globalAlpha = 0.2;
    context.beginPath();
    context.moveTo(this.trail2X, this.trail2Y);
    context.lineTo(this.trail1X, this.trail1Y);
    context.stroke();
    context.lineWidth = 4;
    context.globalAlpha = 0.3;
    context.beginPath();
    context.moveTo(this.trail1X, this.trail1Y);
    context.lineTo(this.x, this.y);
    context.stroke();
    context.globalAlpha = 1;
  }

  drawBullet(context) {
    context.globalCompositeOperation = 'multiply';
    const bulletLength = 8;
    const bulletWidth = 5;
    const bulletColor = '#b89051';

    const scale = bulletLength / Math.sqrt(this.xSpeed ** 2 + this.ySpeed ** 2);
    const scaledX = this.xSpeed * scale;
    const scaledY = this.ySpeed * scale;
    context.strokeStyle = bulletColor;
    context.lineWidth = bulletWidth;
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + scaledX, this.y + scaledY);
    context.stroke();
    context.beginPath();
    context.arc(
      this.x + scaledX,
      this.y + scaledY,
      bulletWidth / 2,
      0,
      2 * Math.PI
    );
    context.fillStyle = bulletColor;
    context.fill();
    context.globalCompositeOperation = 'source-over';
  }
}
