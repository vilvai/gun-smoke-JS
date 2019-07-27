function drawImageCenter(image, x, y, cx, cy, scale, rotation, ctx, alfa) {
  ctx.setTransform(scale, 0, 0, scale, x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alfa;
  ctx.drawImage(image, -cx, -cy);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}
function getXYfromPolar(theta, r) {
  var x = 640 + r * Math.cos(theta);
  var y = 460 + r * Math.sin(theta);

  return [x, y]

}


export default class Background {
  constructor(ctx) {
    this.fillstyle = '#cef';
    this.night = new Image()
    this.night.src = "images/bak.png"
    this.cloud = new Image()
    this.cloud.src = "images/cloud.png"
    this.cloudX = 300
    this.cloudY = 200
    this.sunR = 500
    this.sunTheta = 100
    this.sunX = 640
    this.sunY = 360
    this.sunRising = false
  }
  draw(ctx) {
    /*
    ctx.fillStyle = this.fillstyle;
    ctx.fillRect(0, 0, ctx.width, ctx.height);
    ctx.fillStyle = "#c2c28f"
    ctx.fillRect(0, 600, ctx.width,ctx.height/2)
    */

    ctx.fillStyle = "#F2AB41"
    ctx.fillRect(0, 0, ctx.width, ctx.height);

    this.sun(ctx)
    this.clouds(ctx)

    drawImageCenter(this.night, ctx.width / 2, ctx.height / 2, 640, 360, 1, 0, ctx, 1)


  }

  sun(ctx) {




    if (this.sunX <= 0) {
      this.sunX = ctx.width;
    }
    else {
      this.sunTheta -= 0.00005;
      this.sunR = ((this.sunY/1.9) + 300)
    }


    ctx.fillStyle = "#ffd900";
    ctx.beginPath();
    var vector = getXYfromPolar(this.sunTheta, this.sunR)
    this.sunX = vector[0]
    this.sunY = vector[1]
    ctx.arc(this.sunX, this.sunY, 50, 0, 2 * Math.PI);
    ctx.fill();
  }

  clouds(ctx) {
    
    this.cloudX += 0.1
    if (this.cloudX >= ctx.width + 500) {
      this.cloudX = -500
    }
    drawImageCenter(this.cloud, this.cloudX, this.cloudY, 212, 42, 1, 0, ctx, 1)
    
  }

  //DayCycle()

  //Wind()


  
}
