class Aim {
  constructor() {
    this.height = 10;
    this.width = 10;
    this.x = 100;
    this.y = 100;
  }

  update(mouseX, mouseY) {
    this.x = mouseX;
    this.y = mouseY;
  }

  draw(context) {
    context.fillStyle = '#f00';
    context.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }
}
