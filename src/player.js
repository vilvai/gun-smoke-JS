import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_ACCELERATION,
  PLAYER_DRAG,
  PLAYER_MAX_X_SPEED,
  PLAYER_MAX_Y_SPEED,
  PLAYER_JUMP_POWER,
  PLAYER_GRAVITY,
  PLAYER_ARM_LENGTH,
  PLAYER_ARM_WIDHT,
} from './player_constants.js';

export class GenericPlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getArmStartX() {
    return this.x + PLAYER_WIDTH / 2;
  }

  getArmStartY() {
    return this.y + PLAYER_HEIGHT / 2;
  }

  update({ x, y, angle }) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  draw(context) {
    context.fillStyle = '#000';
    context.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);

    if (this.angle) {
      const armEndX = Math.cos(this.angle) * PLAYER_ARM_LENGTH;
      const armEndY = Math.sin(this.angle) * PLAYER_ARM_LENGTH;

      context.lineWidth = PLAYER_ARM_WIDHT;
      context.strokeStyle = '#000';
      context.beginPath();
      context.moveTo(this.getArmStartX(), this.getArmStartY());
      context.lineTo(
        this.getArmStartX() + armEndX,
        this.getArmStartY() + armEndY
      );
      context.stroke();
      const gunImage = new Image();
      gunImage.src = 'images/gun.png';
      context.rotate(2);
      context.drawImage(gunImage, this.x, this.y);
    }
  }
}

export default class Player extends GenericPlayer {
  constructor(x, y) {
    super(x, y);
    this.xSpeed = 0;
    this.ySpeed = 0;
  }

  update(keys, platforms, mouseX, mouseY) {
    const collisions = this.collision(platforms);
    if (keys.D) {
      this.moveRight(collisions);
    } else if (keys.A) {
      this.moveLeft(collisions);
    } else if (collisions[0]) {
      this.xSpeed *= 1 - PLAYER_DRAG;
      if (Math.abs(this.xSpeed) < 0.1) this.xSpeed = 0;
    } else {
      this.xSpeed *= 1 - PLAYER_DRAG / 8;
    }
    if (Math.abs(this.xSpeed) < 0.1) this.xSpeed = 0;
    if (keys.W) {
      this.jump(collisions);
    }
    if (keys.S) {
      this.drop(collisions);
    }

    this.ySpeed = Math.min(this.ySpeed + PLAYER_GRAVITY, PLAYER_MAX_Y_SPEED);
    if (collisions[0] && this.ySpeed > 0) {
      this.y = collisions[0].y - PLAYER_HEIGHT;
      this.ySpeed = 0;
    }
    if (collisions[1] && this.ySpeed < 0) {
      this.y = collisions[1].y + collisions[1].height;
      this.ySpeed = 0;
    }
    if (collisions[2] && this.xSpeed > 0) {
      this.x = collisions[2].x - PLAYER_WIDTH;
      this.xSpeed = 0;
    }
    if (collisions[3] && this.xSpeed < 0) {
      this.x = collisions[3].x + collisions[3].width;
      this.xSpeed = 0;
    }
    this.y += this.ySpeed;
    this.x += this.xSpeed;

    if (this.y > 1500) {
      this.y = -PLAYER_HEIGHT;
    }

    const deltaX = mouseX - this.getArmStartX();
    const deltaY = mouseY - this.getArmStartY();

    this.angle = -Math.atan2(deltaX, deltaY) + Math.PI / 2;
  }

  moveRight(collisions) {
    if (collisions[0] && this.xSpeed < 0) this.xSpeed /= 4;
    this.xSpeed = Math.min(
      Math.max(-PLAYER_MAX_X_SPEED, this.xSpeed + PLAYER_ACCELERATION),
      PLAYER_MAX_X_SPEED
    );
  }

  moveLeft(collisions) {
    if (collisions[0] && this.xSpeed > 0) this.xSpeed /= 4;
    this.xSpeed = Math.min(
      Math.max(-PLAYER_MAX_X_SPEED, this.xSpeed - PLAYER_ACCELERATION),
      PLAYER_MAX_X_SPEED
    );
  }

  jump(collisions) {
    if (collisions[0] && this.ySpeed == 0) {
      this.ySpeed = -PLAYER_JUMP_POWER;
    } else if (collisions[2] && this.xSpeed > 0) {
      this.ySpeed = -PLAYER_JUMP_POWER;
      this.xSpeed = -PLAYER_MAX_X_SPEED;
    } else if (collisions[3] && this.xSpeed < 0) {
      this.ySpeed = -PLAYER_JUMP_POWER;
      this.xSpeed = PLAYER_MAX_X_SPEED;
    }
  }

  drop(collisions) {
    if (collisions[0] && this.ySpeed == 0) {
      if (!collisions[0].hasCollision) {
        collisions[0] = false;
      }
    }
  }

  collision(platforms) {
    const bottom = this.y + PLAYER_HEIGHT;
    const top = this.y;
    const left = this.x;
    const right = this.x + PLAYER_WIDTH;
    const collisions = [false, false, false, false];

    platforms.forEach(i => {
      if (
        i.x < right &&
        left < i.x + i.width &&
        i.y <= bottom + this.ySpeed &&
        bottom + this.ySpeed <= i.y + i.height
      ) {
        if (
          !(
            i.x < right &&
            left < i.x + i.width &&
            i.y < bottom &&
            bottom < i.y + i.height
          )
        ) {
          collisions[0] = i; // bottom collision
        }
      }
      if (
        i.x < right &&
        left < i.x + i.width &&
        top + this.ySpeed <= i.y + i.height &&
        i.y <= top + this.ySpeed
      ) {
        if (i.hasCollision) collisions[1] = i; // top collision
      }
      if (
        i.x <= right + this.xSpeed &&
        right + this.xSpeed <= i.x + i.width &&
        i.y < bottom &&
        top < i.y + i.height
      ) {
        if (i.hasCollision) collisions[2] = i; // right collision
      }
      if (
        i.x <= left + this.xSpeed &&
        left + this.xSpeed <= i.x + i.width &&
        i.y < bottom &&
        top < i.y + i.height
      ) {
        if (i.hasCollision) collisions[3] = i; // left collision
      }
    });
    if (
      collisions[0] &&
      (collisions[0] == collisions[2] || collisions[0] == collisions[3])
    ) {
      collisions[0] = false;
    } else if (
      collisions[1] &&
      (collisions[1] == collisions[2] || collisions[1] == collisions[3])
    ) {
      collisions[1] = false;
    }
    return collisions;
  }
}
