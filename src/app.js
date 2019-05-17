import Player from './player.js';
import OtherPlayer from './player.js';

import Platform from './platform.js';

import {
  setup_peer,
  connect_to_host,
  send_to_clients,
} from './network/util.js';

let player;
let player_id;
const other_players_by_id = {};
const all_players_data_by_id = {};

let playerIsHost = false;

const platforms = [
  new Platform(50, 1000, 0, 700),
  new Platform(300, 50, 475, 200),
  new Platform(40, 200, 100, 450),
  new Platform(40, 200, 700, 450),
];

const ctx = Sketch.create({
  container: document.getElementById('sketch-container'),
});

const get_host_id = address => {
  const href_array = window.location.href.split('?');
  if (href_array.length == 1) return false;
  if (!href_array[1].includes('host=')) return false;
  return href_array[1].split('host=')[1];
};

ctx.setup = () => {
  const host_id = get_host_id(window.location.href);
  setup_peer();
  if (!host_id) {
    playerIsHost = true;
  } else {
    playerIsHost = false;
    connect_to_host(host_id);
  }
};

ctx.update = () => {
  if (player) {
    player.update(ctx.keys, platforms, ctx.mouse.x, ctx.mouse.y);
    all_players_data_by_id[player_id] = {
      x: player.x,
      y: player.y,
    };
  }

  Object.entries(other_players_by_id).forEach((id, other_player) =>
    other_player.update(all_players_data_by_id[id])
  );
  // if (playerIsHost) {
  //   send_to_clients(all_players_data_by_id);
  // } else {
  // }
};

ctx.draw = () => {
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 0, ctx.width, ctx.height);

  platforms.forEach(platform => platform.draw(ctx));
  if (player) player.draw(ctx);
  Object.values(other_players_by_id).forEach(other_player =>
    other_player.draw(ctx)
  );
};

export const spawn_player = (x, y, id) => {
  player = new Player(x, y, id);
  player_id = id;
};

export const spawn_other_player = (x, y, id) => {
  other_players_by_id[id] = new OtherPlayer(x, y);
};
