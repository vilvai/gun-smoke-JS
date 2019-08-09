import backgroundSrc from './images/bak.png';
import cloudSrc from './images/cloud.png';

import { drawImageCenter, getXYfromPolar } from './utils.js';

export default class Background {
  constructor() {
    this.night = new Image();
    this.night.src = backgroundSrc;
    this.cloud = new Image();
    this.cloud.src = cloudSrc;
    this.cloudX = 300;
    this.cloudY = 200;
    this.sunR = 500;
    this.sunTheta = 100;
    this.sunX = 640;
    this.sunY = 360;
    this.sunRising = false;
  }

  draw(ctx) {
    ctx.fillStyle = '#F2AB41';
    ctx.fillRect(0, 0, ctx.width, ctx.height);

    this.drawSun(ctx);
    this.drawClouds(ctx);

    drawImageCenter(this.night, ctx.width / 2, ctx.height / 2, 640, 360, ctx);
  }

  drawSun(ctx) {
    if (this.sunX <= 0) {
      this.sunX = ctx.width;
    } else {
      this.sunTheta -= 0.00005;
      this.sunR = this.sunY / 1.9 + 300;
    }

    ctx.fillStyle = '#ffd900';
    ctx.beginPath();
    const vector = getXYfromPolar(this.sunTheta, this.sunR);
    this.sunX = vector.x;
    this.sunY = vector.y;
    ctx.arc(this.sunX, this.sunY, 50, 0, 2 * Math.PI);
    ctx.fill();
  }

  drawClouds(ctx) {
    this.cloudX += 0.1;
    if (this.cloudX >= ctx.width + 500) {
      this.cloudX = -500;
    }
    drawImageCenter(this.cloud, this.cloudX, this.cloudY, 212, 42, ctx);
  }

  // DayCycle()

  // Wind()
}
