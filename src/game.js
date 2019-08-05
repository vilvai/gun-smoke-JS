import Sketch from './lib/sketch.js';

import { GAME_WIDTH, GAME_HEIGHT, COUNTDOWN } from './constants.js';
import {
  GAME_STATE_LINK,
  GAME_STATE_AIM_DOWN,
  GAME_STATE_READY,
  GAME_STATE_GAME_STARTED,
  GAME_STATE_GAME_WON,
  GAME_STATE_GAME_LOST,
} from './app.jsx';

import Player, { GenericPlayer } from './player/player.js';
import Platform from './platform.js';
import Bullet from './bullet.js';
import Background from './background.js';

import { setupPeer, connectToHost } from './network/util.js';
import { getHostId, createRandomId } from './utils.js';

export default class Game {
  constructor(container, onSetGameState) {
    this.onSetGameState = onSetGameState;

    this.player;
    this.playerId;
    this.otherPlayersById = {};
    this.allPlayersDataById = {};
    this.playerIsHost = false;
    this.connectionsById = {};
    this.hostConnection;
    this.resetRequestSent = false;

    this.mouseClicked = false;
    this.isGameStarted = false;
    this.isGameOver = false;
    this.countdownLeft = COUNTDOWN;

    this.background = new Background();
    this.platforms = [
      // bounding box
      new Platform(0, 670, 1280, 100, true), // floor
      new Platform(0, -50, 1280, 50, true), // ceiling
      new Platform(-50, 0, 50, 720, true), // left wall
      new Platform(1280, 0, 50, 720, true), // right wall

      // platforms
      new Platform(340, 490, 600, 30, false),
      new Platform(0, 320, 150, 30, false),
      new Platform(1130, 320, 150, 30, false),
      new Platform(390, 310, 500, 30, false),
    ];
    this.bullets = [];

    const ctx = Sketch.create({
      container,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      fullscreen: false,
      autopause: false,
      eventTarget: document,
    });

    ctx.setup = () => {
      const hostId = getHostId(window.location.href);
      const onError = alert;

      if (hostId == 'DEBUG') {
        this.startGame();
        this.playerIsHost = true;
        this.player = new Player(180, 300);
        return;
      } else if (!hostId) {
        this.playerIsHost = true;

        setupPeer(this.onReceiveData).then(peer => {
          this.playerId = peer.id;
          this.onSetGameState({
            gameState: GAME_STATE_LINK,
            linkText: window.location.href + '?host=' + peer.id,
          });

          peer.on('connection', connection => {
            this.startStandoff(connection);
            connection.on('data', this.onReceiveData);
            connection.on('close', this.onDisconnect);
            setTimeout(() => peer.disconnect(), 1000);
          });
        }, onError);
      } else {
        this.playerIsHost = false;
        setupPeer(this.onReceiveData)
          .then(peer => {
            this.playerId = peer.id;
            return connectToHost(
              peer,
              hostId,
              this.onReceiveData,
              this.onDisconnect
            );
          }, onError)
          .then(connection => {
            this.onSetGameState({ scorePositionsReversed: true });
            this.startStandoff(connection);
          });
      }
    };

    ctx.mousedown = () => (this.mouseClicked = true);

    ctx.update = () => {
      if (this.player) {
        this.player.update(
          ctx.keys,
          this.platforms,
          ctx.mouse.x,
          ctx.mouse.y,
          this.mouseClicked,
          this.isGameStarted,
          this.isGameOver,
          this.onShoot
        );

        const {
          x,
          y,
          angle,
          gunRecoil,
          isAimingDown,
          movementType,
          isTouchingGround,
          isReadyToRematch,
        } = this.player;

        this.allPlayersDataById[this.playerId] = {
          x,
          y,
          angle,
          gunRecoil,
          isAimingDown,
          movementType,
          isTouchingGround,
          isReadyToRematch,
        };
      }

      if (!this.isGameStarted && this.player) {
        if (!this.player.isAimingDown)
          this.onSetGameState({ gameState: GAME_STATE_AIM_DOWN });
        else this.onSetGameState({ gameState: GAME_STATE_READY });
        if (
          Object.values(this.allPlayersDataById).every(
            player => player.isAimingDown
          )
        )
          this.countdownLeft -= 1;
        else this.countdownLeft = COUNTDOWN;

        if (this.countdownLeft == 0 && this.playerIsHost) {
          Object.values(this.connectionsById).forEach(connection =>
            connection.send({ type: 'startGame' })
          );
          this.startGame();
        }
      }
      Object.entries(this.otherPlayersById).forEach(([id, otherPlayer]) =>
        otherPlayer.update(
          this.allPlayersDataById[id],
          this.isGameStarted,
          this.isGameOver
        )
      );
      this.bullets.forEach(bullet =>
        bullet.update(
          this.onRemoveBullet,
          this.onHitPlayer,
          this.onHitPlatform,
          this.player.x,
          this.player.y,
          this.platforms
        )
      );
      this.mouseClicked = false;
      if (
        this.playerIsHost &&
        this.isGameOver &&
        !this.resetRequestSent &&
        Object.values(this.allPlayersDataById).every(
          player => player.isReadyToRematch
        )
      ) {
        const otherPlayerId = Object.keys(this.otherPlayersById)[0];
        this.resetRequestSent = true;
        this.setupGame(otherPlayerId);
        this.sendData({ type: 'rematch' });
      }
      this.sendPlayerData();
    };

    ctx.draw = () => {
      this.background.draw(ctx);

      this.platforms.forEach(platform => platform.draw(ctx));
      this.bullets.forEach(bullet => bullet.draw(ctx));

      if (this.player) this.player.draw(ctx);

      Object.values(this.otherPlayersById).forEach(otherPlayer =>
        otherPlayer.draw(ctx)
      );
    };
  }

