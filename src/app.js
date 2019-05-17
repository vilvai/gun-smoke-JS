import Player from './player.js';
import OtherPlayer from './player.js';

import Platform from './platform.js';

import { setupPeer, connectToHost, sendToClients } from './network/util.js';

let player;
let playerId;
const otherPlayersById = {};
const allPlayersDataById = {};

let playerIsHost = false;

const platforms = [
  new Platform(0, 700, 1000, 50),
  new Platform(475, 200, 50, 300),
  new Platform(100, 450, 200, 40),
  new Platform(700, 450, 200, 40),
];

const ctx = Sketch.create({
  container: document.getElementById('sketch-container'),
});

const getHostId = address => {
  const hrefArray = window.location.href.split('?');
  if (hrefArray.length == 1) return false;
  if (!hrefArray[1].includes('host=')) return false;
  return hrefArray[1].split('host=')[1];
};

ctx.setup = () => {
  const hostId = getHostId(window.location.href);

  const onError = alert;
  let onResolve;

  if (!hostId) {
    playerIsHost = true;
    onResolve = id => spawnPlayer(180, 300, id);
  } else {
    playerIsHost = false;
    onResolve = id => spawnPlayer(780, 300, id);
  }
  setupPeer.then(id => onResolve, onError);
  connectToHost(hostId);
};

ctx.update = () => {
  if (player) {
    player.update(ctx.keys, platforms, ctx.mouse.x, ctx.mouse.y);
    allPlayersDataById[playerId] = {
      x: player.x,
      y: player.y,
    };
  }

  Object.entries(otherPlayersById).forEach((id, otherPlayer) =>
    otherPlayer.update(allPlayersDataById[id])
  );
  // if (playerIsHost) {
  //   sendToClients(allPlayersDataById);
  // } else {
  // }
};

ctx.draw = () => {
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 0, ctx.width, ctx.height);

  platforms.forEach(platform => platform.draw(ctx));
  if (player) player.draw(ctx);
  Object.values(otherPlayersById).forEach(otherPlayer => otherPlayer.draw(ctx));
};

export const spawnPlayer = (x, y, id) => {
  player = new Player(x, y);
  playerId = id;
};

export const spawnOtherPlayer = (x, y, id) => {
  otherPlayersById[id] = new OtherPlayer(x, y);
};
