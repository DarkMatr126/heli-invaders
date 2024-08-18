window.addEventListener('load',() => {
	canvas.create('gameArea',60,1,2/3);
})

var playing = false;

function start() {	
	game.start(60);
	
	reset();

	pause(false);
	playing = true;

	UI.main(false);
	UI.game(true);
}

function end() {
	playing = false;
	game.pause(true);
	UI.over(true);
	UI.game(false);

	//update data
	var o = document.getElementById('gameover');
	var s = o.getElementsByClassName('score')[0];
	s.innerHTML = 'SCORE: ' + score.score;
}

function toMain() {
	UI.pause(false);
	UI.over(false);
	UI.game(false);
	UI.main(true);

	reset();
}



var paused = false;
function pause(bool) {
	if (bool) {
		paused = true;
		game.pause(true);
		UI.pause(true);
		UI.game(false);
	} else {
		if (!playing) {
			return;
		}

		paused = false;
		game.pause(false);
		UI.game(true);
		UI.pause(false);
	}
}

function reset() {
	//sprites
	sprite.data = {};
	missile.data = {};
	copter.data = {};

	//copter cooldown
	copter.variables.spawnRate = 1.5;
	copter.tickCounter = 0;

	//Score
	score.score = 0;
	updateScore();
}


var focused = true;
window.addEventListener('blur',() => {
	if (!playing) {
		return;
	}
	focused = false;
	pause(true)
})
window.addEventListener('keydown',(e) => {
	if (e.which === 27 && playing) {
		//esc
		pause(!paused);
	} else if (e.which === 82 && playing) {
		//r
		start();
	} else if (e.which === 13 && !playing) {
		//enter
		start();
		UI.main(false);
		UI.over(false);
	}
})


var down = [];
window.addEventListener('keydown',e => {
	if (down.indexOf(e.key) > -1) return;
	down.push(e.key);
})
window.addEventListener('keyup', e => {
	if (down.indexOf(e.key) === -1) return;
	down.splice(down.indexOf(e.key),1);
})
const isKeyDown = key => down.indexOf(key) > -1;