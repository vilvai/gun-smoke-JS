function drawImageCenter(image, x, y, cx, cy, scale, rotation, ctx, alfa) {
  ctx.setTransform(scale, 0, 0, scale, x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alfa;
  ctx.drawImage(image, -cx, -cy);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}

var image = new Image();
image.src = 'images/particle.png';
var time;

time = new Date();
var emitTime = time.getTime();

function isOkToEmit(player) {
  if (player.isMoving && player.isTouchingGround) {
    return true;
  } else {
    return false;
  }
}

function checkEmitTime() {
  time = new Date();
  if (time.getTime() - emitTime > 16) {
    return true;
  } else {
    return false;
  }
}

export default class Particlesystem_Smoke {
  constructor() {
    this.sprites = [];
  }

  draw(context, player) {
    if (checkEmitTime() && isOkToEmit(player)) {
      this.sprites.push([player.x, player.y, 0.25, 1]);
    }

    this.sprites.forEach(function(currentValue, index, array) {
      currentValue[2] += 0.05; // SCALE

      currentValue[1] -= 0.5; //POSITION

      if (currentValue[3] >= 0.03) {
        // ALFA

        currentValue[3] -= 0.03;
      } else {
        currentValue[3] = 0;
        array.splice(index, 1);
      }

      drawImageCenter(
        image,
        currentValue[0],
        currentValue[1] + 80,
        8,
        8,
        currentValue[2],
        0,
        context,
        currentValue[3]
      );
      time = new Date();
      emitTime = time.getTime();
    });
  }
}
