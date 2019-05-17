export default class Player {
  constructor(height, width, x) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = 500;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.acceleration = 0.5;
    this.drag = 0.2;
    this.xMaxSpeed = 8;
    this.yMaxSpeed = 20;
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

  update(keys, platforms, windowHeight, mouseX, mouseY) {
    const collisions = this.collision(platforms);
    if (keys.D) {
      this.moveRight(collisions);
    } else if (keys.A) {
      this.moveLeft(collisions);
    } else if (collisions[0]) {
      this.xSpeed *= 1 - this.drag;
      if (Math.abs(this.xSpeed) < 0.1) this.xSpeed = 0;
    } else {
      this.xSpeed *= 1 - this.drag / 8;
    }
    if (Math.abs(this.xSpeed) < 0.1) this.xSpeed = 0;
    if (keys.W) {
      this.jump(collisions);
    }

    this.ySpeed = Math.min(this.ySpeed + this.gravity, this.yMaxSpeed);
    if (collisions[0] && this.ySpeed > 0) {
      this.y = collisions[0].y - this.height;
      this.ySpeed = 0;
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

    if (this.y > windowHeight) {
      this.y = -this.height;
    }

    this.mouseX = mouseX;
    this.mouseY = mouseY;
  }

  moveRight(collisions) {
    if (collisions[0] && this.xSpeed < 0) this.xSpeed /= 4;
    this.xSpeed = Math.min(
      Math.max(-this.xMaxSpeed, this.xSpeed + this.acceleration),
      this.xMaxSpeed
    );
  }

  moveLeft(collisions) {
    if (collisions[0] && this.xSpeed > 0) this.xSpeed /= 4;
    this.xSpeed = Math.min(
      Math.max(-this.xMaxSpeed, this.xSpeed - this.acceleration),
      this.xMaxSpeed
    );
  }

  jump(collisions) {
    if (collisions[0]) {
      this.ySpeed = -this.jumpPower;
    } else if (collisions[2] && this.xSpeed > 0) {
      this.ySpeed = -this.jumpPower;
      this.xSpeed = -this.xMaxSpeed;
    } else if (collisions[3] && this.xSpeed < 0) {
      this.ySpeed = -this.jumpPower;
      this.xSpeed = this.xMaxSpeed;
    }
  }

  collision(platforms) {
    const bottom = this.y + this.height;
    const top = this.y;
    const left = this.x;
    const right = this.x + this.width;
    const ret = [false, false, false, false];

    platforms.forEach(i => {
      if (
        i.x < right &&
        left < i.x + i.width &&
        i.y <= bottom + this.ySpeed &&
        bottom + this.ySpeed <= i.y + i.height
      ) {
        ret[0] = i; // bottom collision
      }
      if (
        i.x < right &&
        left < i.x + i.width &&
        top + this.ySpeed <= i.y + i.height &&
        i.y <= top + this.ySpeed
      ) {
        ret[1] = i; // top collision
      }
      if (
        i.x <= right + this.xSpeed &&
        right + this.xSpeed <= i.x + i.width &&
        i.y < bottom &&
        top < i.y + i.height
      ) {
        ret[2] = i; // right collision
      }
      if (
        i.x <= left + this.xSpeed &&
        left + this.xSpeed <= i.x + i.width &&
        i.y < bottom &&
        top < i.y + i.height
      ) {
        ret[3] = i; // left collision
      }
    });
    if (ret[0] && (ret[0] == ret[2] || ret[0] == ret[3])) {
      ret[0] = false;
    } else if (ret[1] && (ret[1] == ret[2] || ret[1] == ret[3])) {
      ret[1] = false;
    }
    return ret;
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

      let armEndX = Math.cos(angle) * this.armLength;
      let armEndY = Math.sin(angle) * this.armLength;

      if (deltaX < 0) {
        armEndX = -armEndX;
        armEndY = -armEndY;
      }

      context.lineWidth = 15;
      context.strokeStyle = '#000';
      context.beginPath();
      context.moveTo(this.getCenterX(), this.getCenterY());
      context.lineTo(this.getCenterX() + armEndX, this.getCenterY() + armEndY);
      context.stroke();
    }
  }
}
