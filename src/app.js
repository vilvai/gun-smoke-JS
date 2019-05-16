let mouseX;
let mouseY;

const onMouseMove = event => {
  mouseX = event.pageX;
  mouseY = event.pageY;
};

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

ctx.setup = () => {};

ctx.update = () => {
  players.forEach(player =>
    player.update(ctx.keys, platforms, ctx.height, mouseX, mouseY)
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
  const player = new Player(100, 40, 40, this.width / 4);
  p_index = players.push(player) - 1;
  console.log(p_index);
  return p_index;
};

document.addEventListener('mousemove', onMouseMove);

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
