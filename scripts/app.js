let mouseX;
let mouseY;

const onMouseMove = event => {
  mouseX = event.pageX;
  mouseY = event.pageY;
};
let players = []

let ctx = Sketch.create({container: document.getElementById("container")})

ctx.setup = ()=> {
  ctx.platforms = [
    new Platform(50, 1000000, 10, 700),
    new Platform(50, 300, 700, 700),
    new Platform(50, 300, 1040, 700),
    new Platform(500, 50, 1300, 200),
    new Platform(50, 300, 700, 450)
  ];
}

ctx.update = ()=>{
    let i = 1
    data = {}
    players.forEach(x =>{
      x.update(ctx.keys, ctx.platforms, ctx.height, mouseX, mouseY)
      data["player"+i] = {
                  x:x.x,
                  y:x.y
                }
    })
    //send_to_clients(data)
}



ctx.draw = ()=> {
  ctx.fillStyle = "#ccc";
  ctx.fillRect(0, 0, ctx.width, ctx.height);
  ctx.platforms.forEach(x => x.draw(ctx));
  
  players.forEach(x => x.draw(ctx));
}

ctx.spawn = ()=>{
    let player = new Player(100,40, 40, this.width / 4)
    p_index = players.push(player) - 1
    console.log(p_index)
    return p_index
}

document.addEventListener("mousemove", onMouseMove);
