class Camera {
  constructor(player, platforms) {
    this.player = player;
    this.platforms = platforms;
  }

  draw(context) {
    context.fillRect(0, 0, context.width, context.height);

    var xPlayer = context.width / 2 - this.player.width / 2;
    var yPlayer = context.height / 2 - this.player.height / 2;
    context.fillStyle = '#f00';
    context.fillRect(xPlayer, yPlayer, this.player.width, this.player.height);
    var dx = xPlayer - this.player.x;
    var dy = yPlayer - this.player.y;
    this.platforms.forEach(x =>
      context.fillRect(x.x + dx, x.y + dy, x.width, x.height)
    );

    this.player.draw(context);
    this.platforms.forEach(x => x.draw(context));
  }
}
