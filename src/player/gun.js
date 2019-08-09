import {
  GUN_SIZE,
  GUN_POSITION_OFFSET_X,
  GUN_POSITION_OFFSET_Y,
  GUN_RECOIL_CENTER_OFFSET_X,
  GUN_RECOIL_CENTER_OFFSET_Y,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  GAME_WIDTH,
} from '../constants.js';

import gunSrc from '../images/gun_abstract.png';

const gunImage = new Image();
gunImage.src = gunSrc;

export default class Gun {
  draw(
    context,
    armEndX,
    armEndY,
    angle,
    gunRecoil,
    isGunHolstered,
    playerX,
    playerY
  ) {
    if (isGunHolstered) {
      this.drawHolsteredGun(context, playerX, playerY);
    } else {
      this.drawUnHolsteredGun(context, armEndX, armEndY, angle, gunRecoil);
    }
    context.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawHolsteredGun(context, playerX, playerY) {
    context.translate(playerX, playerY);
    const holsterAngle = 2.38 * Math.PI;
    const holsterX = PLAYER_WIDTH / 2;
    const holsterY = PLAYER_HEIGHT / 2;
    if (playerX > GAME_WIDTH / 2) {
      context.translate(holsterX, holsterY);
      context.scale(-GUN_SIZE, GUN_SIZE);
    } else {
      context.translate(PLAYER_WIDTH - holsterX, holsterY);
      context.scale(GUN_SIZE, GUN_SIZE);
    }
    context.rotate(holsterAngle);
    context.drawImage(gunImage, 0, 0);
  }

  drawUnHolsteredGun(context, armEndX, armEndY, angle, gunRecoil) {
    context.translate(armEndX, armEndY);
    if (angle > Math.PI / 2) {
      context.scale(-GUN_SIZE, GUN_SIZE);
      context.rotate(-angle + Math.PI);
    } else {
      context.scale(GUN_SIZE, GUN_SIZE);
      context.rotate(angle);
    }
    context.translate(GUN_RECOIL_CENTER_OFFSET_X, GUN_RECOIL_CENTER_OFFSET_Y);
    context.rotate(-gunRecoil);
    context.translate(-GUN_RECOIL_CENTER_OFFSET_X, -GUN_RECOIL_CENTER_OFFSET_Y);
    context.drawImage(gunImage, GUN_POSITION_OFFSET_X, GUN_POSITION_OFFSET_Y);
  }
}
