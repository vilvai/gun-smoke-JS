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
  }

  update(keys) {
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
  }
}

Sketch.create({
  container: document.getElementById('container'),
  setup() {
    this.player = new Player(100, 40, this.width / 2);
  },
  mousemove() {},
  update() {
    this.player.update(this.keys);
  },
  draw() {
    this.fillStyle = '#ccc';
    this.fillRect(0, 0, this.width, this.height);
    this.player.draw(this);
  }
});
