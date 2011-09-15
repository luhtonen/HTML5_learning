$(function() {
	var canvas = document.getElementById("game");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "rgba(200, 200, 100, .6)";
	
	// draw bottom half circle
	ctx.beginPath();
	ctx.arc(100, 110, 50, 0, Math.PI);
	ctx.closePath();
	ctx.fill();
	
	// draw top half circle
	ctx.beginPath();
	ctx.arc(100, 90, 50, 0, Math.PI, true);
	ctx.closePath();
	ctx.fill();
	
	// draw left half circle
	ctx.beginPath();
	ctx.arc(230, 100, 50, Math.PI/2, Math.PI*3/2);
	ctx.closePath();
	ctx.fill();
	
	// draw right half circle
	ctx.beginPath();
	ctx.arc(250, 100, 50, Math.PI*3/2, Math.PI/2);
	ctx.closePath();
	ctx.fill();
	
	// draw a shape that is almost a circle
	ctx.beginPath();
	ctx.arc(180, 240, 50, Math.PI*7/6, Math.PI*2/3);
	ctx.closePath();
	ctx.fill();
	
	// draw a small arc
	ctx.beginPath();
	ctx.arc(150, 250, 50, Math.PI*7/6, Math.PI*2/3, true);
	ctx.closePath();
	ctx.fill();
});