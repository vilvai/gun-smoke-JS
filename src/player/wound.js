import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  HAT_WIDTH,
  HAT_HEIGHT,
} from '../constants.js';

const TO_RADIANS = Math.PI / 180;

export default class Wound {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.bloodMains = initBloodMains(x, y);
    this.bloodSplatters = initBloodSplatters(x, y);
    this.goreHoles = initGoreHoles(x, y);

    function initBloodMains(x, y) {
      let bloodMains = [];
      let bloodMains_c = getRandomArbitrary(1, 3);
      for (let j = 0; j < bloodMains_c; j++) {
        bloodMains.push({
          xrand: getRandomArbitrary(4, 20),
          yrand: getRandomArbitrary(4, 20),
        });
      }
      return bloodMains;
    }

    function initBloodSplatters(x, y) {
      let bloodSplatters = [];
      let bloodSplatters_c = getRandomArbitrary(5, 10);
      for (let j = 0; j < bloodSplatters_c; j++) {
        bloodSplatters.push({
          xrand: getRandomArbitrary(1, 4),
          xsplatterDistance: getRandomArbitrary(21, 40) + j,
          ysplatterDistance: getRandomArbitrary(21, 40) + j,
          yrand: getRandomArbitrary(1, 4),
        });
      }
      return bloodSplatters;
    }

    function initGoreHoles(x, y) {
      let goreHoles = [];
      let goreHole_c = getRandomArbitrary(1, 3);

      for (let j = 0; j < goreHole_c; j++) {
        goreHoles.push({
          xrand: getRandomArbitrary(4, 10),
          yrand: getRandomArbitrary(4, 10),
        });
      }
      return goreHoles;
    }

    function getRandomArbitrary(min, max) {
      let random = Math.random() * (max - min) + min;
      return random;
    }
  }

  update(x, y) {
    this.x += x;
    this.y += y;
  }

  draw(context) {
    const goreHoleColor = 'rgba(244, 165, 179, 1)';
    const bloodColor = '#c21818';

    //Draw blood main, splatter and goryholes
    this.bloodMains.forEach(bm => {
      context.fillStyle = bloodColor;
      context.fillRect(
        this.x - bm.xrand,
        this.y - bm.yrand,
        bm.xrand,
        bm.yrand
      );
    });

    this.bloodSplatters.forEach(bs => {
      context.fillStyle = bloodColor;
      context.fillRect(
        this.x - bs.xrand - bs.xsplatterDistance,
        this.y - bs.yrand - bs.ysplatterDistance,
        bs.xrand,
        bs.yrand
      );
    });

    this.goreHoles.forEach(gh => {
      context.fillStyle = goreHoleColor;
      context.fillRect(
        this.x - gh.xrand,
        this.y - gh.yrand,
        gh.xrand,
        gh.yrand
      );
    });
  }
}
