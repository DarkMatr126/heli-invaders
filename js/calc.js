Number.prototype.freeze = function() {
	return parseFloat(`${this}`);
}
Array.prototype.mean = function() {
	var hasNum = false;
	var num = 0;
	var sum = 0;
	for (let i = 0; i < this.length; i++) {
		if (typeof this[i] == 'number') {
			sum+= this[i];
			num++;
			hasNum = true;
		}
	};

	if (hasNum) {
		return sum/num;
	};
	return undefined;
}
const getObjLength = function(obj) {
	var length = 0;
	for (var key in obj) {
		if (!obj.hasOwnProperty(key)) {
			continue;
		}
		length++;
	}
	return length;
}

const constants = {
	get offset() {
		return 90/game.tps;
	}
}

const score = {
	dependant: {
		add:10,
		score: 0,
	},
	get add() {
		return this.dependant.add * this.multi;
	},

	multi: 1,

	get score () {
		return this.dependant.score;
	},
	set score (s) {
		this.dependant.score = s;

		updateScore();
	},
}

const game = {
	intervals: {

	},
	tick: function() {
		player.movement();
		player.firing();
		copter.tick.call(copter);

		missile.movement.call(missile);

		sprite.add('player','img',{x:player.data.pos.x,y:player.data.pos.y,w:player.data.scale.w,h:player.scale.h,url:player.img},[],'rect');

	},
	start: function(tps = 90) {
		this.tps = tps;
		this.tpsInt = 1000/tps;

		copter.int();
		player.int();

		this.pause(false);
	},
	pause: function(bool = true) {
		if (bool) {
			clearInterval(this.intervals.tick);
		} else { //if (typeof this.intervals.tick == 'undefined')
			clearInterval(this.intervals.tick);
			this.intervals.tick = setInterval(() => {this.tick.call(game)},this.tpsInt);
		}
	},
}

const player = {
	//dependant variables
	dependant: {
		speed: 5,
		fireRate: 5,
	},

	get speed() {
		return this.dependant.speed * constants.offset;
	},
	set speed(spd) {
		this.dependant.speed = spd;
	},

	get fireRate() {
		return game.tps / this.dependant.fireRate;
	},
	set fireRate(rt) {
		this.dependant.fireRate = rt;
	},

	//variables
	ticksDown:0,

	scale: {
		w: 150,
		h: 150
	},
	int:function() {
		this.data = new this.player();

		var img = new Image();
		img.src = 'images/player.png';
		img.onload = function() {
			player.img = img;
		}
	},
	movement: function() {
		var velX = [];
		var velY = [];
		
		if (isKeyDown('a')) {
			velX.push(-this.speed)
		}
		if (isKeyDown('d')) {
			velX.push(this.speed * constants.offset)
		}
		if (isKeyDown('s')) {
			velY.push(-this.speed * constants.offset)
		}
		if (isKeyDown('w')) {
			velY.push(this.speed * constants.offset)
		}

		if (velX.length != 0) {
			velX = velX.mean();

			player.data.pos.x+= velX;
		}
		if (velY.length != 0) {
			velY = velY.mean();

			player.data.pos.y+= velY;
		}

		if (player.data.pos.x < canvas.minX) {
			player.data.pos.x = canvas.minX;
		}
		if (player.data.pos.x > canvas.maxX) {
			player.data.pos.x = canvas.maxX;
		}

		if (player.data.pos.y < canvas.minY) {
			player.data.pos.y = canvas.minY;
		}
		if (player.data.pos.y > canvas.maxY) {
			player.data.pos.y = canvas.maxY;
		}

		if (isCollidingClass('player',['copter'])) {
			//game over
			end();
		}
	},
	firing: function() {
		if (isKeyDown(32)) {
			if (this.ticksDown <= 0) {
				missile.spawn(this.data.pos.x,this.data.pos.y + 50);
				this.ticksDown = this.fireRate;
			} else {
				this.ticksDown--;
			}
		} else {
			this.ticksDown = 0;
		}
	},

	player: class {
		constructor() {
			this.pos = {
				x:canvas.maxX/2,
				y:canvas.maxY*0.25
			}

			this.scale = {
				w: 150,
				h: 150
			}

		}
	},

	data: {},
}

const missile = {
	//dependants vars
	dependant: {
		spd:10,
	},
	get spd() {
		return this.dependant.spd * constants.offset;
	},
	set spd(spd) {
		this.dependant.spd = spd;
	},
	
	
	//independent variables
	height:50,
	width: 5,

	//constructors
	missile: class {
		constructor(x,y) {
			this.h = missile.height;
			this.fill = '#ff0';
			this.pos = {
				x:x,
				y:y,
			}
		}
	},

	//functions/misc
	data: {},
	movement:function() {
		for (var key in this.data) {
			if (!this.data.hasOwnProperty(key)) {
				continue;
			}
			if (this.removed.indexOf(key) > -1) {
				continue;
			}


			this.data[key].pos.y+= this.spd;

			var x = this.data[key].pos.x;
			var y1 = this.data[key].pos.y;
			var y2 = this.data[key].pos.y + this.data[key].h;
			var stroke = this.data[key].fill;

			//check for collisions
			if (isCollidingClass(`m${key}`,['copter'])) {
				this.kill(key);
				continue;
			}
			if (y1 > canvas.height) {
				this.kill(key);
				continue
			}

			sprite.add(`m${key}`,'line',{x1:x,y1:y1,x2:x,y2:y2,stroke:stroke,width:this.width},['missile']);
		}
	},
	spawn:function(x,y) {
		var mis = new missile.missile(x,y);

		var id;
		if (this.removed.length > 0) {
			id = this.removed[0];
		} else {
			id = `_${getObjLength(this.data)}`;
		}

		this.data[id] = mis;
		
		if (this.removed.length > 0) {
			this.removed.splice(0,1);
		}
	},
	kill:function(id) {
		this.removed.push(id);
		sprite.toggle(`m${id}`,'off',10)
	},
	removed: [],
}

