function rand(min,max){return Math.random() * (max ?(max-min) : min) + (max ? min : 0) }

function drawImageCenter(image, x, y, cx, cy, scale, rotation, ctx, alfa){
	ctx.setTransform(scale, 0, 0, scale, x, y);
	ctx.rotate(rotation);
	ctx.globalAlpha = alfa
	ctx.drawImage(image, -cx, -cy);
}

export default class ParticleSystem {
	constructor(x,y, spriteCount, imageName){
		this.x = x;
		this.y = y;
		this.spriteCount = spriteCount;
		this.imageName = imageName;
		this.sprite = []
		this.sprite.length = 0;
	}
	setup(){

		var ready_sprites = [];

		for (var i = 0; i < this.spriteCount; i++) {

				var temp_sprite = {x: 0, y: 0,	xr: 0, yr: 0, r: 1,	scale: 0.005, dx: rand(-1,1), dy: rand(-1,1), dr: 0.1,	alfa: 1, img: new Image()};

				ready_sprites.push(temp_sprite);
				ready_sprites[i].img.src = this.imageName;
				ready_sprites[i].x = this.x;
				ready_sprites[i].y = this.y;

		}
		
		this.sprite = ready_sprites;
	}
	draw(context){
		if(this.sprite.length == 0){this.setup()};
		for (var i=0;i<this.sprite.length;i++){
	      this.sprite[i].scale += 0.003;

	      this.sprite[i].x += this.sprite[i].dx;
	      this.sprite[i].y += this.sprite[i].dy;
	      this.sprite[i].r += this.sprite[i].dr;

	      var iwM = this.sprite[i].img.width * this.sprite[i].scale * 2 + context.width;
	      var ihM = this.sprite[i].img.height * this.sprite[i].scale * 2 + context.height;
	      
	      this.sprite[i].xr = ((this.sprite[i].x % iwM) + iwM) % iwM - this.sprite[i].img.width * this.sprite[i].scale;
	      this.sprite[i].yr = ((this.sprite[i].y % ihM) + ihM) % ihM - this.sprite[i].img.height * this.sprite[i].scale;
	      
	      if (this.sprite[i].alfa >= 0.01) {
	        this.sprite[i].alfa -= 0.005;
	      }
	      else{
					this.sprite[i].alfa = 0;
					this.setup();
	      }

	      drawImageCenter(this.sprite[i].img,this.sprite[i].x,this.sprite[i].y,185.5,185.5,this.sprite[i].scale,this.sprite[i].r, context,this.sprite[i].alfa);

	      context.setTransform(1,0,0,1,0,0);
	      context.globalAlpha = 1;
    	}
	}
}