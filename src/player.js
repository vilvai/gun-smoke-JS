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

export class OtherPlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  update({ x, y }) {
    this.x = x;
    this.y = y;
  }

  draw(context) {
    context.fillStyle = '#000';
    context.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
  }
}

export default class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.xSpeed = 0;
    this.ySpeed = 0;
  }

  getCenterX() {
    return this.x + PLAYER_WIDTH / 2;
  }

  getCenterY() {
    return this.y + PLAYER_HEIGHT / 2;
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

    this.mouseX = mouseX;
    this.mouseY = mouseY;
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
    if (collisions[0]) {
      this.ySpeed = -PLAYER_JUMP_POWER;
    } else if (collisions[2] && this.xSpeed > 0) {
      this.ySpeed = -PLAYER_JUMP_POWER;
      this.xSpeed = -PLAYER_MAX_X_SPEED;
    } else if (collisions[3] && this.xSpeed < 0) {
      this.ySpeed = -PLAYER_JUMP_POWER;
      this.xSpeed = PLAYER_MAX_X_SPEED;
    }
  }

  collision(platforms) {
    const bottom = this.y + PLAYER_HEIGHT;
    const top = this.y;
    const left = this.x;
    const right = this.x + PLAYER_WIDTH;
    const ret = [false, false, false, false];

    platforms.forEach(i => {
      if (
        i.x < right &&
        left < i.x + i.width &&
        i.y <= bottom + this.ySpeed &&
        bottom + this.ySpeed <= i.y + i.height
      ) {
        ret[0] = i; // bottom collision
      }
      if (
        i.x < right &&
        left < i.x + i.width &&
        top + this.ySpeed <= i.y + i.height &&
        i.y <= top + this.ySpeed
      ) {
        ret[1] = i; // top collision
      }
      if (
        i.x <= right + this.xSpeed &&
        right + this.xSpeed <= i.x + i.width &&
        i.y < bottom &&
        top < i.y + i.height
      ) {
        ret[2] = i; // right collision
      }
      if (
        i.x <= left + this.xSpeed &&
        left + this.xSpeed <= i.x + i.width &&
        i.y < bottom &&
        top < i.y + i.height
      ) {
        ret[3] = i; // left collision
      }
    });
    if (ret[0] && (ret[0] == ret[2] || ret[0] == ret[3])) {
      ret[0] = false;
    } else if (ret[1] && (ret[1] == ret[2] || ret[1] == ret[3])) {
      ret[1] = false;
    }
    return ret;
  }

  draw(context) {
    context.fillStyle = '#000';
    context.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);

    if (this.mouseX) {
      context.lineWidth = 1;
      context.strokeStyle = '#f00';
      context.beginPath();
      context.moveTo(this.getCenterX(), this.getCenterY());
      context.lineTo(this.mouseX, this.mouseY);
      context.stroke();

      const deltaX = this.mouseX - this.getCenterX();
      const deltaY = this.mouseY - this.getCenterY();

      const angle = Math.atan(deltaY / deltaX);

      let armEndX = Math.cos(angle) * PLAYER_ARM_LENGTH;
      let armEndY = Math.sin(angle) * PLAYER_ARM_LENGTH;

      if (deltaX < 0) {
        armEndX = -armEndX;
        armEndY = -armEndY;
      }

      context.lineWidth = PLAYER_ARM_WIDHT;
      context.strokeStyle = '#000';
      context.beginPath();
      context.moveTo(this.getCenterX(), this.getCenterY());
      context.lineTo(this.getCenterX() + armEndX, this.getCenterY() + armEndY);
      context.stroke();
    }
  }
}
