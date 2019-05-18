export default class Camera {
  constructor() {}

  draw(context, player, platforms) {
    context.fillRect(0, 0, context.width, context.height);

    var xPlayer = context.width / 2 - player.width / 2;
    var yPlayer = context.height / 2 - player.height / 2;
    context.fillStyle = '#f00';
    context.fillRect(xPlayer, yPlayer, player.width, player.height);
    var dx = xPlayer - player.x;
    var dy = yPlayer - player.y;
    platforms.forEach(x =>
      context.fillRect(x.x + dx, x.y + dy, x.width, x.height)
    );

    player.draw(context);
    platforms.forEach(x => x.draw(context));
  }
}
