import Player from './player.js';
import Platform from './platform.js';

import { setup_peer } from './network/util.js';

const players = [];
const platforms = [
  new Platform(50, 1000000, 10, 700),
  new Platform(50, 300, 700, 700),
  new Platform(50, 300, 1040, 700),
  new Platform(500, 50, 1300, 200),
  new Platform(50, 300, 700, 450),
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
  if (!host_id) {
    setup_peer();
    ctx.spawn();
  }
};

ctx.update = () => {
  players.forEach(player =>
    player.update(ctx.keys, platforms, ctx.height, ctx.mouse.x, ctx.mouse.y)
  );
  //send_to_clients(data)
};

ctx.draw = () => {
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 0, ctx.width, ctx.height);

  platforms.forEach(platform => platform.draw(ctx));

  players.forEach(player => player.draw(ctx));
};

ctx.spawn = () => {
  const player = new Player(100, 40, 40, ctx.width / 4);
  players.push(player);
  // console.log(p_index);
  // return p_index;
};

/* let mouseX;
let mouseY;

const onMouseMove = event => {
  mouseX = event.pageX;
  mouseY = event.pageY;
};

Sketch.create({
  container: document.getElementById("container"),
  setup() {
    this.player = new Player(100, 40, this.width / 4);
    this.platforms = [
      new Platform(50, 300, 200, 700),
      new Platform(50, 300, 700, 700),
      new Platform(50, 300, 1040, 700),
      new Platform(500, 50, 1300, 200),
      new Platform(50, 300, 700, 450)
    ];
  },
  update() {
    this.player.update(this.keys, this.platforms, this.height, mouseX, mouseY);
  },
  draw() {
    this.fillStyle = "#ccc";
    this.fillRect(0, 0, this.width, this.height);
    this.platforms.forEach(x => x.draw(this));
    this.player.draw(this);
  }
});

document.addEventListener("mousemove", onMouseMove);
 */
