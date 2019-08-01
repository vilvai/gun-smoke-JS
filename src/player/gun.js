import {
  GUN_SIZE,
  GUN_POSITION_OFFSET_X,
  GUN_POSITION_OFFSET_Y,
  GUN_RECOIL_CENTER_OFFSET_X,
  GUN_RECOIL_CENTER_OFFSET_Y,
} from '../constants.js';

import gunSrc from '../images/gun_abstract.png';

const gunImage = new Image();
gunImage.src = gunSrc;

export default class Gun {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(context, armEndX, armEndY, angle, gunRecoil) {
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
    context.translate(-armEndX, -armEndY);
    context.drawImage(
      gunImage,
      armEndX + GUN_POSITION_OFFSET_X,
      armEndY + GUN_POSITION_OFFSET_Y
    );
    context.setTransform(1, 0, 0, 1, 0, 0);
  }
}
