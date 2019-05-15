let mouseX;
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
      new Platform(50, 1000, 1048, 700),
      new Platform(50, 300, 700, 450)
    ];
    this.camera = new Camera(this.player, this.platforms);
  },
  update() {
    this.player.update(this.keys, this.platforms, this.height, mouseX, mouseY);
  },
  draw() {
    this.fillStyle = "#ccc";
    this.camera.draw(this);
  }
});

document.addEventListener("mousemove", onMouseMove);
