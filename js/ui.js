const UI = {
	main:function (bool) {
		var m = document.getElementById('main')
		if (bool) {
			m.style.display = '';
		} else {
			m.style.display = 'none';
		}
	},
	pause:function (bool) {
		var p = document.getElementById('pause');
		if (bool) {
			p.style.display = '';
		} else {
			p.style.display = 'none';
		}
	},
	over:function (bool) {
		var o = document.getElementById('gameover');
		if (bool) {
			o.style.display = '';
		} else {
			o.style.display = 'none';
		}
	},
	game:function (bool) {
		var g = document.getElementById('game');
		if (bool) {
			g.style.display = '';
		} else {
			g.style.display = 'none';
		}
	}
}

function updateScore () {
	var s = document.getElementById('game').getElementsByClassName('score')[0];

	s.innerHTML = score.score;
}