  sendPlayerData = () => {
    if (this.playerIsHost) {
      Object.values(this.connectionsById).forEach(connection =>
        connection.send({
          type: 'players',
          players: this.allPlayersDataById,
        })
      );
    } else {
      this.hostConnection &&
        this.hostConnection.send({
          type: 'players',
          players: {
            [this.playerId]: this.allPlayersDataById[this.playerId],
          },
        });
    }
  };

  sendData = data => {
    if (this.playerIsHost)
      Object.values(this.connectionsById).forEach(connection =>
        connection.send(data)
      );
    else this.hostConnection.send(data);
  };

  onReceiveData = data => {
    if (!data.type) return;
    switch (data.type) {
      case 'players':
        Object.entries(data.players).forEach(
          ([id, playerData]) => (this.allPlayersDataById[id] = playerData)
        );
        break;
      case 'bullet':
        this.createBullet(data.x, data.y, data.angle, data.bulletId);
        break;
      case 'startGame':
        this.startGame();
        break;
      case 'hit':
        this.onRemoveBullet(data.bulletId);
        this.otherPlayersById[data.playerId].onHit(data.angle, data.random);
        break;
      case 'hitPlatform':
        this.onRemoveBullet(data.bulletId);
        break;
      case 'gameOver':
        this.onSetGameState({
          gameState: GAME_STATE_GAME_WON,
          gameStateTextFade: false,
        });
        this.isGameOver = true;
        break;
      case 'rematch':
        const otherPlayerId = Object.keys(this.otherPlayersById)[0];
        this.setupGame(otherPlayerId);
      default:
    }
  };

  startStandoff = connection => {
    if (this.playerIsHost) this.connectionsById[connection.peer] = connection;
    else this.hostConnection = connection;
    this.setupGame(connection.peer);
  };

  gameOver = () => {
    this.onSetGameState({
      gameState: GAME_STATE_GAME_LOST,
      gameStateTextFade: false,
    });
    this.isGameOver = true;
    this.sendData({ type: 'gameOver' });
  };

  setupGame = otherPlayerId => {
    this.isGameStarted = false;
    this.isGameOver = false;
    this.countdownLeft = COUNTDOWN;
    this.resetRequestSent = false;
    if (this.playerIsHost) {
      this.player = new Player(180, 300);
      this.otherPlayersById[otherPlayerId] = new GenericPlayer(780, 300);
      this.allPlayersDataById[otherPlayerId] = { x: 1060, y: 300 };
    } else {
      this.player = new Player(1060, 300);
      this.otherPlayersById[otherPlayerId] = new GenericPlayer(180, 300);
      this.allPlayersDataById[otherPlayerId] = { x: 180, y: 300 };
    }
    this.onSetGameState({ gameState: GAME_STATE_AIM_DOWN });
  };

  startGame = () => {
    this.isGameStarted = true;
    this.onSetGameState({ gameState: GAME_STATE_GAME_STARTED });
    setTimeout(
      () =>
        !this.isGameOver && this.onSetGameState({ gameStateTextFade: true }),
      2000
    );
  };

  onShoot = (x, y, angle) => {
    const bulletId = createRandomId();
    this.sendData({ type: 'bullet', x, y, angle, bulletId });
    this.createBullet(x, y, angle, bulletId);
  };

  createBullet = (x, y, angle, bulletId) => {
    this.bullets.push(new Bullet(x, y, angle, bulletId));
  };

  onRemoveBullet = bulletId => {
    this.bullets = this.bullets.filter(bullet => bullet.id !== bulletId);
  };

  onHitPlayer = (angle, bulletId) => {
    const random = Math.random();
    this.player.onHit(angle, random, this.gameOver);
    this.sendData({
      type: 'hit',
      angle,
      random,
      playerId: this.playerId,
      bulletId,
    });
  };

  onHitPlatform = bulletId => {
    this.onRemoveBullet(bulletId);
    this.sendData({ type: 'hitPlatform', bulletId });
  };

  onDisconnect = () => {
    alert('Other player disconnected!');
  };
}
