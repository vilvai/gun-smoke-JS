import Sketch from './lib/sketch.js';

import Player, { GenericPlayer } from './player.js';
import Platform from './platform.js';
import Camera from './camera.js';

import { setupPeer, connectToHost } from './network/util.js';

let player;
let playerId;
const otherPlayersById = {};
const allPlayersDataById = {};

export let playerIsHost = false;
const connectionsById = {};
let hostConnection;

const platforms = [
  new Platform(0, 700, 1000, 50),
  new Platform(475, 200, 50, 300),
  new Platform(100, 450, 200, 40),
  new Platform(700, 450, 200, 40),
];

const camera = new Camera();

const getHostId = address => {
  const hrefArray = window.location.href.split('?');
  if (hrefArray.length == 1) return false;
  if (!hrefArray[1].includes('host=')) return false;
  return hrefArray[1].split('host=')[1];
};

export const onReceiveData = data => {
  Object.entries(data).forEach(
    ([id, playerData]) => (allPlayersDataById[id] = playerData)
  );
};

export const startGame = connection => {
  removeOverlayText();
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

const updateOverlayText = text =>
  (document.getElementById('loading-overlay').innerHTML = text);

const removeOverlayText = () => {
  document.getElementById('loading-overlay').remove();
  document.getElementById('sketch-container').style.filter = 'none';
};

export const endGame = () => {
  alert('Game ended');
};

export default class Game {
  constructor() {
    const ctx = Sketch.create({
      container: document.getElementById('sketch-container'),
      width: 1280,
      height: 720,
      fullscreen: false,
      autopause: false,
    });
    ctx.setup = () => {
      const hostId = getHostId(window.location.href);

      const onError = alert;
      let onResolve;

      if (!hostId) {
        playerIsHost = true;
        onResolve = peer => {
          playerId = peer.id;
          updateOverlayText(
            'Share this link with a friend: <br>localhost:8080?host=' + peer.id
          );
        };
      } else {
        playerIsHost = false;
        onResolve = peer => {
          playerId = peer.id;
          connectToHost(peer, hostId);
        };
      }
      setupPeer.then(onResolve, onError);
    };

    ctx.update = () => {
      if (player) {
        player.update(ctx.keys, platforms, ctx.mouse.x, ctx.mouse.y);
        allPlayersDataById[playerId] = {
          x: player.x,
          y: player.y,
          angle: player.angle,
        };
      }

      Object.entries(otherPlayersById).forEach(([id, otherPlayer]) =>
        otherPlayer.update(allPlayersDataById[id])
      );
      if (playerIsHost) {
        Object.values(connectionsById).forEach(connection =>
          connection.send(allPlayersDataById)
        );
      } else {
        hostConnection.send({
          [playerId]: allPlayersDataById[playerId],
        });
      }
    };

    ctx.draw = () => {
      ctx.fillStyle = '#ccc';
      ctx.fillRect(0, 0, ctx.width, ctx.height);
      platforms.forEach(platform => platform.draw(ctx));
      if (player) {
        player.draw(ctx);
        // camera.draw(ctx, player, platforms);
      }
      Object.values(otherPlayersById).forEach(otherPlayer =>
        otherPlayer.draw(ctx)
      );
    };
  }
}
