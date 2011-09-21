function MusicNote(time,line) {
	this.time = time;
	this.line = line;
}

function Dot(distance, line) {
	this.distance = distance;
	this.line = line;
	this.missed = false;
}

// a global object variable to store all game scope variable.
var audiogame = {};

// an array to store all music notes data.
audiogame.musicNotes = [];
audiogame.leveldata = "1.592,3;1.984,2;2.466,1;2.949,2;4.022,3";
// the visual dots drawn on the canvas.
audiogame.dots = [];
// for storing the starting time
audiogame.startingTime = 0;
// reference of the dot image
audiogame.dotImage = new Image();

function setupLevelData() {
	var notes = audiogame.leveldata.split(";");
	for (var i in notes) {
		var note = notes[i].split(",");
		var time = parseFloat(note[0]);
		var line = parseInt(note[1]);
		var musicNote = new MusicNote(time,line);
		audiogame.musicNotes.push(musicNote);
	}
}

// init function when the DOM is ready
$(function(){	
	// get the references of the audio element.
	audiogame.melody = document.getElementById("melody");
	audiogame.base = document.getElementById("base");
	audiogame.buttonOverSound = document.getElementById("buttonover");
	audiogame.buttonOverSound.volume = .3;
	audiogame.buttonActiveSound = document.getElementById("buttonactive");
	audiogame.buttonActiveSound.volume = .3;
	
	// load the dot image
	audiogame.dotImage.src = "images/dot.png";
	
	// listen the button event that links to #game
	$("a[href='#game']")
	.hover(function(){
		audiogame.buttonOverSound.currentTime = 0;		
		audiogame.buttonOverSound.play();	
	},function(){
		audiogame.buttonOverSound.pause();	
	})
	.click(function(){
		audiogame.buttonActiveSound.currentTime = 0;
		audiogame.buttonActiveSound.play();
		
		return false;
	});
	drawBackground();
	setupLevelData();
	setInterval(gameloop, 30);
	startGame();
});

function playMusic() {
	// play both the melody and base
	audiogame.melody.play();
	audiogame.base.play();
}

function startGame() {
	// starting game
	var date = new Date();
	audiogame.startingTime = date.getTime();
	setTimeout(playMusic, 3550);
}

function drawBackground() {
	// get the reference of the canvas and the context.
	var game = document.getElementById("game-background-canvas");
	var ctx = game.getContext('2d');
	
	// set the line style of the three vertical lines.
	ctx.lineWidth = 10;
	ctx.strokeStyle = "#000";
	
	var center = game.width/2;
	
	// draw the three lines
	// the left line is placed 100 pixels on the left of center.
	ctx.beginPath();
	ctx.moveTo(center-100, 50);
	ctx.lineTo(center-100, ctx.canvas.height - 50);
	ctx.stroke();
	
	// the middle line is placed a the center
	ctx.beginPath();
	ctx.moveTo(center, 50);
	ctx.lineTo(center, ctx.canvas.height - 50);
	ctx.stroke();

	// the right line is placed 100 pixels on the right of center.
	ctx.beginPath();
	ctx.moveTo(center+100, 50);
	ctx.lineTo(center+100, ctx.canvas.height - 50);
	ctx.stroke();
	
	// draw the horizontal line
	ctx.beginPath();
	ctx.moveTo(center-150, ctx.canvas.height - 80);
	ctx.lineTo(center+150, ctx.canvas.height - 80);
	// reset the line style to 1px width and grey before actually
	// drawing the horizontal line.
	ctx.lineWidth = 1;
	ctx.strokeStyle = "rgba(50, 50, 50, .8)";
	ctx.stroke();
}

// logic that run every 30ms.
function gameloop() {
	var game = document.getElementById("game-canvas");
	var ctx = game.getContext("2d");
	
	// show new dots
	// if the game is started
	if (audiogame.startingTime != 0) {
		for (var i in audiogame.musicNotes) {
			// get the elapsed time from beginning of the melody
			var date = new Date();
			var elapsedTime = (date.getTime() - audiogame.startingTime)/1000;
			var note = audiogame.musicNotes[i];
			
			// check if the dot appear time is as same as the elapsed time
			var timeDiff = note.time - elapsedTime;
			if (timeDiff >= 0 && timeDiff <= .03) {
				// create the dot when the appear time is within one frame of the elapsed time
				var dot = new Dot(ctx.canvas.height-150, note.line);
				audiogame.dots.push(dot);
			}
		}
	}
	
	// move the dots
	for (var i in audiogame.dots) {
		audiogame.dots[i].distance -= 2.5;
	}
	
	// only clear the dirty area, that is the middle are
	ctx.clearRect(ctx.canvas.width/2 - 200, 0, 400, ctx.canvas.height);
	
	// draw the music note dots
	for (var i in audiogame.dots) {
		// prepare the radial gradients fill style
		var circle_gradient = ctx.createRadialGradient(-3,-3,1,0,0,20);
		circle_gradient.addColorStop(0, "#fff");
		circle_gradient.addColorStop(1, "#cc0");
		ctx.fillStyle = circle_gradient;
		
		// prepare the dot position to draw
		ctx.save();
		var center = game.width/2;
		var dot = audiogame.dots[i];
		var x = center-100;
		if (dot.line == 2) {
			x = center;
		} else if (dot.line == 3) {
			x = center+100;
		}
		
		// draw the dot at position according to the line and distance
		ctx.translate(x, ctx.canvas.height-80-audiogame.dots[i].distance);
		ctx.drawImage(audiogame.dotImage, -audiogame.dotImage.width/2, -audiogame.dotImage.height/2);
		ctx.restore();
	}
}