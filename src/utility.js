export default class Utility{
	drawImageCenter(image, x, y, cx, cy, scale, rotation, ctx, alfa){
	    ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
	    ctx.rotate(rotation);
	    ctx.globalAlpha = alfa
	    ctx.drawImage(image, -cx, -cy);
	}
	rand(min,max){return Math.random() * (max ?(max-min) : min) + (max ? min : 0) }
}

export class Vector{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}