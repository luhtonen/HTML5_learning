// a global object variable to store all game scope variable.
var audiogame = {};

// init function when the DOM is ready
$(function(){	
	// get the references of the audio element.
	audiogame.buttonOverSound = document.getElementById("buttonover");
	audiogame.buttonOverSound.volume = .3;
	audiogame.buttonActiveSound = document.getElementById("buttonactive");
	audiogame.buttonActiveSound.volume = .3;
	
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
});

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