const copter = {
	//getters and setters
	variables: {
		spawnRate: 1.5,
		minSpawnRate: 1/player.dependant.fireRate * 0.8,
		fallSpd: 0.7,
		aniRate: 0.3,
	},
	
	get spawnRate() {
		return this.variables.spawnRate * game.tps;
	},
	set spawnRate(rate) {
		this.variables.spawnRate = rate;
	},
	get minSpawnRate() {
		return this.variables.minSpawnRate * game.tps;
	},
	set minSpawnRate(rate) {
		this.variables.minSpawnRate = rate;
	},

	get fallSpd() {
		var offset = Math.floor((Math.random() * this.fallingSpdVary*2) - this.fallingSpdVary)
		return this.variables.fallSpd * constants.offset * (1 + offset/100);
	},
	set fallSpd(rate) {
		this.variables.spawnRate = rate
	},

	get aniRate() {
		return this.variables.aniRate * game.tps / this.animations;
	},
	set aniRate(rate) {
		this.variables.aniRate = rate;
	},


	//variables
	tickCounter: 0,
	spawnDegrade: 0.96, //super sensative
	fallingSpdVary: 50, //in max percent that can increase and decrease
	animations: 5,

	//functions/misc
	sprite: class {
		constructor (x,y) {
			this.scale = 
			{
				w: 100,
				h: 100,
			}
			this.pos = 
			{
				x:x,
				y:y,
			}
			this.fallSpd = copter.fallSpd;
			this.frame = 1;
			this.aniTicks = 0; //how many ticks since last change,
			this.aniRate = copter.aniRate;
		};
	},
	data: {},
	frames: {},
	intervals: {},
	int: function() {
		//load sprites
		//function need to be called so i doesn't change after delay
		function newImg(i) {
			var img = new Image();
			img.src = `images/copter/${i}.png`;
			img.onload = () => {copter.frames[`_${i}`] = img;}
		}
		for (let i = 1; i <= 5; i++) {
			newImg(i);
		}
	},
	tick: function() {
		//spawning
		if (this.tickCounter >= this.spawnRate) {
			var x = Math.floor(Math.random() * canvas.maxX);
			this.spawn(x,canvas.maxY + 100);

			this.tickCounter = 0;
			this.spawnRate*= this.spawnDegrade / game.tps;
			if (this.spawnRate < this.minSpawnRate) {
				this.spawnRate = this.minSpawnRate / game.tps;
			}
		} else {
			this.tickCounter++;
		};

		for (var key in this.data) {
			if (!this.data.hasOwnProperty(key)) {
				continue;
			}
			if (this.removed.indexOf(key) > -1) {
				continue;
			}

			//animation
			if (this.data[key].aniTicks >= this.data[key].aniRate) {
				this.data[key].frame++;
				if (this.data[key].frame > this.animations) {
					this.data[key].frame = 1;
				}
				this.data[key].aniTicks = 0;
			} else {
				this.data[key].aniTicks++;
			}

			//pos
			this.data[key].pos.y-=this.data[key].fallSpd;
			if (this.data[key].pos.y < canvas.minY) {
				//game over
				end();
			}

			//check for collisions
			if (isCollidingClass(`c${key}`,['missile']) && this.data[key].pos.y < canvas.maxY + 50) {
				this.kill(key)
				score.score+=score.add;
				continue;
			}

			//render
			var img = this.frames[`_${this.data[key].frame}`]
			sprite.add(`c${key}`,'img',{x:this.data[key].pos.x,y:this.data[key].pos.y,url:img,w:this.data[key].scale.w,h:this.data[key].scale.h},['copter'],'rect')
		}
	},
	kill:function(id) {
		this.removed.push(id);
		sprite.toggle(`c${id}`,'off',10)
	},
	spawn: function(x,y) {
		var copt = new this.sprite(x,y);

		var id;
		if (this.removed.length > 0) {
			id = this.removed[0];
		} else {
			id = `_${getObjLength(this.data)}`;
		}

		this.data[id] = copt;
		if (this.removed.length > 0) {
			this.removed.splice(0,1);
		}
	},
	removed: [],
}

function isDeleted (id) {
	if (sprite.deleted.indexOf(id) > -1) {
		return true;
	}
	return false;
}