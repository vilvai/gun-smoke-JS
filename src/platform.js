export default class Platform {
  constructor(x, y, width, height, collision) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hasCollision = collision;
  }

  draw(context) {
    context.fillStyle = '#91602f';
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}
