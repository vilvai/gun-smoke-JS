import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  HAT_WIDTH,
  HAT_HEIGHT,
} from '../constants.js';

export default class Wound {
  constructor(playerX, playerY, relativeX, relativeY, angle) {
    playerY = playerY;
    this.x = playerX + relativeX;
    this.y = playerY + relativeY;
    this.relativeX = relativeX;
    this.relativeY = relativeY;
    this.angle = angle;
    this.bloodMains = initGore([1, 2], [10, 20], [10, 15], [0, 6], [2, 5]);
    this.bloodSplatters = initGore([3, 4], [1, 4], [5, 30], [10, 20], [1, 4]);
    this.goreHoles = initGore([0, 2], [2, 6], [2, 6], [1, 6], [0, 5]);

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
          width: getRandomArbitrary(xMin, xMax),
          height: getRandomArbitrary(yMin, yMax),
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
    function drawGore(wound, woundPart, color, showOverflow = false) {
      let width = woundPart.width;
      let height = woundPart.height;
      let angle = wound.angle;
      let x =
        angle > -0.2 && angle < 0.32
          ? wound.x + woundPart.spreadX
          : wound.x - width - woundPart.spreadX;
      let y = wound.y - height + woundPart.spreadY;

      let playerWidth = playerX + PLAYER_WIDTH;
      let playerHeight = playerY + PLAYER_HEIGHT;
      context.fillStyle = color;
      if (
        showOverflow ||
        (x > playerX && x < playerWidth && y > playerY && y < playerHeight)
      )
        context.fillRect(x, y, width, height);
    }
  }
}
