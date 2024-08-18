var canvas = {
	cDoc: document.createElement('canvas'),
	aspectR: 16/9,
	create: function(divID = 'gameArea',fps = 60,scale = 1, aspectR = this.aspectR){
		var c = this.cDoc;
		this.aspectR = aspectR

		this.scale = scale;
		var resized = resizeCanvas(document.documentElement.clientWidth,document.documentElement.clientHeight);
		c.style.width = `${resized[0] * this.scale}px`;
		c.style.height = `${resized[1] * this.scale}px`;
		if (resized[0] > resized[1]) {
			//width is larger
			c.width = 1000;
			c.height = c.width*this.aspectR;
		} else {
			//height is larger
			c.height = 1000;
			c.width = c.height*this.aspectR;
		}

		var div = document.getElementById(divID);
		div.innerHTML = '';
		div.append(c);
		
		this.fps = fps
		this.fpsInt = 1000/this.fps;

		this.renderInt = setInterval(render,this.fpsInt);

		this.minX = 0;
		this.maxX = c.width;
		this.minY = 0;
		this.maxY = c.height;
	}
}
function render() {
	var s = sprite.data;
	var ctx = canvas.cDoc.getContext('2d')
	var c = canvas.cDoc;

	//reset canvas
	c.width = c.width - 1;
	c.width = c.width + 1;

	for (var key in s) {
		if (!s.hasOwnProperty(key)) {
			continue;
		}
		if (!(sprite.deleted.indexOf(key) === -1)) {
			continue;
		}
		var obj = s[key];
		var data = obj.data;
		var type = obj.type.toLowerCase();

		switch (type) {
			case 'rect':
				var cx = data.x;
				var cy = data.y;
				var width = data.w;
				var height = data.h;

				var fill = '#0000';
				if (typeof data.fill != 'undefined') {
					fill = data.fill;
				}
				var stroke = '#0000';
				if (typeof data.stroke != 'undefined') {
					stroke = data.stroke;
				}

				var x = cx-width/2
				var y = ((canvas.maxY-cy)-height/2)

				ctx.fillStyle = fill;
				ctx.strokeStyle = stroke;

				// ctx.fillRect(x,y,width,height)
				// ctx.strokeRect(x,y,width,height)

				ctx.beginPath();
				ctx.rect(x,y,width,height);
				ctx.fill();
				ctx.stroke();

				break;
			case 'line':
				var x1 = data.x1;
				var y1 = canvas.maxY-data.y1;
				var x2 = data.x2;
				var y2 = canvas.maxY-data.y2;
				var stroke = data.stroke;
				var lWidth = data.width;

				ctx.strokeStyle = stroke;
				ctx.lineWidth = lWidth;

				ctx.beginPath();
				ctx.moveTo(x1,y1);
				ctx.lineTo(x2,y2);
				ctx.stroke();

				break;
			case 'circle':
				var x = data.x;
				var y = canvas.maxY - data.y;
				var r = data.r;

				var stroke = '#0000';
				if (typeof data.stroke != 'undefined') {
					stroke = data.stroke;
				}
				var fill = '#0000';
				if (typeof data.fill != 'undefined') {
					fill = data.fill;
				}

				ctx.strokeStyle = stroke;
				ctx.fillStyle = fill;

				ctx.beginPath();
				ctx.arc(x,y,r,0,2 * Math.PI);

				ctx.stroke();
				ctx.fill();

				break;
			case 'img':
				var w = data.w;
				var h = data.h;
				var x = data.x - w/2;
				var y = canvas.maxY - data.y - h/2;
				var img = obj.img;

				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(img,x,y,w,h);

				break;		   
			default:
				console.warn(`Sprite #${key} was not correctly defined`);
		}
	}
}
function resizeCanvas(width,height) {//returns [width,height]
	var scale = [];
	if (!(width/canvas.aspectR > height)) {
		//width stick
		scale.push(width);
		scale.push(width/canvas.aspectR);
	} else {
		//height stick
		scale.push(height*canvas.aspectR);
		scale.push(height);
	}
	return scale;
}
window.addEventListener('resize',() => {
	var c = canvas.cDoc;
	
	var resized = resizeCanvas(document.documentElement.clientWidth,document.documentElement.clientHeight);
	c.style.width = `${resized[0]*canvas.scale}px`;
	c.style.height = `${resized[1]*canvas.scale}px`;
})

