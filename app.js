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
  },
  update() {
    this.player.update(this.keys, mouseX, mouseY);
  },
  draw() {
    this.fillStyle = '#ccc';
    this.fillRect(0, 0, this.width, this.height);
    this.player.draw(this);
  },
});

document.addEventListener('mousemove', onMouseMove);
