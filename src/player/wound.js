import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  HAT_WIDTH,
  HAT_HEIGHT,
} from '../constants.js';

export default class Wound {
  constructor(playerX, playerY, relativeX, relativeY, angle) {
    playerY = playerY - HAT_HEIGHT;
    this.x = playerX + relativeX;
    this.y = playerY + relativeY;
    this.relativeX = relativeX;
    this.relativeY = relativeY;
    this.angle = angle;
    this.bloodMains = initGore([1, 2], [10, 20], [10, 15], [1, 5], [2, 5]);
    this.bloodSplatters = initGore([3, 4], [1, 4], [5, 30], [10, 20], [1, 4]);
    this.goreHoles = initGore([0, 2], [2, 6], [2, 6], [1, 5], [0, 5]);

    function initGore(
      [stainsMin, stainsMax],
      [xMin, xMax],
      [yMin, yMax],
      [xSpreadMin, xSpreadMax],
      [ySpreadMin, ySpreadMax]
    ) {
      let stains = [];
      let stain_c = getRandomArbitrary(stainsMin, stainsMax);

      for (let j = 0; j < stain_c; j++) {
        stains.push({
          x: getRandomArbitrary(xMin, xMax),
          y: getRandomArbitrary(yMin, yMax),
          spreadX: getRandomArbitrary(xSpreadMin, xSpreadMax) + j,
          spreadY: getRandomArbitrary(ySpreadMin, ySpreadMax) + j,
        });
      }
      return stains;
    }

    function getRandomArbitrary(min, max) {
      let random = Math.random() * (max - min) + min;
      return random;
    }
  }

  update(x, y) {
    this.x = x + this.relativeX;
    this.y = y + this.relativeY;
  }

  draw(context, playerX, playerY) {
    const goreHoleColor = 'rgba(	25, 0, 1, 1)';
    const bloodColor = '#c21818';

    this.bloodMains.forEach(bm => drawGore(this, bm, bloodColor, true));
    this.bloodSplatters.forEach(bs => drawGore(this, bs, bloodColor));
    this.goreHoles.forEach(gh => drawGore(this, gh, goreHoleColor, true));

    //Draw blood main, splatter and goryholes
    function drawGore(wound, gore, color, show_overflow = false) {
      debugger;
      let x = gore.x;
      let y = gore.y;
      let angle = wound.angle;
      let spreadX = wound.x;
      spreadX =
        angle > -0.2 && angle < 0.32
          ? spreadX - x + gore.spreadX
          : spreadX - x - gore.spreadX;
      let spreadY = wound.y - y + gore.spreadY;

      let playerWidth = playerX + PLAYER_WIDTH;
      let playerHeight = playerY + PLAYER_HEIGHT;
      context.fillStyle = color;
      if (
        show_overflow ||
        (spreadX > playerX &&
          spreadX < playerWidth &&
          spreadY > playerY &&
          spreadY < playerHeight)
      )
        context.fillRect(spreadX, spreadY, x, y);
    }
  }
}
