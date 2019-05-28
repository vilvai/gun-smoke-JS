import { GUN_SIZE, GUN_OFFSET_X, GUN_OFFSET_Y } from './constants.js';

const gunImage = new Image();
gunImage.src = 'images/gun_abstract.png';

export default class Gun {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(context, armEndX, armEndY, angle, gunRecoil) {
    context.translate(armEndX, armEndY);
    if (angle > Math.PI / 2) {
      context.scale(-GUN_SIZE, GUN_SIZE);
      context.rotate(-angle - gunRecoil + Math.PI);
    } else {
      context.scale(GUN_SIZE, GUN_SIZE);
      context.rotate(angle - gunRecoil);
    }
    context.translate(-armEndX, -armEndY);
    context.drawImage(gunImage, armEndX + GUN_OFFSET_X, armEndY + GUN_OFFSET_Y);
    context.setTransform(1, 0, 0, 1, 0, 0);
  }
}
