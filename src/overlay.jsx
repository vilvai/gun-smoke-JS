import React, { Component } from 'react';
import cx from 'classnames';

import { GAME_STATE_LOADING, GAME_STATE_LINK } from './constants.js';

import styles from './styles/overlay.module.css';

export default class Overlay extends Component {
  state = {
    tooltipVisible: false,
  };

  handleCopy = () => {
    if (this.inputElement && document.execCommand) {
      this.inputElement.select();
      document.execCommand('copy');
    }
    this.setState({ tooltipVisible: true });
  };

  handleMouseOver = () => this.inputElement && this.inputElement.select();

  handleMouseout = () => this.setState({ tooltipVisible: false });

  render() {
    const { gameState, linkText } = this.props;
    const { tooltipVisible } = this.state;
    switch (gameState) {
      case GAME_STATE_LOADING:
        return <div className={styles.loadingOverlay}>Loading…</div>;
      case GAME_STATE_LINK:
        return (
          <div className={styles.loadingOverlay}>
            <div className={styles.linkContainer}>
              <span>Share this link with a friend:</span>
              <div className={styles.linkTextContainer}>
                <input
                  ref={inputElement => (this.inputElement = inputElement)}
                  className={styles.linkText}
                  value={linkText}
                  onMouseOver={this.handleMouseOver}
                  readOnly
                />
                <button
                  className={styles.linkButton}
                  onClick={this.handleCopy}
                  onMouseOut={this.handleMouseout}
                  type="button"
                >
                  Copy
                  <div
                    className={cx(styles.linkTooltip, {
                      [styles.linkTooltipHidden]: !tooltipVisible,
                    })}
                  >
                    Link copied to clipboard
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}
