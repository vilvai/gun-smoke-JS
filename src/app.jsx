import React, { Component } from 'react';
import cx from 'classnames';

import Overlay from './overlay.jsx';
import Game from './game.js';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GAME_STATE_LOADING,
  GAME_STATE_LINK,
  GAME_STATE_AIM_DOWN,
  GAME_STATE_READY,
  GAME_STATE_GAME_STARTED,
  GAME_STATE_GAME_WON,
  GAME_STATE_GAME_LOST,
} from './constants.js';

import styles from './styles/app.module.css';

export default class App extends Component {
  state = {
    gameState: GAME_STATE_LOADING,
    linkText: null,
    gameStateTextFade: false,
    ownScore: 0,
    opponentScore: 0,
    scorePositionsReversed: false,
  };

  componentDidMount() {
    this.game = new Game(this.sketchContainer, this.handleSetState);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.gameState !== this.state.gameState) {
      if (this.state.gameState === GAME_STATE_GAME_WON) {
        this.setState({ ownScore: this.state.ownScore + 1 });
      } else if (this.state.gameState === GAME_STATE_GAME_LOST) {
        this.setState({ opponentScore: this.state.opponentScore + 1 });
      }
    }
  }

  handleSetState = state => this.setState(state);

  renderGameStateText() {
    const { gameState } = this.state;
    switch (gameState) {
      case GAME_STATE_AIM_DOWN:
        return 'Aim down';
      case GAME_STATE_READY:
        return 'Ready…';
      case GAME_STATE_GAME_STARTED:
        return 'Fire!';
      case GAME_STATE_GAME_WON:
        return 'You won! Press Enter for a rematch';
      case GAME_STATE_GAME_LOST:
        return 'You lost! Press Enter for a rematch';
      default:
        return null;
    }
  }

  renderScore() {
    const {
      gameState,
      ownScore,
      opponentScore,
      scorePositionsReversed,
    } = this.state;
    if (gameState === GAME_STATE_LOADING || gameState === GAME_STATE_LINK) {
      return null;
    }
    return (
      <div
        style={{
          width: GAME_WIDTH,
          top: `calc(50% - ${GAME_HEIGHT / 2}px)`,
          left: `calc(50% - ${GAME_WIDTH / 2}px)`,
        }}
        className={cx(styles.scoreContainer, {
          [styles.scoreReversed]: scorePositionsReversed,
        })}
      >
        <span>{ownScore}</span>
        <span>{opponentScore}</span>
      </div>
    );
  }

  render() {
    const { gameState, gameStateTextFade, linkText } = this.state;
    return (
      <div>
        <Overlay gameState={gameState} linkText={linkText} />
        <div
          className={cx(styles.gameStateText, {
            [styles.gameStateTextFade]: gameStateTextFade,
          })}
        >
          {this.renderGameStateText()}
        </div>
        {this.renderScore()}
        <div
          className={cx(styles.sketchContainer, {
            [styles.blurEffect]:
              gameState === GAME_STATE_LOADING || gameState === GAME_STATE_LINK,
          })}
          ref={ref => (this.sketchContainer = ref)}
        />
      </div>
    );
  }
}
