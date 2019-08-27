export default class Particle {
  constructor(x, y, xSpeed, ySpeed) {
    this.initialX = x;
    this.initialY = y;
    this.initialXSpeed = xSpeed;
    this.initialYSpeed = ySpeed;
    this.time = 1;
  }

  update() {
    const {
      initialX, initialY, initialXSpeed, initialYSpeed, time,
    } = this;
    this.x = initialX + Math.log(time) * initialXSpeed;
    this.y = initialY + Math.log(time) * initialYSpeed;
    this.scale = 0.25 + Math.log(time) * 0.3;
    // this.scale = 0.98 ** time;
    this.alpha = 0.91 ** time;
    this.time += 1;
  }

  draw(context) {
    context.fillStyle = '#bd9268';
    context.globalAlpha = this.alpha;
    context.beginPath();
    context.arc(this.x, this.y, this.scale * 7, 0, 2 * Math.PI);
    context.fill();
    context.globalAlpha = 1;
  }
}
