import React, { Component } from 'react';

import Game from './game.js';

import './App.css';

export default class App extends Component {
  componentDidMount() {
    this.game = new Game();
  }
  render() {
    return (
      <div>
        <div id="loading-overlay">Loading...</div>
        <div id="sketch-container" />
      </div>
    );
  }
}
