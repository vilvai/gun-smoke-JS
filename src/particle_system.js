function rand(min,max){return Math.random() * (max ?(max-min) : min) + (max ? min : 0) }

export class Sprite{
  constructor(){
    this.x = 0;
    this.y = 0;
    this.xr = 0;
    this.yr = 0;
    this.r = 1;
    this.scale = 0;
    this.dx = 1;
    this.dy = 1;
    this.dr = 1;
    this.alfa = 1;
    this.img = new Image();
  }
}

export default class ParticleSystem {
	constructor(x,y, spriteCount, imageName){
		this.x = x;
		this.y = y;
		this.spriteCount = spriteCount;
		this.imageName = imageName;
		this.sprite = function(){

			var ready_sprites = [];

			for (var i = 0; i < 50; i++) {

		      var temp_sprite = new Sprite();

		      ready_sprites.push(temp_sprite);
		      ready_sprites[i].img.src = 'small_doggo.png';
		      ready_sprites[i].x = 700;
		      ready_sprites[i].y = 700;

			}
			console.log(ready_sprites);
			return ready_sprites;
		};
	}
	draw(context){

		for (var i=0;i<this.sprite.length;i++){
	      this.sprites[i].scale += 0.003;

	      this.sprite[i].x += this.sprite[i].dx;
	      this.sprite[i].y += this.sprite[i].dy;
	      this.sprite[i].r += this.sprite[i].dr;

	      var iwM = this.sprite[i].img.width * this.sprite[i].scale * 2 + context.width;
	      var ihM = this.sprite[i].img.height * this.sprite[i].scale * 2 + context.height;
	      
	      this.sprite[i].xr = ((this.sprite[i].x % iwM) + iwM) % iwM - this.sprite[i].img.width * this.sprite[i].scale;
	      this.sprite[i].yr = ((this.sprite[i].y % ihM) + ihM) % ihM - this.sprite[i].img.height * this.sprite[i].scale;
	      
	      if (this.sprite[i].alfa >= 0.01) {
	        this.sprite[i].alfa -= Math.exp((Date.now()-this.enter_time)/1000000) -1 ;
	        console.log(Math.exp((Date.now()-this.enter_time)/1000000)-1); 
	      }
	      else{
	        this.sprite[i].alfa = 0;
	      }

	      function drawImageCenter(image, x, y, cx, cy, scale, rotation, ctx, alfa){
			    ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
			    ctx.rotate(rotation);
			    ctx.globalAlpha = alfa
			    ctx.drawImage(image, -cx, -cy);
			}
			
	      drawImageCenter(this.sprite[i].img,this.sprite[i].x,this.sprite[i].y,185.5,185.5,this.sprite[i].scale,this.sprite[i].r, context,this.sprite[i].alfa);

	      context.setTransform(1,0,0,1,0,0);
	      context.globalAlpha = 1;
    	}
	}
}