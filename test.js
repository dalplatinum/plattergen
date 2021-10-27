// Todo:
// Webfonts in OBS?  Doesn't seem to be working for shit.
// Rotation
// multiple styles
// *DONE* make floor-bounce a setting
// check performance limitation - NO
// *DONE* set timer to stop producing more, etc. - Set a limit on total number of items
// *DONE* fade on death, rather than blink out - now an option
// *DONE* grow on create up to 100%
// *DONE* Random style if none selected
// Individual letters mode
// Image mode
// *DONE* When particle count = 0 clear sceen, stop loop
// Quality/number options
// make the code more efficient
// 	put some sort of debug counter on the screen that counts operations or something
// 	might want to put each 'style' into it's own particle type?  would reduce the amount of 'ifs'
// character limit lol

window.onload = function() {
	// get url arguments,strip out underscores, etc
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	var newwords = urlParams.get('words');
	if (!newwords) {
		newwords = 'Hello___Sir';
	}
	// triple underscore = newline
	const gostring = newwords.split('___').join('\n');
	var animStyle = urlParams.get('style');
	// If no style is requested, pick one from this here array
	if (!animStyle) {
		var textArray = [
			'vanilla',
			'arc',
			'bubbles',
			'solitaire',
			'stickmove',
			'firework',
			'bounce'
		];
		var randomNumber = Math.floor(Math.random()*textArray.length);
		animStyle = textArray[randomNumber];
		console.log(animStyle);
	}
	// create new TextImage object
	var textImage = TextImage();
	// Not sure I can set a gradient, which is a shame.
	//var grd = ctx.createLinearGradient(0,0,0,150);
	//grd.addColorStop(0,"red");
	//grd.addColorStop(1,"black");
	// linear-gradient(red, black)
	var style = {
		"font": "Luckiest Guy,impact,Consolas,sans-serif",
		"align": "center",
		"color": "rgba(0, 0, 0, 1)",
		"size": 55,
		"background": "rgba(0, 0, 0, 0)",
		"stroke": 6,
		"strokeColor": "rgba(255, 255, 255, 1)",
		"lineHeight": "1.2em",
		"bold": false,
	};
	textImage.setStyle(style);
	// convert text message to image element
	img = textImage.toImage(gostring);

	// Initialise an empty canvas and place it on the page
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	context.fillstyle = "rgba(0, 0, 200, 0.5)";
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	//context.clearRect(0, 0, canvas.width, canvas.height)
	document.body.appendChild(canvas);
	var hfactor = (window.innerHeight / 1080);
	console.log(hfactor);
	// Some easing functions
	function easeInBack (t, b, c, d) {
		var s = 1.70158;
		return c * (t /= d) * t * ((s + 1) * t - s) + b;
	}
	function easeOutBack (t, b, c, d) {
		var s = 1.70158;
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	}
	function easeInOutBack (t, b, c, d) {
		var s = 1.70158;
		if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
		return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	}
	function easeInQuad (t, b, c, d) {
		return c * (t /= d) * t + b;
	}
	function easeOutQuad (t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	}
	function easeInOutQuad (t, b, c, d) {
		if ((t /= d / 2) < 1) return c / 2 * t * t + b;
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	}
	
	// Set up object to contain particles and set some default values
	var particles = {},
		particleIndex = 100,
		settings = {
			hasStarted: false,
			density: 15,
			pointStart: true,
			startingX: canvas.width / 2,
			startingY: canvas.height * 1.1,
			gravity: 0.5,
			startingScale: 0.2,
			maxScale: 1,
			growspeed: 0.01,
			trails: false,
			clear: true,
			dieDelay: 10,
			rotate: false,
			noClear: false,
			fadeSpeed: 1,
			partLife: 200,
			initvxrnd: 16,
			initvx: 8,
			initvyrnd: 4,
			initvy: 35*hfactor,
			initr: 0,
			initvrrnd: 0,
			initvr: 0,
			triggervy: -2
		};
	switch(animStyle) {
		case "vanilla":
			settings.rotate = true;
			break;
		case "solitaire":
			particleIndex = 20;
			settings.density = 4;
			settings.diefade = false;
			settings.floorbounce = true;
			settings.rotate = false;
			settings.partLife = 320;
			settings.startingY = canvas.height * 0.15;
			settings.startingX = canvas.width * 0.9;
			settings.initvxrnd = -15;
			settings.initvx = 3;
			settings.initvyrnd = 3;
			settings.initvy = 2*hfactor;
			settings.startingScale = 1;
			settings.gravity = 0.7;
			settings.noClear = true;
			settings.fadeSpeed = 0;
			break;
		case "firework":
			particleIndex = 1;
			settings.density = 1000;
			settings.diefade = true;
			settings.floorbounce = true;
			settings.rotate = true;
			settings.partLife = 320;
			settings.startingY = canvas.height * 0.95;
			settings.startingX = canvas.width / 4;
			settings.initvx = 3;
			settings.initvy = 40*hfactor;
			settings.initr = -98;
			settings.initvr = 1;
			settings.startingScale = 0.1;
			settings.maxScale = 0.5;
			settings.growspeed = 0.01;
			settings.gravity = 0.7;
			settings.fadeSpeed = 0;
			settings.triggervy = 5;
			break;
		case "bounce":
			particleIndex = 50;
			settings.diefade = true;
			settings.floorbounce = true;
			settings.rotate = false;
			settings.partLife = 280;
			break;
		case "stickmove":
			particleIndex = 20;
			settings.diefade = false;
			settings.floorbounce = false;
			settings.startingX = canvas.width / 1.45;
			settings.startingY = canvas.height * 0.23;
			settings.rotate = false;
			settings.partLife = 325;
			settings.popIn = true;
			settings.popOut = true;
			settings.gravity = 0;
			break;
		case "bubbles":
			particleIndex = 50;
			settings.density = 7;
			settings.diefade = true;
			settings.floorbounce = false;
			settings.rotate = true;
			settings.startingY = canvas.height * 0.95;
			settings.pointStart = false;
			settings.weaveX = true;
			settings.partLife = 120;
			settings.gravity = -0.04;
			settings.startingScale = 0.1;
			settings.maxScale = 0.8;
			settings.growspeed = 0.06;
			settings.initvyrnd = 1;
			settings.initvy = 1*hfactor;
			settings.partLife = 190;
			settings.popIn = true;
			settings.popOut = true;
			break;
		case "arc":
			particleIndex = 50;
			settings.density = 6;
			settings.diefade = true;
			settings.floorbounce = true;
			settings.rotate = true;
			settings.partLife = 290;
			settings.startingX = canvas.width / 1.02;
			settings.startingScale = 0.2;
			settings.growspeed = 0.005;
			settings.initvxrnd = 1;
			settings.initvx = 9;
			settings.initvyrnd = 1;
			settings.initvy = 33*hfactor;
			settings.initr = 98;
			break;
		case "vomit":
			settings.diefade = true;
			settings.floorbounce = false;
			settings.rotate = true;
			settings.partLife = 220;
			settings.startingX = canvas.width / 1.45;
			settings.startingY = canvas.height * 0.23;
			settings.startingScale = 0.2;
			settings.growspeed = 0.01;
			settings.initvxrnd = 8;
			settings.initvx = -2;
			settings.initvyrnd = 5;
			settings.initvy = 4*hfactor;
			settings.initryrnd = 17;
			settings.initvr = 0;
			break;
		default:
			settings.diefade = false;
			settings.floorbounce = false;
			settings.rotate = true;
	}
	// Set up a function to create a new particle //////////////////////////////////////////////////////////// PARTICLE Function
	function Particle() {
		// Establish starting positions and velocities
		if (!settings.pointStart) {
			this.x = Math.random() * canvas.width;
			this.y = settings.startingY;
		} else {
			this.x = settings.startingX;
			this.y = settings.startingY;
		}
		if (animStyle == 'stickmove') {
			this.x = Math.random() * canvas.width;
			this.y = Math.random() * canvas.height;
			this.oldx = this.x;
			this.oldy = this.y;
			this.newx = 0;
			this.newy = 0;
		}
		this.scale = settings.startingScale;
		this.seed = Math.random(100);
		//this.bounceFactor = (this.seed/100) * 0.6;
		this.bounceFactor = Math.random(1)/10 +0.6;
		
		// Determine original X-axis speed based on setting limitation
		this.vx = Math.random() * settings.initvxrnd - settings.initvx;
		this.vy = Math.random() * settings.initvyrnd - settings.initvy;
		this.vr = Math.random() * settings.initvrrnd + settings.initvr + this.vx*0.2;
		this.r = settings.initr;
		
		// Add new particle to the index
		// Object used as it's simpler to manage that an array
		// We work through the contents backwards so that new objects sit behind older objects
		// because it looks nicer that way
		if (particleIndex > 0) {
			particles[particleIndex] = this;
			this.id = particleIndex;
			this.life = 0;
			this.opacity = 1;
			this.maxLife = settings.partLife;
			this.moveTime = 0;
			this.moveTarget = (Math.random() * 20) + 40;
			this.seed = Math.random();
		}
		particleIndex --;
	}
	
	// Particle draw function ///////////////////////////////////////////////////////////////////////////////// PARTICLE Draw
	Particle.prototype.draw = function() {
		switch(animStyle) {
			case "vanilla":
				// //////////////////////////////////////////////////////////////////////////////////////////// VANILLA
				this.x += this.vx;
				this.y += this.vy;
				this.r += this.vr;
				
				if (this.scale < settings.maxScale) {
					this.scale += settings.growspeed;
				}
				// If Particle is old, it gets processed.  To death.
				if (this.life > this.maxLife) {
					delete particles[this.id];
				}
				// Adjust for gravity
				this.vy += settings.gravity;
				// Set up the new width based on scale
				this.newwidth = img.width * this.scale;
				this.newheight = img.height * this.scale;
				// draw the image
				context.clearRect(settings.leftWall, settings.groundLevel, canvas.width, canvas.height);
				// rotating stuff in canvas is weird, you have to move the 0,0 of the canvas to the centre of the
				// object, rotate the canvas to the required angle, draw the whatever, the reset the canvas position/rotation back to normal
				context.save();
				context.translate(this.x, this.y);
				context.rotate(this.r * Math.PI / 180);
				context.globalAlpha = this.opacity;
				context.drawImage(img, -(this.newwidth / 2), -(this.newheight / 2),this.newwidth,this.newheight);
				context.restore();
				// //////////////////////////////////////////////////////////////////////////////////////////// END VANILLA
				break;
			case "solitaire":
				// //////////////////////////////////////////////////////////////////////////////////////////// SOLITAIRE
				this.x += this.vx;
				this.y += this.vy;
				this.r += this.vr;
				
				if (this.scale < settings.maxScale) {
					this.scale += settings.growspeed;
				}
				// If Particle is old, it gets processed.  To death.
				if (this.life > this.maxLife) {
					this.opacity -= 0.1;
					if (this.opacity <= 0) {
						delete particles[this.id];
						return;
					}
				}
				// Make it bounce
				if (this.y+(this.newheight / 2) > canvas.height*1.02 && this.life > 10) {
					this.y = (canvas.height*1.02)-(this.newheight / 2);
					this.vy *= -this.bounceFactor;
					this.vx *= 0.8;
					this.grow = false;
				}
				// Adjust for gravity
				this.vy += settings.gravity;
				// work out the new image size now, saves on an extra calculation or two later
				this.newwidth = img.width * this.scale;
				this.newheight = img.height * this.scale;
				// draw the image
				context.clearRect(settings.leftWall, settings.groundLevel, canvas.width, canvas.height);
				context.save();
				context.globalAlpha = this.opacity;
				context.drawImage(img, this.x-(this.newwidth / 2), this.y-(this.newheight / 2),this.newwidth,this.newheight);
				context.restore();
				// //////////////////////////////////////////////////////////////////////////////////////////// END SOLITAIRE
				break;
			case "firework":
				// //////////////////////////////////////////////////////////////////////////////////////////// FIREWORK
				this.x += this.vx;
				this.y += this.vy;
				this.r += this.vr;
				
				if (this.scale < settings.maxScale) {
					this.scale += settings.growspeed;
				}
				// If Particle is old, it gets processed.  To death.
				if (this.life > this.maxLife) {
					this.opacity -= 0.1;
					if (this.opacity <= 0) {
						delete particles[this.id];
						return;
					}
				}
				if (this.vy > settings.triggervy) {
					console.log("trigger");
					animStyle = "explosion";
					settings.diefade = true;
					settings.floorbounce = true;
					settings.rotate = true;
					settings.startingX = this.x;
					settings.startingY = this.y;
					settings.startingScale = 0.1;
					settings.maxScale = 3.8;
					settings.gravity = 0.7;
					settings.growspeed = 0.01;
					particleIndex = 30;
					for (var i = 0; i < 30; i++) {
						settings.initvx = Math.random() * 12;
						settings.initvy = (Math.random() * 8) + 7;
						settings.partLife = (Math.random() * 40) + 90;
						settings.bounceFactor = (Math.random() * 0.3) + 0.6;
						settings.initr = settings.initvx;
						new Particle();
					}
					delete particles[this.id];
				}
				// Adjust for gravity
				this.vy += settings.gravity;
				// work out the new image size now, saves on an extra calculation or two later
				this.newwidth = img.width * this.scale;
				this.newheight = img.height * this.scale;
				// draw the image
				context.clearRect(settings.leftWall, settings.groundLevel, canvas.width, canvas.height);
				// rotating stuff in canvas is weird, you have to move the 0,0 of the canvas to the centre of the
				// object, rotate the canvas to the required angle, draw the whatever, the reset the canvas position/rotation back to normal
				context.save();
				context.translate(this.x, this.y);
				context.rotate(this.r * Math.PI / 180);
				context.globalAlpha = this.opacity;
				context.drawImage(img, -(this.newwidth / 2), -(this.newheight / 2),this.newwidth,this.newheight);
				context.restore();
				// //////////////////////////////////////////////////////////////////////////////////////////// END FIREWORK
				break;
			case "explosion":
				// //////////////////////////////////////////////////////////////////////////////////////////// EXPLOSION
				this.x += this.vx;
				this.y += this.vy;
				this.r += this.vr;
				
				if (this.scale < settings.maxScale) {
					this.scale += settings.growspeed;
				}
				// If Particle is old, it gets processed.  To death.
				if (this.life > this.maxLife) {
					this.opacity -= 0.1;
					if (this.opacity <= 0) {
						delete particles[this.id];
						return;
					}
				}
				// if it's offscreen kill it.
				if (this.y-(this.newheight / 2) > canvas.height * 1.5 && this.life > 60) {
					delete particles[this.id];
				}
				// Adjust for gravity
				this.vy += settings.gravity;
				// work out the new image size now, saves on an extra calculation or two later
				this.newwidth = img.width * this.scale;
				this.newheight = img.height * this.scale;
				// draw the image
				context.clearRect(settings.leftWall, settings.groundLevel, canvas.width, canvas.height);
				// rotating stuff in canvas is weird, you have to move the 0,0 of the canvas to the centre of the
				// object, rotate the canvas to the required angle, draw the whatever, the reset the canvas position/rotation back to normal
				context.save();
				context.translate(this.x, this.y);
				context.rotate(this.r * Math.PI / 180);
				context.globalAlpha = this.opacity;
				context.drawImage(img, -(this.newwidth / 2), -(this.newheight / 2),this.newwidth,this.newheight);
				context.restore();
				// //////////////////////////////////////////////////////////////////////////////////////////// END EXPLOSION
				break;
			case "bounce":
				// //////////////////////////////////////////////////////////////////////////////////////////// BOUNCE
				this.x += this.vx;
				this.y += this.vy;
				this.r += this.vr;
				
				if (this.scale < settings.maxScale) {
					this.scale += settings.growspeed;
				} else {
					this.grow = false;
				}
				// If Particle is old, it gets processed.  To death.
				if (this.life > this.maxLife) {
					this.opacity -= 0.1;
					if (this.opacity <= 0) {
						delete particles[this.id];
						return;
					}
				}
				// Make it bounce
				if (this.y+(this.newheight / 2) > canvas.height*1.05 && this.life > 60) {
					this.y = (canvas.height*1.05)-(this.newheight / 2);
					this.vy *= -this.bounceFactor;
					this.vx *= 0.8;
					this.grow = false;
				}
				// Adjust for gravity
				this.vy += settings.gravity;
				// work out the new image size now, saves on an extra calculation or two later
				this.newwidth = img.width * this.scale;
				this.newheight = img.height * this.scale;
				// draw the image
				context.clearRect(settings.leftWall, settings.groundLevel, canvas.width, canvas.height);
				context.save();
				context.globalAlpha = this.opacity;
				context.drawImage(img, this.x-(this.newwidth / 2), this.y-(this.newheight / 2),this.newwidth,this.newheight);
				context.restore();
				// //////////////////////////////////////////////////////////////////////////////////////////// END BOUNCE
				break;
			case "stickmove":
				// //////////////////////////////////////////////////////////////////////////////////////////// STICKMOVE
				if (this.moveTime <= this.moveTarget) {
					this.x = easeInQuad(this.moveTime,this.oldx,this.newx,this.moveTarget);
					this.y = easeOutQuad(this.moveTime,this.oldy,this.newy,this.moveTarget);
				}
				this.moveTime ++;
				if (this.moveTime >= this.moveTarget+20) {
					this.moveTime = 0;
					this.oldx = this.x;
					this.oldy = this.y;
					this.newx = (Math.random() * canvas.width) - this.oldx;
					this.newy = (Math.random() * canvas.height) - this.oldy;
				}
				// Pop the particles in
				if (this.life < 15) {
					this.scale = easeOutBack(this.life,settings.startingScale,settings.maxScale-settings.startingScale,15);
				}
				// If Particle is old, it gets processed.  To death.
				if (this.life > this.maxLife) {
					// This pops it out and then removes it
					this.tempLife = this.life - this.maxLife;
					if (this.tempLife < 15) {
						this.scale = easeInBack(this.tempLife,settings.maxScale,-settings.maxScale,15);
					} else {
						delete particles[this.id];
					}
				}
				// work out the new image size now, saves on an extra calculation or two later
				this.newwidth = img.width * this.scale;
				this.newheight = img.height * this.scale;
				// draw the image
				context.clearRect(settings.leftWall, settings.groundLevel, canvas.width, canvas.height);
				context.save();
				context.globalAlpha = this.opacity;
				context.drawImage(img, this.x-(this.newwidth / 2), this.y-(this.newheight / 2),this.newwidth,this.newheight);
				context.restore();
				break;
				// //////////////////////////////////////////////////////////////////////////////////////////// END STICKMOVE
			case "bubbles":
				// //////////////////////////////////////////////////////////////////////////////////////////// BUBBLES
				this.x += Math.sin((this.id+this.life+this.seed-this.vy)/12)*3;
				this.y += this.vy;
				this.r += this.vr;
				
				if (this.life < 15) {
					this.scale = easeOutBack(this.life,settings.startingScale,settings.maxScale-settings.startingScale,15);
				}
				
				// If Particle is old, it gets processed.  To death.
				if (this.life > this.maxLife) {
					// This pops it out and then removes it
					this.tempLife = this.life - this.maxLife;
					if (this.tempLife < 15) {
						this.scale = easeInBack(this.tempLife,settings.maxScale,-settings.maxScale+settings.startingScale,15);
					} else {
						delete particles[this.id];
					}
				}
				// Adjust for gravity
				this.vy += settings.gravity;
				// Set up the new width based on scale
				this.newwidth = img.width * this.scale;
				this.newheight = img.height * this.scale;
				// draw the image
				context.clearRect(settings.leftWall, settings.groundLevel, canvas.width, canvas.height);
				// rotating stuff in canvas is weird, you have to move the 0,0 of the canvas to the centre of the
				// object, rotate the canvas to the required angle, draw the whatever, the reset the canvas position/rotation back to normal
				context.save();
				context.translate(this.x, this.y);
				context.rotate(this.r * Math.PI / 180);
				context.globalAlpha = this.opacity;
				context.drawImage(img, -(this.newwidth / 2), -(this.newheight / 2),this.newwidth,this.newheight);
				context.restore();
				// //////////////////////////////////////////////////////////////////////////////////////////// END BUBBLES
				break;
			case "arc":
				// //////////////////////////////////////////////////////////////////////////////////////////// ARC
				this.x += this.vx;
				this.y += this.vy;
				this.r += this.vr+this.seed;
				
				if (this.scale < settings.maxScale) {
					this.scale += settings.growspeed;
				}
				// If Particle is old, it gets processed.  To death.
				if (this.life > this.maxLife) {
					this.opacity -= 0.1;
					if (this.opacity <= 0) {
						delete particles[this.id];
						return;
					}
				}
				// Make it bounce
				if (this.y+(this.newheight / 2) > canvas.height*1.02 && this.life > 60) {
					this.y = (canvas.height*1.02)-(this.newheight / 2);
					this.vy *= -this.bounceFactor;
					this.vx *= 0.8;
					this.grow = false;
				}
				// Adjust for gravity
				this.vy += settings.gravity;
				// Set up the new width based on scale
				this.newwidth = img.width * this.scale;
				this.newheight = img.height * this.scale;
				// draw the image
				context.clearRect(settings.leftWall, settings.groundLevel, canvas.width, canvas.height);
				// rotating stuff in canvas is weird, you have to move the 0,0 of the canvas to the centre of the
				// object, rotate the canvas to the required angle, draw the whatever, the reset the canvas position/rotation back to normal
				context.save();
				context.translate(this.x, this.y);
				context.rotate(this.r * Math.PI / 180);
				context.globalAlpha = this.opacity;
				context.drawImage(img, -(this.newwidth / 2), -(this.newheight / 2),this.newwidth,this.newheight);
				context.restore();
				// //////////////////////////////////////////////////////////////////////////////////////////// END ARC
				break;
			case "vomit":
				// //////////////////////////////////////////////////////////////////////////////////////////// VOMIT
				this.x += this.vx;
				this.y += this.vy;
				this.r += this.vr;
				
				if (this.scale < settings.maxScale) {
					this.scale += settings.growspeed;
				} else {
					this.grow = false;
				}
				// if it's offscreen kill it.
				if (this.y-(this.newheight / 2) > canvas.height * 1.5 && this.life > 60) {
					delete particles[this.id];
				}
				// Adjust for gravity
				this.vy += settings.gravity;
				// Set up the new width based on scale
				this.newwidth = img.width * this.scale;
				this.newheight = img.height * this.scale;
				// draw the image
				context.clearRect(settings.leftWall, settings.groundLevel, canvas.width, canvas.height);
				// rotating stuff in canvas is weird, you have to move the 0,0 of the canvas to the centre of the
				// object, rotate the canvas to the required angle, draw the whatever, the reset the canvas position/rotation back to normal
				context.save();
				context.translate(this.x, this.y);
				context.rotate(this.r * Math.PI / 180);
				context.globalAlpha = this.opacity;
				context.drawImage(img, -(this.newwidth / 2), -(this.newheight / 2),this.newwidth,this.newheight);
				context.restore();
				// //////////////////////////////////////////////////////////////////////////////////////////// END VOMIT
				break;
			default:
				// //////////////////////////////////////////////////////////////////////////////////////////// DEFAULT
				this.x += this.vx;
				this.y += this.vy;
				this.r += this.vr;
				
				if (this.scale < settings.maxScale) {
					this.scale += settings.growspeed;
				} else {
					this.grow = false;
				}
				// If Particle is old, it gets processed.  To death.
				if (this.life > this.maxLife) {
					delete particles[this.id];
				}
				// Adjust for gravity
				this.vy += settings.gravity;
				// Set up the new width based on scale
				this.newwidth = img.width * this.scale;
				this.newheight = img.height * this.scale;
				// draw the image
				context.clearRect(settings.leftWall, settings.groundLevel, canvas.width, canvas.height);
				// rotating stuff in canvas is weird, you have to move the 0,0 of the canvas to the centre of the
				// object, rotate the canvas to the required angle, draw the whatever, the reset the canvas position/rotation back to normal
				context.save();
				context.translate(this.x, this.y);
				context.rotate(this.r * Math.PI / 180);
				context.globalAlpha = this.opacity;
				context.drawImage(img, -(this.newwidth / 2), -(this.newheight / 2),this.newwidth,this.newheight);
				context.restore();
				// //////////////////////////////////////////////////////////////////////////////////////////// END DEFAULT
				break;
		}
		// Age the particle
		this.life++;
	}
	
	// This is the main loop.  It has gotten a little messy but it works.
	function goLoop() {
		if (settings.noClear) {
			context.fillStyle = `rgba(0,255,0,${settings.fadeSpeed})`;
			context.fillRect(0, 0, canvas.width, canvas.height);
		} else {
			canvas.width = canvas.width;
		}
		
		// Add new particles
		for (var i = 0; i < settings.density; i++) {
			if (!settings.hasStarted) {
				new Particle();
				console.log("first one");
				settings.hasStarted = true;
			} else if (Math.random() > 0.97) {
				new Particle();
			}
		}
		
		// We count the number of particles is each loop so we can tell when they're all gone.
		var numPart = 0;
		// Draw each particle
		for (var i in particles) {
			particles[i].draw();
			numPart ++;
		}
		
		// When the number of particles counted above hits, zero, we either face the canvas out or just stop the loop
		if (numPart == 0 && settings.noClear && settings.hasStarted) {
			console.log('turn off');
			settings.noClear = false;
			canvas.width = canvas.width;
		} else if (numPart == 0 && !settings.noClear && settings.hasStarted) {
			console.log('bye');
			canvas.width = canvas.width;
			clearInterval(workIt);
		}
	}
	// Movement loop
	var workIt = setInterval(goLoop, 30);
};

