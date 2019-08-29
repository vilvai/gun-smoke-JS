import { GAME_WIDTH } from '../constants.js';

import cloudSrc from '../images/cloud.png';

import { resetContextTransform } from '../utils.js';

const cloudImage = new Image();
cloudImage.src = cloudSrc;

export default class Cloud {
  constructor() {
    const direction = Math.round(Math.random()) * 2 - 1;
    this.flipped = Math.round(Math.random()) * 2 - 1;
    this.xSpeed = direction * (0.05 + Math.random() * 0.1);
    this.size = 0.6 + Math.random() * 0.65;
    this.width = 424 * this.size;
    this.x = Math.random() * (GAME_WIDTH - this.width);
    this.y = 30 + Math.random() * 170;
  }

  update() {
    this.x += this.xSpeed;
    if (this.x > GAME_WIDTH) {
      this.x = -this.width;
    } else if (this.x + this.width < 0) {
      this.x = GAME_WIDTH;
    }
  }

  draw(context) {
    context.globalAlpha = 0.85;
    context.translate(this.x, this.y);
    if (this.flipped === -1) context.translate(this.width, 0);
    context.scale(this.size * this.flipped, this.size);
    context.drawImage(cloudImage, 0, 0);
    context.globalAlpha = 1;
    resetContextTransform(context);
  }
}
