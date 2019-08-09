import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  HAT_WIDTH,
  HAT_HEIGHT,
} from './constants.js';

export default class BloodPool {
  constructor(x, y, platform) {
    this.platform = platform;
    this.x = x;
    this.y = y;
  }

  update(x, y) {
    //this.x = x + this.relativeX;
    //this.y = y + this.relativeY;
  }

  draw(context) {
    const bloodColor = '#c21818';
    context.fillRect(0, 670, 1280, 100);
  }
}

function platformUnderPlayer() {}
