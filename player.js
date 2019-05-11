class Player {
  constructor(height, width, x) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = 500;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.isJumping = false;
    this.acceleration = 0.5;
    this.drag = 0.08;
    this.maxSpeed = 8;
    this.gravity = 0.5;
    this.jumpPower = 14;
    this.armLength = 50;
  }

  getCenterX() {
    return this.x + this.width / 2;
  }

  getCenterY() {
    return this.y + this.height / 2;
  }

  update(keys, mouseX, mouseY) {
    if (keys.RIGHT) {
      this.moveRight();
    } else if (keys.LEFT) {
      this.moveLeft();
    } else {
      this.xSpeed *= 1 - this.drag;
      if (Math.abs(this.xSpeed) < 0.1) this.xSpeed = 0;
    }
    if (keys.UP && !this.isJumping) {
      this.jump();
    }
    if (this.y + this.ySpeed > 600) {
      this.y = 600;
      this.ySpeed = 0;
      this.isJumping = false;
    } else {
      this.ySpeed += this.gravity;
    }
    this.y += this.ySpeed;
    this.x += this.xSpeed;

    this.mouseX = mouseX;
    this.mouseY = mouseY;
  }

  moveRight() {
    if (this.xSpeed < 0) this.xSpeed /= 2;
    this.xSpeed = Math.min(
      Math.max(-this.maxSpeed, this.xSpeed + this.acceleration),
      this.maxSpeed
    );
  }

  moveLeft() {
    if (this.xSpeed > 0) this.xSpeed /= 2;
    this.xSpeed = Math.min(
      Math.max(-this.maxSpeed, this.xSpeed - this.acceleration),
      this.maxSpeed
    );
  }

  jump() {
    this.ySpeed = -this.jumpPower;
    this.isJumping = true;
  }

  draw(context) {
    context.fillStyle = '#000';
    context.fillRect(this.x, this.y, this.width, this.height);

    if (this.mouseX) {
      context.lineWidth = 1;
      context.strokeStyle = '#f00';
      context.beginPath();
      context.moveTo(this.getCenterX(), this.getCenterY());
      context.lineTo(this.mouseX, this.mouseY);
      context.stroke();

      const deltaX = this.mouseX - this.getCenterX();
      const deltaY = this.mouseY - this.getCenterY();

      const angle = Math.atan(deltaY / deltaX);

      let armEndX = Math.cos(angle);
      let armEndY = Math.sin(angle);

      if (deltaX < 0) {
        armEndX = -armEndX;
        armEndY = -armEndY;
      }

      context.lineWidth = 15;
      context.strokeStyle = '#000';
      context.beginPath();
      context.moveTo(this.getCenterX(), this.getCenterY());
      context.lineTo(
        this.getCenterX() + armEndX * this.armLength,
        this.getCenterY() + armEndY * this.armLength
      );
      context.stroke();
    }
  }
}
