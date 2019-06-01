import React, { Component } from 'react';

import Game from './game.js';

import './App.css';

export const GAME_STATES = {
  LOADING: 'LOADING',
  LINK: 'LINK',
  READY_SCREEN: 'READY_SCREEN',
  IN_GAME: 'IN_GAME',
};

export default class App extends Component {
  state = {
    gameState: GAME_STATES.LOADING,
    linkText: null,
  };

  componentDidMount() {
    new Game(this.handleChangeGameState, this.handleSetLinkText);
  }

  handleChangeGameState = gameState => this.setState({ gameState });

  handleSetLinkText = linkText =>
    this.setState({
      gameState: gameState.LINK,
      linkText,
    });

  renderOverlay() {
    const { gameState, linkText } = this.state;
    switch (gameState) {
      case GAME_STATES.LOADING:
        return 'Loading…'
      case GAME_STATES.LINK:
        return (
          <div className={}>
          </div>
        )
      default:
        return null;
    }
    if (!overlayText) return null;
    return;
  }

  render() {
    const { gameState } = this.state;

    return (
      <div>
        {gameState !== GAME_STATES.IN_GAME && (
          <div className="loading-overlay">{this.renderOverLay()}</div>
        )}
        <div id="sketch-container" />
      </div>
    );
  }
}
