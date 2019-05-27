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
  PLAYER_ARM_WIDTH,
  HAT_WIDTH,
  HAT_HEIGHT,
  GUN_SIZE,
  GUN_OFFSET_X,
  GUN_OFFSET_Y,
} from './player_constants.js';
import Hat from './hat.js';

const gunImage = new Image();
gunImage.src = 'images/gun_abstract.png';

export class GenericPlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.lives = 1;
    this.hat = new Hat(this.x, this.y);
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
    this.hat.update(this.x, this.y, this.lives == 0);
  }

  draw(context) {
    context.fillStyle = '#000';
    context.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.hat.draw(context);

    if (this.angle) {
      const armEndX =
        this.getArmStartX() + Math.cos(this.angle) * PLAYER_ARM_LENGTH;
      const armEndY =
        this.getArmStartY() + Math.sin(this.angle) * PLAYER_ARM_LENGTH;

      context.lineWidth = PLAYER_ARM_WIDTH;
      context.strokeStyle = '#000';
      context.beginPath();
      context.moveTo(this.getArmStartX(), this.getArmStartY());
      context.lineTo(armEndX, armEndY);
      context.stroke();

      context.translate(armEndX, armEndY);
      if (this.angle > Math.PI / 2) {
        context.scale(-GUN_SIZE, GUN_SIZE);
        context.rotate(-this.angle + Math.PI);
      } else {
        context.scale(GUN_SIZE, GUN_SIZE);
        context.rotate(this.angle);
      }
      context.translate(-armEndX, -armEndY);
      context.drawImage(
        gunImage,
        armEndX + GUN_OFFSET_X,
        armEndY + GUN_OFFSET_Y
      );
      context.setTransform(1, 0, 0, 1, 0, 0);
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
    if (keys.E) {
      this.lives -= 1;
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

    const deltaX = mouseX - this.getArmStartX();
    const deltaY = mouseY - this.getArmStartY();

    this.angle = -Math.atan2(deltaX, deltaY) + Math.PI / 2;
    this.hat.update(this.x, this.y, this.lives <= 0);
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

    platforms.forEach(platform => {
      if (
        platform.x < right &&
        left < platform.x + platform.width &&
        platform.y <= bottom + this.ySpeed &&
        bottom + this.ySpeed <= platform.y + platform.height
      ) {
        if (
          !(
            platform.x < right &&
            left < platform.x + platform.width &&
            platform.y < bottom &&
            bottom < platform.y + platform.height
          )
        ) {
          collisions[0] = platform; // bottom collision
        }
      }
      if (
        platform.x < right &&
        left < platform.x + platform.width &&
        top + this.ySpeed <= platform.y + platform.height &&
        platform.y <= top + this.ySpeed
      ) {
        if (platform.hasCollision) collisions[1] = platform; // top collision
      }
      if (
        platform.x <= right + this.xSpeed &&
        right + this.xSpeed <= platform.x + platform.width &&
        platform.y < bottom &&
        top < platform.y + platform.height
      ) {
        if (platform.hasCollision) collisions[2] = platform; // right collision
      }
      if (
        platform.x <= left + this.xSpeed &&
        left + this.xSpeed <= platform.x + platform.width &&
        platform.y < bottom &&
        top < platform.y + platform.height
      ) {
        if (platform.hasCollision) collisions[3] = platform; // left collision
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