var sprite = {
	data: {},
	deleted: [],
	add: function(id,sType = 'rect', data = {}, classes = [], hitbox = 'rect'){ //hitbox can be 'rect', 'circle' or 'none'
		sprite.toggle(id,'on');
		var obj = {
			type:sType,
			class:classes,
			hitbox: {
				type: hitbox
			},
			data:data
		}
		//Hitbox
		switch (hitbox) {
			case 'circle':
				switch (sType) {
					case 'circle':
						obj.hitbox.radius = data.r;
						break;
					case 'rect':
					case 'img':
						var w = data.w;
						var h = data.h;
						var average = (w+h)/2

						var dat = {
							r:average,
							x:data.x,
							y:data.y
						}

						obj.hitbox = {
							...dat,
							...obj.hitbox,
						}
						break;
					case 'line':
						var distance = Math.distance([data.x1,data.y1],[data.x2,data.y2]);
						
						var dat = {
							r: distance/2,
							x: (data.x1+data.x2)/2,
							y: (data.y1+data.y2)/2,
						}
						obj.hitbox = {
							...dat,
							...obj.hitbox,
						}
						break;
				}
				break;
			case 'rect':
				switch (sType) {
					case 'circle':
						var r = data.r;
						
						var bounds = {
							minX: data.x - r,
							maxX: data.x + r,
							minY: data.y - r,
							maxY: data.y + r,
						}
						obj.hitbox = {
							...bounds,
							...obj.hitbox,
						}

						break;
					case 'rect':
					case 'img':
						var bounds = {
							minX: data.x - data.w/2,
							maxX: data.x + data.w/2,
							minY: data.y - data.h/2,
							maxY: data.y + data.h/2,
						}

						obj.hitbox = {
							...bounds,
							...obj.hitbox,
						}
						break;
					case 'line':
						var xs = [data.x1,data.x2].sort((a,b) => {return a-b});
						var ys = [data.y1,data.y2].sort((a,b) => {return a-b});

						var bounds = {
							minX: xs[0],
							maxX: xs[1],
							minY: ys[0],
							maxY: ys[1],
						}

						obj.hitbox = {
							...bounds,
							...obj.hitbox,
						}
						break;
				}
				break;
		}

		//Image rendering
		if (sType === 'img') {
			if (typeof data.url == 'object') {
				obj.img = data.url;
			} else {
				var img = new Image();
				img.src = data.url;
				img.onload = () => {obj.img = img};
			}
		}

		//classes
		for (let i = 0; i < classes.length; i++) {
			this.classes[classes[i]] ||= [];

			if (this.classes[classes[i]].indexOf(id) === -1) {
				this.classes[classes[i]].push(id)
			}
		}

		this.data[id] = obj
	},
	edit: function(id,key,value,sType = 'data'){ //which var can be 'data' or 'tag'; don't advise using
		if (typeof this.data[id] == 'undefined') {
			console.warn('ID was not found');
			return;
		}
		var sp = this.data[id];
		
		switch (sType) {
			case 'data':
				sp.data[key] = value;
			case 'tag':
				sp[key] = value;
		}
	},
	toggle: function(id,toggle = undefined, timeout = 0){//same as deleting
		if (typeof id == 'object') {
			//is a class
			for (var key in this.data) {
				if (!this.data.hasOwnProperty(key)) {
					continue;
				}
				var sp = this.data[key];
				for (let i = 0; i < sp.class.length; i++) {
					if (id.indexOf(sp.class[i]) === -1) {
						continue;
					}
					this.toggle(key,toggle);
					break;
				}
			}
			return;
		}
		var index = this.deleted.indexOf(id)
		switch (toggle) {
			case 'off':
				if (index === -1) {
					setTimeout(() => {
						this.deleted.push(id);
					},timeout)
				}
				break;
			case 'on':
				if (index != -1) {
					setTimeout(() => {
						this.deleted.splice(index,1);
					},timeout)
				}
				break;
			default:
				if (index === -1) {
					setTimeout(() => {
						this.deleted.push(id);
					},timeout)
					return;
				}
				setTimeout(() => {
					this.deleted.splice(index,1);
				},timeout)
		}
	},
	classes: {},
};

/*
<><><><><><><><><><>
Sprite Structuring:

sprites will be centered unless stated otherwise
data keys are case sensitive (width is different from Width)
stroke left blank for transparent

id is the sprite key (sprite[key])

Tag:
type = String
class = []
data = {}

~~~~~~
Types:
~~~~~~
Rectangles:
type = 'rect'
data = {
	x: Number,
	y: Number,
	w: Number,
	h: Number,
	fill: Color:String,
	stroke: Color:String
}

Lines:
type = 'line'
data = {
	x1: Number,
	y1: Number,
	x2: Number,
	y2: Number,
	stroke: Color:String,
	width: Color:String
}

Circles:
type = 'circle'
data = {
	x: Number,
	y: Number,
	r: Number,
	fill: Color:String,
	stroke: Color:String
}

Images:
type = 'img'
data = {
	url: String,
	x: Number,
	y: Number,
	w: Number,
	h: Number
}


Hitboxes:

Rect:
	minX
	maxX
	minY
	maxY

Circle:
	x
	y
	r

None:

*/

