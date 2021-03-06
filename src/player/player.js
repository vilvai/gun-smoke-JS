import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_ACCELERATION,
  PLAYER_DRAG,
  PLAYER_MAX_X_SPEED,
  PLAYER_MAX_Y_SPEED,
  PLAYER_JUMP_POWER,
  PLAYER_JUMP_SLOWDOWN,
  PLAYER_DROP_SPEED,
  PLAYER_GRAVITY,
  PLAYER_ARM_LENGTH,
  PLAYER_ARM_WIDTH,
  GUN_SIZE,
  GUN_POSITION_OFFSET_X,
  GUN_POSITION_OFFSET_Y,
  PLAYER_SHOOT_COOLDOWN,
  GUN_BULLETS,
  GUN_RELOAD_TIME,
} from '../constants.js';
import {
  STILL,
  ACCELERATING_RIGHT,
  ACCELERATING_LEFT,
  MOVING_RIGHT,
  MOVING_LEFT,
} from './movement_states.js';
import Hat from './hat.js';
import Gun from './gun.js';
import ParticleSystem from './particle_system.js';
import Marker from './marker.js';

export class GenericPlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.lives = 2;
    this.hat = new Hat(this.x, this.y);
    this.gun = new Gun(this.x, this.y);
    this.particleSystem = new ParticleSystem();
    this.marker = new Marker();
    this.angle = 0;
    this.gunRecoil = 0;
    this.movementType = STILL;
    this.isTouchingGround = false;
    this.isAimingDown = false;
    this.isReadyToRematch = false;
    this.isReloading = false;
    this.reloadTimeLeft = 0;
    this.bulletsLeft = GUN_BULLETS;
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
      this.getArmEndX()
      + Math.cos(this.angle) * ((100 - 2 + GUN_POSITION_OFFSET_X) * GUN_SIZE)
      - Math.sin(this.angle) * GUN_POSITION_OFFSET_Y * GUN_SIZE * direction
    );
  }

  getGunBarrelY() {
    const direction = this.angle > Math.PI / 2 ? -1 : 1;
    return (
      this.getArmEndY()
      + Math.sin(this.angle) * ((100 - 2 + GUN_POSITION_OFFSET_X) * GUN_SIZE)
      + Math.cos(this.angle) * GUN_POSITION_OFFSET_Y * GUN_SIZE * direction
    );
  }

  onHit(angle, random, onOutOfLives) {
    this.lives -= 1;
    if (this.lives === 1) this.hat.fly(angle, random);
    if (this.lives === 0 && onOutOfLives) onOutOfLives();
  }

  reload() {
    this.isReloading = true;
    this.reloadTimeLeft = GUN_RELOAD_TIME;
  }

  update(
    {
      x,
      y,
      angle,
      gunRecoil,
      movementType,
      isTouchingGround,
      isReadyToRematch,
    },
    isGameStarted,
    isGameOver
  ) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.gunRecoil = gunRecoil;
    this.movementType = movementType;
    this.isTouchingGround = isTouchingGround;
    this.isReadyToRematch = isReadyToRematch;
    this.genericUpdate(isGameStarted, isGameOver);
  }

  genericUpdate(isGameStarted, isGameOver) {
    if (this.isReloading) {
      this.reloadTimeLeft -= 1;
      if (this.isReloading && this.reloadTimeLeft === 0) {
        this.isReloading = false;
        this.bulletsLeft = GUN_BULLETS;
      }
    }
    this.hat.update(this.x, this.y);
    this.particleSystem.update(
      this.x,
      this.y,
      this.isTouchingGround,
      this.movementType
    );
    if (!isGameStarted) {
      this.isAimingDown = this.angle > 1.2 && this.angle < 1.94;
    }
    this.marker.update(
      this.isAimingDown,
      this.isReadyToRematch,
      isGameStarted,
      isGameOver
    );
  }

  createJumpParticles(playerX, playerY) {
    this.particleSystem.createJumpParticles(playerX, playerY);
  }

  createLandParticles(playerX, playerY, ySpeed) {
    this.particleSystem.createLandParticles(playerX, playerY, ySpeed);
  }

  draw(context, isGameStarted) {
    const playerColor = this.lives > 0 ? '#000' : '#630c0c';
    const reloadProgress = 1 - this.reloadTimeLeft / GUN_RELOAD_TIME;
    context.fillStyle = playerColor;
    context.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.hat.draw(context);

    if (this.angle) {
      if (this.isReloading) {
        const {
          angleWithAnimation,
          gunAngleWithAnimation,
        } = this.calculateReloadAnimation(reloadProgress);
        this.angle = angleWithAnimation;
        this.gunRecoil = gunAngleWithAnimation;
      }

      this.drawArm(context, playerColor);

      const isGunHolstered = !isGameStarted && this.isAimingDown;
      this.gun.draw(
        context,
        this.getArmEndX(),
        this.getArmEndY(),
        this.angle,
        this.gunRecoil,
        isGunHolstered,
        this.x,
        this.y
      );
    }
    if (this.isReloading) this.drawReloadMarker(context, reloadProgress);
    this.particleSystem.draw(context);
    this.marker.draw(context, this.x, this.y);
  }

  calculateReloadAnimation(reloadProgress) {
    let angleWithAnimation = 0;
    let gunAngleWithAnimation = 0;
    const reloadStartAnimationPercent = 0.05;
    const reloadFinishAnimationPercent = 0.8;
    let loweredAngle;
    if (this.angle < Math.PI / 2) {
      loweredAngle = (this.angle - Math.PI / 2) / 2 + Math.PI / 2;
    } else {
      loweredAngle = (this.angle + Math.PI / 2) / 2;
    }

    if (reloadProgress < reloadStartAnimationPercent) {
      const animationProgress = reloadProgress / reloadStartAnimationPercent;
      gunAngleWithAnimation = -animationProgress * (Math.PI / 4);
      // prettier-ignore
      angleWithAnimation = animationProgress * loweredAngle
        + (1 - animationProgress) * this.angle;
    } else if (reloadProgress < reloadFinishAnimationPercent) {
      gunAngleWithAnimation = -Math.PI / 4;
      angleWithAnimation = loweredAngle;
    } else {
      const animationProgress = (reloadProgress - reloadFinishAnimationPercent)
        / (1 - reloadFinishAnimationPercent);
      // prettier-ignore
      gunAngleWithAnimation = (-(animationProgress * 3.75) + 15 / 4) * Math.PI;
      // prettier-ignore
      angleWithAnimation = Math.min(animationProgress * 3, 1) * this.angle
        + (1 - Math.min(animationProgress * 3, 1)) * loweredAngle;
    }
    return { angleWithAnimation, gunAngleWithAnimation };
  }

  drawArm(context, playerColor) {
    context.lineWidth = PLAYER_ARM_WIDTH;
    context.strokeStyle = playerColor;
    context.beginPath();
    context.moveTo(this.getArmStartX(), this.getArmStartY());
    context.lineTo(this.getArmEndX(), this.getArmEndY());
    context.stroke();
  }

  drawReloadMarker(context, reloadProgress) {
    const reloadMarkerRadius = 15;
    const reloadMarkerWidth = 3;
    const reloadMarkerY = 4;
    context.lineWidth = reloadMarkerWidth;
    context.beginPath();
    context.arc(
      this.x + PLAYER_WIDTH / 2,
      this.y - reloadMarkerRadius - reloadMarkerY,
      reloadMarkerRadius,
      0,
      2 * Math.PI
    );
    context.strokeStyle = '#707070';
    context.stroke();
    context.beginPath();
    context.arc(
      this.x + PLAYER_WIDTH / 2,
      this.y - reloadMarkerRadius - reloadMarkerY,
      reloadMarkerRadius,
      (-1 / 2) * Math.PI,
      Math.PI * (2 * reloadProgress - 1 / 2)
    );
    context.strokeStyle = '#e0e0e0';
    context.stroke();
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
    isGameStarted,
    isGameOver,
    onShoot,
    onJump,
    onLand,
    onReload
  ) {
    const collisions = this.calculateCollisions(platforms);
    if (isGameStarted && this.lives > 0) {
      if (keys.D) this.moveRight(collisions);
      else if (keys.A) this.moveLeft(collisions);
      if (keys.W || keys.SPACE) this.jump(collisions, onJump);
      else if (keys.S) this.drop(collisions);
      else this.jumpReleased();
      if (mouseClicked && this.gunCooldown <= 0 && !this.isReloading) {
        this.shoot(onShoot);
      }
      if (keys.R && !this.isReloading && this.bulletsLeft !== GUN_BULLETS) {
        this.reload();
        onReload();
      }
    }
    if (isGameOver && keys.ENTER) this.isReadyToRematch = true;
    this.isTouchingGround = collisions.bottom && this.ySpeed === 0;

    this.calculateSlowdown(collisions, keys, onLand);
    this.y += this.ySpeed;
    this.x += this.xSpeed;

    this.calculateAngles(mouseX, mouseY);
    this.calculateMovementType(keys);
    this.genericUpdate(isGameStarted, isGameOver);
  }

  calculateSlowdown(collisions, keys, onLand) {
    if (this.lives <= 0 || (!keys.A && !keys.D)) {
      if (collisions.bottom) {
        this.xSpeed *= 1 - PLAYER_DRAG;
        if (Math.abs(this.xSpeed) < 0.1) this.xSpeed = 0;
      } else {
        this.xSpeed *= 1 - PLAYER_DRAG / 8;
      }
    }
    if (Math.abs(this.xSpeed) < 0.1) this.xSpeed = 0;
    this.ySpeed = Math.min(this.ySpeed + PLAYER_GRAVITY, PLAYER_MAX_Y_SPEED);
    if (collisions.bottom && this.ySpeed > 0) {
      this.y = collisions.bottom.y - PLAYER_HEIGHT;
      if (this.ySpeed > 5 && (!keys.W || keys.SPACE)) {
        onLand(this.x, this.y, this.ySpeed);
        this.createLandParticles(this.x, this.y, this.ySpeed);
      }
      this.ySpeed = 0;
    }
    if (collisions.top && this.ySpeed < 0) {
      this.y = collisions.top.y + collisions.top.height;
      this.ySpeed = 0;
    }
    if (collisions.right && this.xSpeed > 0) {
      this.x = collisions.right.x - PLAYER_WIDTH;
      this.xSpeed = 0;
    }
    if (collisions.left && this.xSpeed < 0) {
      this.x = collisions.left.x + collisions.left.width;
      this.xSpeed = 0;
    }
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
    if (this.armRecoilDelay === 0) {
      this.armRecoil = Math.max(
        this.armRecoil + this.armRecoilForce - this.armRecoilReturn,
        0
      );
      this.armRecoilReturn = Math.min(this.armRecoilReturn + 0.02, 0.1);
      this.armRecoilForce *= 0.75;
    } else {
      this.armRecoilDelay -= 1;
    }

    if (this.angle > Math.PI / 2) this.angle += this.armRecoil * 0.5;
    else this.angle -= this.armRecoil * 0.5;
  }

  calculateMovementType(keys) {
    if (this.xSpeed === PLAYER_MAX_X_SPEED) {
      this.movementType = MOVING_RIGHT;
    } else if (this.xSpeed === -PLAYER_MAX_X_SPEED) {
      this.movementType = MOVING_LEFT;
    } else if (keys.D && this.lives > 0 && this.xSpeed !== 0) {
      this.movementType = ACCELERATING_RIGHT;
    } else if (keys.A && this.lives > 0 && this.xSpeed !== 0) {
      this.movementType = ACCELERATING_LEFT;
    } else {
      this.movementType = STILL;
    }
  }

  moveRight(collisions) {
    if (collisions.bottom && this.xSpeed < 0) this.xSpeed /= 4;
    this.xSpeed = Math.min(
      (this.xSpeed += PLAYER_ACCELERATION),
      PLAYER_MAX_X_SPEED
    );
  }

  moveLeft(collisions) {
    if (collisions.bottom && this.xSpeed > 0) this.xSpeed /= 4;
    this.xSpeed = Math.max(
      (this.xSpeed -= PLAYER_ACCELERATION),
      -PLAYER_MAX_X_SPEED
    );
  }

  jump(collisions, onJump) {
    if (collisions.bottom && this.ySpeed === 0) {
      this.ySpeed = -PLAYER_JUMP_POWER;
      onJump(this.x, this.y);
      this.createJumpParticles(this.x, this.y);
    } else if (collisions.right && this.xSpeed > 0) {
      this.ySpeed = -PLAYER_JUMP_POWER;
      this.xSpeed = -PLAYER_MAX_X_SPEED;
    } else if (collisions.left && this.xSpeed < 0) {
      this.ySpeed = -PLAYER_JUMP_POWER;
      this.xSpeed = PLAYER_MAX_X_SPEED;
    }
  }

  drop(collisions) {
    if (
      collisions.bottom
      && !collisions.bottom.hasCollision
      && this.ySpeed === 0
    ) {
      collisions.bottom = false;
      this.ySpeed = PLAYER_DROP_SPEED;
    }
  }

  jumpReleased() {
    if (this.ySpeed < 0) this.ySpeed *= PLAYER_JUMP_SLOWDOWN;
  }

  shoot(onShoot) {
    if (this.bulletsLeft > 0) {
      this.bulletsLeft -= 1;
      this.gunRecoilForce = 0.32;
      this.gunRecoilReturn = -0.04;
      this.armRecoilForce = 0.4;
      this.armRecoilReturn = 0;
      this.armRecoilDelay = 2;
      this.gunCooldown = PLAYER_SHOOT_COOLDOWN;
      onShoot(this.getGunBarrelX(), this.getGunBarrelY(), this.angle);
    } else {
      // TODO: Empty gun click sound
    }
  }

  calculateCollisions(platforms) {
    const bottom = this.y + PLAYER_HEIGHT;
    const top = this.y;
    const left = this.x;
    const right = this.x + PLAYER_WIDTH;
    const futureYSpeed = Math.min(
      this.ySpeed + PLAYER_GRAVITY,
      PLAYER_MAX_Y_SPEED
    );
    const collisions = {
      bottom: null,
      top: null,
      right: null,
      left: null,
    };

    platforms.forEach(platform => {
      if (
        platform.x < right
        && left < platform.x + platform.width
        && platform.y <= bottom + futureYSpeed
        && bottom + futureYSpeed <= platform.y + platform.height
        && platform.y >= bottom
      ) collisions.bottom = platform;

      if (
        platform.x < right
        && left < platform.x + platform.width
        && top + futureYSpeed <= platform.y + platform.height
        && platform.y <= top + futureYSpeed
        && platform.hasCollision
      ) collisions.top = platform;

      if (
        platform.x <= right + this.xSpeed
        && right + this.xSpeed <= platform.x + platform.width
        && platform.y < bottom
        && top < platform.y + platform.height
        && platform.hasCollision
      ) collisions.right = platform;

      if (
        platform.x <= left + this.xSpeed
        && left + this.xSpeed <= platform.x + platform.width
        && platform.y < bottom
        && top < platform.y + platform.height
        && platform.hasCollision
      ) collisions.left = platform;
    });
    if (
      collisions.bottom
      && (collisions.bottom === collisions.right
        || collisions.bottom === collisions.left)
    ) collisions.bottom = false;
    else if (
      collisions.top
      && (collisions.top === collisions.right
        || collisions.top === collisions.left)
    ) collisions.top = false;

    return collisions;
  }
}
