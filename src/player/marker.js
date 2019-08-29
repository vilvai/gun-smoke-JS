import { PLAYER_WIDTH } from '../constants.js';
import { resetContextTransform } from '../utils.js';

const READY = 'READY';
const NOT_READY = 'NOT_READY';

export default class Marker {
  constructor() {
    this.type = NOT_READY;
  }

  update(isAimingDown, isReadyToRematch, isGameStarted, isGameOver) {
    if (!isGameStarted) {
      if (isAimingDown) this.type = READY;
      else this.type = NOT_READY;
    } else if (isGameOver) {
      if (isReadyToRematch) this.type = READY;
      else this.type = NOT_READY;
    } else {
      this.type = null;
    }
  }

  draw(context, playerX, playerY) {
    const readyMarkerSize = 11;
    const readyMarkerPosition = 15;
    context.translate(
      playerX + PLAYER_WIDTH / 2,
      playerY - readyMarkerPosition
    );

    context.lineWidth = readyMarkerSize * 0.7;
    switch (this.type) {
      case READY:
        context.strokeStyle = 'green';
        context.beginPath();
        context.moveTo(-1.5 * readyMarkerSize, -readyMarkerSize);
        context.lineTo(-0.5 * readyMarkerSize, 0);
        context.lineTo(1.5 * readyMarkerSize, -2 * readyMarkerSize);
        context.stroke();
        break;
      case NOT_READY:
        context.strokeStyle = '#f00000';
        context.beginPath();
        context.moveTo(-1.25 * readyMarkerSize, 0.25 * readyMarkerSize);
        context.lineTo(1.25 * readyMarkerSize, -2.25 * readyMarkerSize);

        context.moveTo(-1.25 * readyMarkerSize, -2.25 * readyMarkerSize);
        context.lineTo(1.25 * readyMarkerSize, 0.25 * readyMarkerSize);
        // context.lineTo(1.5 * readyMarkerSize, -2 * readyMarkerSize);
        context.stroke();
        break;
      default:
        break;
    }
    resetContextTransform(context);
  }
}
