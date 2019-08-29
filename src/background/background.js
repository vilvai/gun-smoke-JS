import Cloud from './cloud.js';

import backgroundSrc from '../images/bak.png';

import { getXYfromPolar } from '../utils.js';

const nightImage = new Image();
nightImage.src = backgroundSrc;

export default class Background {
  constructor() {
    this.sunR = 500;
    this.sunTheta = -0.53;
    this.sunX = 640;
    this.sunY = 360;
    this.clouds = this.initializeClouds();
  }

  initializeClouds() {
    const clouds = [];
    for (let i = 0; i < Math.round(Math.random() * 2) + 2; i++) {
      clouds.push(new Cloud());
    }
    return clouds;
  }

  update() {
    this.clouds.forEach(cloud => cloud.update());
    this.sunTheta -= 0.0001;
    if (this.sunTheta < -Math.PI) this.sunTheta = 0;
    this.sunR = this.sunY / 1.9 + 300;
    const vector = getXYfromPolar(this.sunTheta, this.sunR);
    this.sunX = vector.x;
    this.sunY = vector.y;
  }

  draw(context) {
    context.fillStyle = '#F2AB41';
    context.fillRect(
      -context.xOffset / context.minScale,
      0,
      context.width / context.minScale,
      context.height / context.minScale
    );

    this.drawSun(context);
    this.clouds.forEach(cloud => cloud.draw(context));

    context.drawImage(nightImage, 0, 0);
    this.drawSunGlare(context);
  }

  drawSun(context) {
    context.fillStyle = '#ffe88a';
    context.beginPath();
    context.arc(this.sunX, this.sunY, 50, 0, 2 * Math.PI);
    context.fill();
  }

  drawSunGlare(context) {
    const sunGlareKeyFrames = {
      '-0.13': { alpha: 0, cx: 30, cy: -30 },
      '-0.2': { alpha: 0.7, cx: 30, cy: -20 },
      '-0.3': { alpha: 0, cx: 30, cy: 0 },
      '-0.45': { alpha: 0, cx: -30, cy: -30 },
      '-0.58': { alpha: 1, cx: 0, cy: 0 },
      '-2.5': { alpha: 1, cx: 0, cy: 0 },
      '-2.6': { alpha: 0.7, cx: 30, cy: -30 },
      '-2.65': { alpha: 0, cx: 30, cy: -30 },
      '-2.72': { alpha: 0, cx: -15, cy: -15 },
      '-2.85': { alpha: 0.6, cx: -15, cy: -15 },
      '-3': { alpha: 0, cx: -15, cy: -15 },
    };
    const keyFrameKeys = Object.keys(sunGlareKeyFrames).map(key => Number(key));
    const previousKey = Math.min(
      ...keyFrameKeys.filter(key => key >= this.sunTheta)
    );
    const nextKey = Math.max(
      ...keyFrameKeys.filter(key => key <= this.sunTheta)
    );
    if (previousKey === Infinity || nextKey === -Infinity) return;
    const previousKeyFrame = sunGlareKeyFrames[previousKey];
    const nextKeyFrame = sunGlareKeyFrames[nextKey];
    const scale = (this.sunTheta - previousKey) / (nextKey - previousKey);
    context.globalCompositeOperation = 'lighter';
    // prettier-ignore
    context.globalAlpha = previousKeyFrame.alpha * (1 - scale)
      + nextKeyFrame.alpha * scale;
    const gradient = context.createRadialGradient(
      this.sunX + previousKeyFrame.cx * (1 - scale) + nextKeyFrame.cx * scale,
      this.sunY + previousKeyFrame.cy * (1 - scale) + nextKeyFrame.cy * scale,
      20,
      this.sunX + previousKeyFrame.cx * (1 - scale) + nextKeyFrame.cx * scale,
      this.sunY + previousKeyFrame.cy * (1 - scale) + nextKeyFrame.cy * scale,
      140
    );
    gradient.addColorStop(0, '#F2AB41');
    gradient.addColorStop(1, 'transparent');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(this.sunX, this.sunY, 200, 0, 2 * Math.PI);
    context.fill();
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
  }

  // DayCycle()

  // Wind()
}
