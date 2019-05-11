let mouseX = 0;
let mouseY = 0;

const onMouseMove = event => {
  mouseX = event.pageX;
  mouseY = event.pageY;
};

Sketch.create({
  container: document.getElementById('container'),
  setup() {
    this.player = new Player(100, 40, this.width / 4);
    this.aim = new Aim();
  },
  mousemove() {},
  update() {
    this.player.update(this.keys);
    this.aim.update(mouseX, mouseY);
  },
  draw() {
    this.fillStyle = '#ccc';
    this.fillRect(0, 0, this.width, this.height);
    this.player.draw(this);
    this.aim.draw(this);
  },
});

document.addEventListener('mousemove', onMouseMove);
