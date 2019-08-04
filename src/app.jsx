import React, { Component } from 'react';
import cx from 'classnames';

import Overlay from './overlay.jsx';
import Game from './game.js';

import styles from './styles/app.module.css';

export const GAME_STATE_LOADING = 'LOADING';
export const GAME_STATE_LINK = 'LINK';
export const GAME_STATE_AIM_DOWN = 'AIM_DOWN';
export const GAME_STATE_READY = 'READY';
export const GAME_STATE_GAME_STARTED = 'GAME_STARTED';
export const GAME_STATE_GAME_WON = 'GAME_WON';
export const GAME_STATE_GAME_LOST = 'GAME_LOST';

export default class App extends Component {
  state = {
    gameState: GAME_STATE_LOADING,
    linkText: null,
    gameStateTextFade: false,
  };

  componentDidMount() {
    new Game(this.sketchContainer, this.handleSetState);
  }

  handleSetState = state => this.setState(state);

  renderGameStateText() {
    const { gameState } = this.state;
    switch (gameState) {
      case GAME_STATE_AIM_DOWN:
        return 'Aim down';
      case GAME_STATE_READY:
        return 'Ready...';
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
