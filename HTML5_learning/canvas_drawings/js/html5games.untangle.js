function clear(ctx) {
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
}

function Circle(x,y,radius) {
	this.x = x;
	this.y = y;
	this.radius = radius;
}

function Line(startPoint,endPoint,thickness) {
	this.startPoint = startPoint;
	this.endPoint = endPoint;
	this.thickness = thickness;
}

var untangleGame = {
	circles: [],
	thinLineThickness: 1,
	lines: []
}

function drawLine(ctx, x1, y1, x2, y2, thickness) {
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.lineWidth = thickness;
	ctx.strokeStyle = "#cfc";
	ctx.stroke();
}

function drawCircle(ctx, x, y, radius) {
	ctx.fillStyle = "rgba(200, 200, 100, .9)";
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI*2, true);
	ctx.closePath();
	ctx.fill();
}

function connectCircles() {
	// connect the circles to each other with lines
	untangleGame.lines.length = 0;
	for (var i=0;i< untangleGame.circles.length;i++) {
		var startPoint = untangleGame.circles[i];
		for(var j=0;j<i;j++) {
			var endPoint = untangleGame.circles[j];
			untangleGame.lines.push(new Line(startPoint, endPoint, untangleGame.thinLineThickness));
		}
	}
}

function gameloop() {
	// get the references of the canvas element and the drawing context.
	var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');
	
	// clear the canvas before re-drawing.
	clear(ctx);
	
	// draw all remembered line
	for (var i=0;i<untangleGame.lines.length;i++) {
		var line = untangleGame.lines[i];
		var startPoint = line.startPoint;
		var endPoint = line.endPoint;
		var thickness = line.thickness;
		drawLine(ctx, startPoint.x, startPoint.y, endPoint.x, endPoint.y, thickness);
	}
	
	// draw all remembered circles
	for (var i=0;i<untangleGame.circles.length;i++) {
		var circle = untangleGame.circles[i];
		drawCircle(ctx, circle.x, circle.y, circle.radius);
	}
}

$(function() {
	var canvas = document.getElementById("game");
	var ctx = canvas.getContext("2d");
	
	var circleRadius = 10;
	
	var width = canvas.width;
	var height = canvas.height;
	
	// random 5 circles
	var circlesCount = 5;
	for (var i=0;i<circlesCount;i++) {
		var x = Math.random()*width;
		var y = Math.random()*height;
		drawCircle(ctx, x, y, circleRadius);
		untangleGame.circles.push(new Circle(x,y,circleRadius)); 
	}
	connectCircles();
	
	// Add Mouse Event Listener to canvas
	// we find if the mouse down position is on any circle
	// and set the circle as target dragging circle.
	$("#game").mousedown(function(e) {
		var canvasPosition = $(this).offset();
		var mouseX = e.layerX || 0;
		var mouseY = e.layerY || 0;
		
		for (var i=0;i<untangleGame.circles.length;i++) {
			var circleX = untangleGame.circles[i].x;
			var circleY = untangleGame.circles[i].y;
			var radius = untangleGame.circles[i].radius;
			if (Math.pow(mouseX-circleX,2) + Math.pow(mouseY-circleY,2) < Math.pow(radius,2)) {
				untangleGame.targetCircle = i;
				break;
			}
		}
	});
	
	// we move the target draggin circel when the mouse is moving
	$("#game").mousemove(function(e) {
		if (untangleGame.targetCircle != undefined) {
			var canvasPosition = $(this).offset();
			var mouseX = e.layerX || 0;
			var mouseY = e.layerY || 0;
			var radius = untangleGame.circles[untangleGame.targetCircle].radius;
			untangleGame.circles[untangleGame.targetCircle] = new Circle(mouseX, mouseY, radius);
		}
		connectCircles();
	});
	
	// We clear the dragging circle data when mouse is up
	$("#game").mouseup(function(e) {
		untangleGame.targetCircle = undefined;
	});
	
	// setup an interval to loop the game loop
	setInterval(gameloop, 30);
});