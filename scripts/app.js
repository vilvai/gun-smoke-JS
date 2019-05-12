let mouseX;
let mouseY;

const onMouseMove = event => {
  mouseX = event.pageX;
  mouseY = event.pageY;
};

Sketch.create({
  container: document.getElementById('container'),
  setup() {
    this.player = new Player(100, 40, this.width / 4);
    this.platforms = [
      new Platform(50, 300, 200, 700),
      new Platform(50, 300, 700, 700),
      new Platform(50, 300, 1200, 700),
      new Platform(500, 50, 1500, 200),
      new Platform(50, 300, 700, 450),
    ];
  },
  update() {
    this.player.update(this.keys, this.platforms, mouseX, mouseY);
  },
  draw() {
    this.fillStyle = '#ccc';
    this.fillRect(0, 0, this.width, this.height);
    this.platforms.forEach(x => x.draw(this));
    this.player.draw(this);
  },
});

document.addEventListener('mousemove', onMouseMove);
