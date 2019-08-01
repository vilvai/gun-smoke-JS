import React, { Component } from 'react';
import cx from 'classnames';

import Game from './game.js';

import styles from './styles/app.module.css';

const GAME_STATES = {
  LOADING: 'LOADING',
  LINK: 'LINK',
  READY_SCREEN: 'READY_SCREEN',
  STANDOFF: 'STANDOFF',
  GAME_STARTED: 'GAME_STARTED',
};

export default class App extends Component {
  state = {
    gameState: GAME_STATES.LOADING,
    linkText: null,
    countdownText: 'Aim down',
    countdownFade: false,
  };

  componentDidMount() {
    new Game(
      this.sketchContainer,
      this.handleSetLinkText,
      this.handlePlayerJoined,
      this.handleStartStandoff,
      this.handleCountdownTextChange,
      this.handleStartGame
    );
  }

  handleSetLinkText = linkText =>
    this.setState({
      gameState: GAME_STATES.LINK,
      linkText,
    });

  handlePlayerJoined = () =>
    this.setState({
      gameState: GAME_STATES.READY_SCREEN,
    });

  handleStartStandoff = () =>
    this.setState({
      gameState: GAME_STATES.STANDOFF,
    });

  handleCountdownTextChange = countdownText =>
    this.state.countdownText !== countdownText &&
    this.setState({
      countdownText,
    });

  handleStartGame = () => {
    this.setState({
      gameState: GAME_STATES.GAME_STARTED,
      countdownText: 'Fire!',
    });
    setTimeout(() => this.setState({ countdownFade: true }), 2000);
  };

  renderOverlay() {
    const { gameState, linkText } = this.state;
    switch (gameState) {
      case GAME_STATES.LOADING:
        return 'Loading…';
      case GAME_STATES.LINK:
        return (
          <div className={styles.linkContainer}>
            <span>Share this link with a friend:</span>
            <span>{linkText}</span>
          </div>
        );
      case GAME_STATES.READY_SCREEN:
        // Ready screen will go here if it's implemented
        return null;
      default:
        return null;
    }
  }

  renderCountdown() {
    const { gameState, countdownText, countdownFade } = this.state;
    if (
      gameState == GAME_STATES.STANDOFF ||
      gameState == GAME_STATES.GAME_STARTED
    )
      return (
        <div
          className={cx(styles.countdown, {
            [styles.countdownFade]: countdownFade,
          })}
        >
          {countdownText}
        </div>
      );
  }

  render() {
    const { gameState, countdownText } = this.state;
    return (
      <div>
        {gameState !== GAME_STATES.STANDOFF &&
          gameState !== GAME_STATES.GAME_STARTED && (
            <div className={styles.loadingOverlay}>{this.renderOverlay()}</div>
          )}
        {this.renderCountdown()}
        <div
          className={cx(styles.sketchContainer, {
            [styles.blurEffect]:
              gameState !== GAME_STATES.STANDOFF &&
              gameState !== GAME_STATES.GAME_STARTED,
          })}
          ref={ref => (this.sketchContainer = ref)}
        />
      </div>
    );
  }
}