//COLLISION FUNCTIONS
function isCollidingWith (id1,id2) {
	if (typeof sprite.data[id1] == 'undefined' || typeof sprite.data[id2] == 'undefined' ) {
		// console.warn('Sprite was not found');
		return;
	}

	if (sprite.deleted.indexOf(id1) > -1 || sprite.deleted.indexOf(id2) > -1) {
		return false
	}

	var sp1 = sprite.data[id1];
	var hit1 = sp1.hitbox;

	var sp2 = sprite.data[id2];
	var hit2 = sp2.hitbox;

	if ([hit1.type,hit2.type].indexOf('none') > -1) {
		//can't collide
		return false;
	} else if (hit1.type === hit2.type) {
		//same hitbox type
		if (hit1.type === 'rect') {
			//both rect hitbox

			var a = hit1;
			var b = hit2;

			if (a.maxX >= b.minX && a.minX <= b.maxX) {
				//overlap on x axis
				if (a.maxY >= b.minY && a.minY <= b.maxY) {
					//overlap on y axis
					return true;
				}
			}
			return false;
		} else if (hit1.type === 'circle') {
			//both circle

			//algorithm
			/*
			calculate angle between centers
			from one, step up to it's circumference
			calculate distance to other center
			if less than c2 radius, colliding
			*/

			var x1 = hit1.x;
			var y1 = hit1.y;
			var r1 = hit1.radius;

			var x2 = hit2.x;
			var y2 = hit2.y;
			var r2 = hit2.radius;

			var degrees = calcAngle([x1,y1],[x2,y2]);
			var radians = degrees * Math.PI / 180;
			var onCirc1 = rotatePoint([x1+r1,y1],radians,[x1,y1]);

			var disToCirc2 = Math.distance(onCirc1,[x2,y2]);

			// sprite.add('refLine','line',[],{x1:x1,y1:y1,x2:x2,y2:y2,stroke:'black',width:2});
			// sprite.add('refPoint','circle',[],{x:onCirc1[0],y:onCirc1[1],r:3,fill:'green'});
			
			if (disToCirc2 <= r2) {
				return true;
			}
			return false;
		}
	} else {
		//different types
		return false; //for now
	}
}
function isCollidingClass (id,classes = [], returnIDs = false) {
	var ids = [];
	for (let i1 = 0; i1 < classes.length; i1++) {
		if (!sprite.classes[`${classes[i1]}`]) { //if class is not defined
			continue;
		}
		var cls = sprite.classes[`${classes[i1]}`];
		for (let i = 0; i < cls.length; i++) {
			var id2 = cls[i];
			if (isCollidingWith(id,id2)) {
				if (returnIDs) {
					if (ids.indexOf(id2) === -1) {
						ids.push(id2);
					}
					continue;
				}
				return true;
			}
		}
	}
	if (returnIDs) {
		return ids;
	}
	return false;
}
var bounds = {
	minY:0,
	maxY:canvas.maxY*2,
	minX:-canvas.maxX*2,
	maxX:canvas.maxX*2
}
function outOfBounds (id) {
	//not done yet

	var minX = data.x-(data.w/2);
	var maxX = data.x+(data.w/2);
	var minY = data.y-(data.h/2);
	var maxY = data.y+(data.h/2);

	if (minX < bounds.minX || minY < bounds.minY || maxX > bounds.maxX || maxY > bounds.maxY) {
		return true;
	}

	return false;
}

Math['distance'] = (p1,p2) => {
	var x1 = p1[0];
	var y1 = p1[1];
	
	var x2 = p2[0];
	var y2 = p2[1];

	var x = Math.pow(x2-x1,2);
	var y = Math.pow(y2-y1,2);

	return Math.sqrt(x+y);
}

function calcAngle (p1 = [],p2 = []) {
	var x1 = p1[0];
	var y1 = p1[1];

	var dx = p2[0];
	var dy = p2[1];

	var x = dx-x1;//relative coords
	var y = dy-y1;

	var degrees = Math.atan2(y, x) * 180 / Math.PI;

	return degrees;
}

function rotatePoint (p1,rad,p2 = [0,0]) {
	p1 = [p1[0]-p2[0],p1[1]-p2[1]];

	var x1 = p1[0]*Math.cos(rad)-p1[1]*Math.sin(rad);
	var y1 = p1[1]*Math.cos(rad)+p1[0]*Math.sin(rad);

	var p3 = [x1,y1];
	p3 = [x1+p2[0],y1+p2[1]];

	return p3;
}