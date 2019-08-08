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
  GUN_POSITION_OFFSET_X,
  GUN_POSITION_OFFSET_Y,
  PLAYER_SHOOT_COOLDOWN,
} from '../constants.js';
import {
  STILL,
  ACCELERATING_RIGHT,
  ACCELERATING_LEFT,
  MOVING_RIGHT,
  MOVING_LEFT,
} from './movement_types.js';
import Hat from './hat.js';
import Gun from './gun.js';
import ParticleSystem from './particle_system.js';
import Wound from './wound.js';

export class GenericPlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.lives = 2;
    this.hat = new Hat(this.x, this.y);
    this.gun = new Gun(this.x, this.y);
    this.particleSystem = new ParticleSystem();
    this.gunRecoil = 0;
    this.movementType = STILL;
    this.isTouchingGround = false;
    this.wounds = [];
  }

  getArmStartX() {
    return this.x + PLAYER_WIDTH / 2;
  }

  getArmStartY() {
    return this.y + PLAYER_HEIGHT / 2;
  }

  getArmEndX() {
    return this.getArmStartX() + Math.cos(this.angle) * PLAYER_ARM_LENGTH;
  }

  getArmEndY() {
    return this.getArmStartY() + Math.sin(this.angle) * PLAYER_ARM_LENGTH;
  }

  getGunBarrelX() {
    const direction = this.angle > Math.PI / 2 ? -1 : 1;
    return (
      this.getArmEndX() +
      Math.cos(this.angle) * ((100 - 2 + GUN_POSITION_OFFSET_X) * GUN_SIZE) -
      Math.sin(this.angle) * GUN_POSITION_OFFSET_Y * GUN_SIZE * direction
    );
  }

  getGunBarrelY() {
    const direction = this.angle > Math.PI / 2 ? -1 : 1;
    return (
      this.getArmEndY() +
      Math.sin(this.angle) * ((100 - 2 + GUN_POSITION_OFFSET_X) * GUN_SIZE) +
      Math.cos(this.angle) * GUN_POSITION_OFFSET_Y * GUN_SIZE * direction
    );
  }

  onHit(x, y, angle, random) {
    const relativeBulletX = x - this.x;
    const relativeBulletY = y - this.y;
    console.log(angle);
    this.wounds.push(
      new Wound(this.x, this.y, relativeBulletX, relativeBulletY, angle)
    );
    console.log(this.wounds);
    this.lives = 1;
    if (this.lives == 1) this.hat.fly(angle, random);
  }

  update({ x, y, angle, gunRecoil, movementType, isTouchingGround }) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.gunRecoil = gunRecoil;
    this.movementType = movementType;
    this.isTouchingGround = isTouchingGround;
    this.genericUpdate();
  }

  genericUpdate() {
    this.hat.update(this.x, this.y);
    this.wounds.forEach(w => w.update(this.x, this.y));
    this.particleSystem.update(
      this.x,
      this.y,
      this.isTouchingGround,
      this.movementType
    );
  }

  draw(context) {
    const playerColor = this.lives > 0 ? '#000' : '#630c0c';
    context.fillStyle = playerColor;

    context.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    if (this.wounds && this.wounds.length) {
      this.wounds.forEach(w => w.draw(context, this.x, this.y));
    }
    this.hat.draw(context);

    if (this.angle) {
      const armEndX = this.getArmEndX();
      const armEndY = this.getArmEndY();

      context.lineWidth = PLAYER_ARM_WIDTH;
      context.strokeStyle = playerColor;
      context.beginPath();
      context.moveTo(this.getArmStartX(), this.getArmStartY());
      context.lineTo(armEndX, armEndY);
      context.stroke();

      this.gun.draw(context, armEndX, armEndY, this.angle, this.gunRecoil);
    }

    this.particleSystem.draw(context);
  }
}

export default class Player extends GenericPlayer {
  constructor(x, y) {
    super(x, y);
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.gunRecoilForce = 0;
    this.gunRecoilReturn = 0;
    this.armRecoil = 0;
    this.armRecoilForce = 0;
    this.armRecoilReturn = 0;
    this.armRecoilDelay = 0;
    this.gunCooldown = 0;
  }

  update(
    keys,
    platforms,
    mouseX,
    mouseY,
    mouseClicked,
    isRoundStarted,
    onShoot
  ) {
    const collisions = this.collision(platforms);

    if (isRoundStarted && this.lives > 0) {
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
      if (keys.R) {
        this.lives = 2;
        this.hat = new Hat(this.x, this.y);
        this.wounds = [];
      }
      if (keys.E) {
        this.lives -= 1;
      }
      if (mouseClicked && this.gunCooldown <= 0) {
        this.gunRecoilForce = 0.32;
        this.gunRecoilReturn = -0.04;
        this.armRecoilForce = 0.4;
        this.armRecoilReturn = 0;
        this.armRecoilDelay = 2;
        this.gunCooldown = PLAYER_SHOOT_COOLDOWN;
        onShoot(this.getGunBarrelX(), this.getGunBarrelY(), this.angle);
      }
      if (collisions[0] && this.ySpeed == 0) {
        this.isTouchingGround = true;
      } else {
        this.isTouchingGround = false;
      }
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

    this.calculateAngles(mouseX, mouseY);
    this.calculateMovementType(keys);
    this.genericUpdate();
  }

  calculateAngles(mouseX, mouseY) {
    const deltaX = mouseX - this.getArmStartX();
    const deltaY = mouseY - this.getArmStartY();

    if (this.lives > 0) this.angle = -Math.atan2(deltaX, deltaY) + Math.PI / 2;

    this.gunCooldown -= 1;
    this.gunRecoil = Math.max(
      this.gunRecoil + this.gunRecoilForce - this.gunRecoilReturn,
      0
    );
    this.gunRecoilForce *= 0.6;
    this.gunRecoilReturn = Math.min(this.gunRecoilReturn + 0.024, 0.096);
    if (this.armRecoilDelay == 0) {
      this.armRecoil = Math.max(
        this.armRecoil + this.armRecoilForce - this.armRecoilReturn,
        0
      );
      this.armRecoilReturn = Math.min(this.armRecoilReturn + 0.02, 0.1);
      this.armRecoilForce *= 0.75;
    } else this.armRecoilDelay -= 1;

    if (this.angle > Math.PI / 2) this.angle += this.armRecoil * 0.5;
    else this.angle -= this.armRecoil * 0.5;
  }

  calculateMovementType(keys) {
    if (this.xSpeed == PLAYER_MAX_X_SPEED) this.movementType = MOVING_RIGHT;
    else if (this.xSpeed == -PLAYER_MAX_X_SPEED)
      this.movementType = MOVING_LEFT;
    else if (keys.D && this.lives > 0) this.movementType = ACCELERATING_RIGHT;
    else if (keys.A && this.lives > 0) this.movementType = ACCELERATING_LEFT;
    else this.movementType = STILL;
  }

  moveRight(collisions) {
    if (collisions[0] && this.xSpeed < 0) this.xSpeed /= 4;
    this.xSpeed = Math.min(
      (this.xSpeed += PLAYER_ACCELERATION),
      PLAYER_MAX_X_SPEED
    );
  }

  moveLeft(collisions) {
    if (collisions[0] && this.xSpeed > 0) this.xSpeed /= 4;
    this.xSpeed = Math.max(
      (this.xSpeed -= PLAYER_ACCELERATION),
      -PLAYER_MAX_X_SPEED
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
    if (collisions[0] && !collisions[0].hasCollision && this.ySpeed == 0)
      collisions[0] = false;
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
