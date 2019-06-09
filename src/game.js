import Sketch from './lib/sketch.js';

import { GAME_WIDTH, GAME_HEIGHT, COUNTDOWN } from './constants.js';
import Player, { GenericPlayer } from './player.js';
import Platform from './platform.js';
import Bullet from './bullet.js';

import { setupPeer, connectToHost } from './network/util.js';

let player;
let playerId;
const otherPlayersById = {};
const allPlayersDataById = {};
export let playerIsHost = false;
const connectionsById = {};
let hostConnection;

let mouseClicked = false;
export let isRoundStarted = false;
let countdownLeft = COUNTDOWN;

const platforms = [
  // bounding box
  new Platform(0, 670, 1280, 100, true), // floor
  new Platform(0, -50, 1280, 50, true), // ceiling
  new Platform(-50, 0, 50, 720, true), // left wall
  new Platform(1280, 0, 50, 720, true), // right wall

  // platforms
  new Platform(340, 490, 600, 30, false),
  new Platform(0, 320, 150, 20, false),
  new Platform(1130, 320, 150, 20, false),
  new Platform(390, 310, 500, 20, false),
  // new Platform(340, 500, 600, 30, false),
];

let bullets = [];

const getHostId = address => {
  const hrefArray = window.location.href.split('?');
  if (hrefArray.length == 1) return false;
  if (!hrefArray[1].includes('host=')) return false;
  return hrefArray[1].split('host=')[1];
};

const sendPlayerData = () => {
  if (playerIsHost) {
    Object.values(connectionsById).forEach(connection =>
      connection.send({
        type: 'players',
        players: allPlayersDataById,
      })
    );
  } else {
    hostConnection &&
      hostConnection.send({
        type: 'players',
        players: {
          [playerId]: allPlayersDataById[playerId],
        },
      });
  }
};

const sendBulletData = (x, y, angle) => {
  if (playerIsHost) {
    Object.values(connectionsById).forEach(connection =>
      connection.send({
        type: 'bullet',
        x,
        y,
        angle,
      })
    );
  } else {
    hostConnection.send({
      type: 'bullet',
      x,
      y,
      angle,
    });
  }
};

export const onReceiveData = data => {
  if (!data.type) return;
  switch (data.type) {
    case 'players':
      Object.entries(data.players).forEach(
        ([id, playerData]) => (allPlayersDataById[id] = playerData)
      );
      break;
    case 'bullet':
      createBullet(data.x, data.y, data.angle);
      break;
    case 'round':
      console.log('ROUND STARTED');
      isRoundStarted = data.isRoundStarted;
      startGameHandler();
      break;
    default:
  }
};

export const startGame = connection => {
  if (playerIsHost) {
    connectionsById[connection.peer] = connection;
    player = new Player(180, 300);
    otherPlayersById[connection.peer] = new GenericPlayer(780, 300);
    allPlayersDataById[connection.peer] = {
      x: 780,
      y: 300,
    };
  } else {
    hostConnection = connection;
    player = new Player(780, 300);
    otherPlayersById[connection.peer] = new GenericPlayer(180, 300);
    allPlayersDataById[connection.peer] = {
      x: 180,
      y: 300,
    };
  }
};

const onShoot = (x, y, angle) => {
  sendBulletData(x, y, angle);
  createBullet(x, y, angle);
};

const createBullet = (x, y, angle) => {
  bullets.push(new Bullet(x, y, angle));
};

const onRemoveBullet = bulletToRemove => {
  bullets = bullets.filter(bullet => bullet != bulletToRemove);
};

export const onEndGame = () => {
  alert('Game ended');
};
let startGameHandler;
export default class Game {
  constructor(
    container,
    onSetLinkText,
    onPlayerJoin,
    onStartStandoff,
    onChangeCountdownText,
    onStartGame
  ) {
    startGameHandler = onStartGame;
    this.onChangeCountdownText = onChangeCountdownText;
    const ctx = Sketch.create({
      container,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      fullscreen: false,
      autopause: false,
    });
    ctx.setup = () => {
      const hostId = getHostId(window.location.href);
      const onError = alert;
      if (hostId == 'DEBUG') {
        onStartGame();
        playerIsHost = true;
        player = new Player(180, 300);
        return;
      } else if (!hostId) {
        playerIsHost = true;
        setupPeer(onReceiveData, onEndGame).then(peer => {
          playerId = peer.id;
          onSetLinkText('localhost:8080/?host=' + peer.id);
          peer.on('connection', connection => {
            startGame(connection);
            onStartStandoff();
            connection.on('data', onReceiveData);
            connection.on('close', onEndGame);
          });
        }, onError);
      } else {
        playerIsHost = false;
        setupPeer(onReceiveData, onEndGame)
          .then(peer => {
            playerId = peer.id;
            return connectToHost(peer, hostId, onReceiveData, onEndGame);
          }, onError)
          .then(connection => {
            startGame(connection);
            onStartStandoff();
          });
      }
    };
    ctx.mousedown = () => (mouseClicked = true);
    ctx.update = () => {
      if (player) {
        player.update(
          ctx.keys,
          platforms,
          ctx.mouse.x,
          ctx.mouse.y,
          mouseClicked,
          isRoundStarted,
          onShoot
        );
        allPlayersDataById[playerId] = {
          x: player.x,
          y: player.y,
          angle: player.angle,
          gunRecoil: player.gunRecoil,
          ready: player.ready,
        };
      }

      if (!isRoundStarted && player) {
        console.log(player.angle);
        if (player.angle <= 1.2 || player.angle >= 1.94)
          this.onChangeCountdownText('Aim down');
        else this.onChangeCountdownText('Ready...');
        if (
          Object.values(allPlayersDataById).every(
            player => player.angle > 1 && player.angle < 2.35
          )
        )
          countdownLeft -= 1;
        else countdownLeft = COUNTDOWN;

        console.log(countdownLeft);

        if (countdownLeft == 0 && playerIsHost) {
          Object.values(connectionsById).forEach(connection =>
            connection.send({ type: 'round', isRoundStarted: true })
          );
          isRoundStarted = true;
          startGameHandler();
        }
      }

      Object.entries(otherPlayersById).forEach(([id, otherPlayer]) =>
        otherPlayer.update(allPlayersDataById[id])
      );
      bullets.forEach(bullet => bullet.update(onRemoveBullet));
      mouseClicked = false;
      sendPlayerData();
    };
    ctx.draw = () => {
      ctx.fillStyle = '#cef';
      ctx.fillRect(0, 0, ctx.width, ctx.height);
      platforms.forEach(platform => platform.draw(ctx));
      bullets.forEach(bullet => bullet.draw(ctx));
      if (player) player.draw(ctx);
      Object.values(otherPlayersById).forEach(otherPlayer =>
        otherPlayer.draw(ctx)
      );
    };
  }
}
