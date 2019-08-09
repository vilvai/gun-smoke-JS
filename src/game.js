import Sketch from './lib/sketch.js';

import {
  GAME_WIDTH,
  GAME_HEIGHT,
  COUNTDOWN,
  GAME_STATE_LINK,
  GAME_STATE_AIM_DOWN,
  GAME_STATE_READY,
  GAME_STATE_GAME_STARTED,
  GAME_STATE_GAME_WON,
  GAME_STATE_GAME_LOST,
  PLAYER_HEIGHT,
} from './constants.js';

import Player, { GenericPlayer } from './player/player.js';
import Platform from './platform.js';
import Bullet from './bullet.js';
import Background from './background.js';
import BloodPool from './bloodPool.js';

import { setupPeer, connectToHost } from './network/util.js';
import { getHostId, createRandomId } from './utils.js';

export default class Game {
  constructor(container, onSetGameState) {
    this.onSetGameState = onSetGameState;

    this.player = null;
    this.playerId = null;
    this.otherPlayersById = {};
    this.allPlayersDataById = {};
    this.playerIsHost = false;
    this.connectionsById = {};
    this.hostConnection = null;
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
    this.bloodPools = [];

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

      if (hostId === 'DEBUG') {
        this.startGame();
        this.playerIsHost = true;
        this.player = new Player(180, 300);
      } else if (!hostId) {
        this.playerIsHost = true;

        setupPeer(this.onReceiveData).then(peer => {
          this.playerId = peer.id;
          this.onSetGameState({
            gameState: GAME_STATE_LINK,
            linkText: `${window.location.href}?host=${peer.id}`,
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
      this.updatePlayers(ctx.keys, ctx.mouse);
      this.updateBullets();
      this.checkCountdown();
      this.checkGameOver();
      this.sendPlayerData();
      this.mouseClicked = false;
    };

    ctx.draw = () => {
      this.background.draw(ctx);
      this.platforms.forEach(platform => platform.draw(ctx));
      this.bullets.forEach(bullet => bullet.draw(ctx));
      if (this.player) this.player.draw(ctx, this.isGameStarted);
      Object.values(this.otherPlayersById).forEach(otherPlayer =>
        otherPlayer.draw(ctx, this.isGameStarted)
      );
    };
  }

  updatePlayers = (keys, mouse) => {
    if (this.player) {
      this.player.update(
        keys,
        this.platforms,
        mouse.x,
        mouse.y,
        this.mouseClicked,
        this.isGameStarted,
        this.isGameOver,
        this.onShoot,
        this.onJump,
        this.onLand,
        this.onReload
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

    Object.entries(this.otherPlayersById).forEach(([id, otherPlayer]) =>
      otherPlayer.update(
        this.allPlayersDataById[id],
        this.isGameStarted,
        this.isGameOver
      )
    );
  };

  updateBullets = () =>
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

  checkCountdown = () => {
    if (!this.isGameStarted && this.player) {
      if (!this.player.isAimingDown) {
        this.onSetGameState({ gameState: GAME_STATE_AIM_DOWN });
      } else {
        this.onSetGameState({ gameState: GAME_STATE_READY });
      }
      if (
        Object.values(this.allPlayersDataById).every(
          player => player.isAimingDown
        )
      )
        this.countdownLeft -= 1;
      else this.countdownLeft = COUNTDOWN;

      if (this.countdownLeft === 0 && this.playerIsHost) {
        Object.values(this.connectionsById).forEach(connection =>
          connection.send({ type: 'startGame' })
        );
        this.startGame();
      }
    }
  };

  checkGameOver = () => {
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
  };

  onJump = (playerX, playerY) =>
    this.sendData({
      type: 'jump',
      playerId: this.playerId,
      playerX,
      playerY,
    });

  onLand = (playerX, playerY, ySpeed) =>
    this.sendData({
      type: 'land',
      playerId: this.playerId,
      playerX,
      playerY,
      ySpeed,
    });

  onReload = () =>
    this.sendData({
      type: 'reload',
      playerId: this.playerId,
    });

  onShoot = (x, y, angle) => {
    const bulletId = createRandomId();
    this.sendData({
      type: 'bullet',
      x,
      y,
      angle,
      bulletId,
    });
    this.createBullet(x, y, angle, bulletId);
  };

  createBullet = (x, y, angle, bulletId) => {
    this.bullets.push(new Bullet(x, y, angle, bulletId));
  };

  onRemoveBullet = bulletId => {
    this.bullets = this.bullets.filter(bullet => bullet.id !== bulletId);
  };

  createBloodPool = (x, y, platform) => {
    this.bloodPools.push(new BloodPool(x, y, platform));
  };
  onHitPlayer = (x, y, angle, bulletId) => {
    const random = Math.random();
    this.player.onHit(x, y, angle, random, this.gameOver);
    let playerId = this.playerId;
    this.sendData({ type: 'hit', x, y, angle, random, playerId, bulletId });
  };

  onHitPlatform = bulletId => {
    this.onRemoveBullet(bulletId);
    this.sendData({ type: 'hitPlatform', bulletId });
  };

  sendPlayerData = () => {
    if (this.playerIsHost) {
      Object.values(this.connectionsById).forEach(connection =>
        connection.send({
          type: 'players',
          players: this.allPlayersDataById,
        })
      );
    } else if (this.hostConnection) {
      this.hostConnection.send({
        type: 'players',
        players: {
          [this.playerId]: this.allPlayersDataById[this.playerId],
        },
      });
    }
  };

  sendData = data => {
    if (this.playerIsHost) {
      Object.values(this.connectionsById).forEach(connection =>
        connection.send(data)
      );
    } else this.hostConnection.send(data);
  };

  onReceiveData = data => {
    if (!data.type) return;
    switch (data.type) {
      case 'players': {
        Object.entries(data.players).forEach(
          ([id, playerData]) => (this.allPlayersDataById[id] = playerData)
        );
        break;
      }
      case 'bullet': {
        this.createBullet(data.x, data.y, data.angle, data.bulletId);
        break;
      }
      case 'startGame': {
        this.startGame();
        break;
      }
      case 'hit': {
        this.onRemoveBullet(data.bulletId);
        let x = data.x;
        let y = data.y;
        this.otherPlayersById[data.playerId].onHit(
          x,
          y,
          data.angle,
          data.random
        );
        /* let platform = null;
        platform = this.platforms.filter(p => {
          let playerLegs = y - PLAYER_HEIGHT;
          x > p.x && x < p.x + p.width && p.y + p.height < playerLegs;
        });
        console.log(platform);
        console.log(
          x,
          platform.x,
          platform.x + platform.width,
          platform.y + platform.height,
          y - PLAYER_HEIGHT
        );
        if (platform) {
          this.createBloodPool(x, y, platform);
        } */
        break;
      }
      case 'hitPlatform': {
        this.onRemoveBullet(data.bulletId);
        break;
      }
      case 'gameOver': {
        this.onSetGameState({
          gameState: GAME_STATE_GAME_WON,
          gameStateTextFade: false,
        });
        this.isGameOver = true;
        break;
      }
      case 'rematch': {
        const otherPlayerId = Object.keys(this.otherPlayersById)[0];
        this.setupGame(otherPlayerId);
        break;
      }
      case 'jump': {
        const { playerId, playerX, playerY } = data;
        this.otherPlayersById[playerId].createJumpParticles(playerX, playerY);
        break;
      }
      case 'land': {
        const { playerId, playerX, playerY, ySpeed } = data;
        this.otherPlayersById[playerId].createLandParticles(
          playerX,
          playerY,
          ySpeed
        );
        break;
      }
      case 'reload': {
        const { playerId } = data;
        this.otherPlayersById[playerId].reload();
        break;
      }
      default:
        break;
    }
  };

  onDisconnect = () => {
    alert('Other player disconnected!');
  };

  startStandoff = connection => {
    if (this.playerIsHost) this.connectionsById[connection.peer] = connection;
    else this.hostConnection = connection;
    this.setupGame(connection.peer);
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

  gameOver = () => {
    this.onSetGameState({
      gameState: GAME_STATE_GAME_LOST,
      gameStateTextFade: false,
    });
    this.isGameOver = true;
    this.sendData({ type: 'gameOver' });
  };
}
