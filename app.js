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

  update(keys, platforms) {
    if (keys.RIGHT) {
      this.moveRight();
    } else if (keys.LEFT) {
      this.moveLeft();
    } else {
      this.xSpeed *= 1 - this.drag;
      if (Math.abs(this.xSpeed) < 0.1) this.xSpeed = 0;
    }
    if (keys.SPACE && !this.isJumping) {
      this.jump();
    }
    this.ySpeed += this.gravity;

    var collisions = this.collision(platforms);
    if (collisions[0] && this.ySpeed > 0) {
      this.y = collisions[0].y - this.height;
      this.ySpeed = 0;
      this.isJumping = false;
    }
    if (collisions[1] && this.ySpeed < 0) {
      this.y = collisions[1].y + collisions[1].height;
      this.ySpeed = 0;
    }
    if (collisions[2] && this.xSpeed > 0) {
      this.x = collisions[2].x - this.width;
      this.xSpeed = 0;
    }
    if (collisions[3] && this.xSpeed < 0) {
      this.x = collisions[3].x + collisions[3].width;
      this.xSpeed = 0;
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

  collision(platforms) {
    var bottom = this.y + this.height;
    var top = this.y;
    var left = this.x;
    var right = this.x + this.width;
    var ret = [false, false, false, false];

    platforms.forEach(i => {
      if (
        i.x < right &&
        left < i.x + i.width &&
        i.y <= bottom + this.ySpeed &&
        bottom + this.ySpeed <= i.y + 20
      ) {
        ret[0] = i; // bottom collision
      } else if (
        i.x < right &&
        left < i.x + i.width &&
        i.y + i.height >= top + this.ySpeed &&
        top + this.ySpeed >= i.y + i.height - 20
      ) {
        ret[1] = i; // top collision
      }

      if (
        i.x <= right + this.xSpeed &&
        right + this.xSpeed <= i.x + 20 &&
        i.y < bottom &&
        top < i.y + i.height
      ) {
        ret[2] = i; // right collision
      } else if (
        i.x + i.width - 20 <= left + this.xSpeed &&
        left + this.xSpeed <= i.x + i.width &&
        i.y < bottom &&
        top < i.y + i.height
      ) {
        ret[3] = i; // left collision
      }
    });
    return ret;
  }

  draw(context) {
    context.fillStyle = "#000";
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Platform {
  constructor(height, width, x, y) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
  }
  draw(context) {
    context.fillStyle = "#333";
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

Sketch.create({
  container: document.getElementById("container"),
  setup() {
    this.player = new Player(100, 40, this.width / 2);
    this.platforms = [
      new Platform(50, 300, 200, 700),
      new Platform(50, 300, 700, 700),
      new Platform(50, 300, 1200, 700),
      new Platform(500, 50, 1500, 200),
      new Platform(50, 300, 700, 450)
    ];
  },
  mousemove() {},
  update() {
    this.player.update(this.keys, this.platforms);
  },
  draw() {
    this.fillStyle = "#ccc";
    this.fillRect(0, 0, this.width, this.height);
    this.platforms.forEach(x => x.draw(this));
    this.player.draw(this);
  }
});
