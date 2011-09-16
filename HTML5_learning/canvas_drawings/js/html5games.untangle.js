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
	boldLineThickness: 5,
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

function updateLineIntersection() {
	// checking lines intersection and bold those lines.
	for (var i=0;i<untangleGame.lines.length;i++) {
		for (var j=0;j<i;j++) {
			var line1 = untangleGame.lines[i];
			var line2 = untangleGame.lines[j];
			
			// we check if two lines are intersected.
			// and bold the line if they are.
			if (isIntersect(line1, line2)) {
				line1.thickness = untangleGame.boldLineThickness;
				line2.thickness = untangleGame.boldLineThickness;
			}
		}
	}
}

function isIntersect(line1, line2) {
	// convert line1 to general form of line: Ax+By = C
	var a1 = line1.endPoint.y - line1.startPoint.y;
	var b1 = line1.startPoint.x - line1.endPoint.x;
	var c1 = a1 * line1.startPoint.x + b1 * line1.startPoint.y;
	
	// convert line1 to general form of line: Ax+By = C
	var a2 = line2.endPoint.y - line2.startPoint.y;
	var b2 = line2.startPoint.x - line2.endPoint.x;
	var c2 = a2 * line2.startPoint.x + b2 * line2.startPoint.y;
	
	// calculate the intersection point
	var d = a1*b2 - a2*b1;
	
	// parallel when d is 0
	if (d == 0) {
		return false;
	} else {
		var x = (b2*c1 - b1*c2) / d;
		var y = (a1*c2 - a2*c1) / d;
		
		// check if the intersection point is on both line segments
		if ((isInBetween(line1.startPoint.x, x, line1.endPoint.x) ||
			 isInBetween(line1.startPoint.y, y, line1.endPoint.y)) &&
				(isInBetween(line2.startPoint.x, x, line2.endPoint.x) ||
				 isInBetween(line2.startPoint.y, y, line2.endPoint.y))) {
			return true;
		}
	}
	return false;
}

// return true if b is between a and c,
// we exclude the result when a==b or b==c
function isInBetween(a, b, c) {
	// return false if b is almost equal to a or c.
	// this is to eliminate some floating point when
	// two value is equal to each other but different with 0.0000...0001
	if (Math.abs(a-b) < 0.000001 || Math.abs(b-c) < 0.000001) {
		return false;
	}
	
	// true when b is in between a and c
	return (a < b && b < c) || (c < b && b < a);
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
	updateLineIntersection();
	
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
		updateLineIntersection();
	});
	
	// We clear the dragging circle data when mouse is up
	$("#game").mouseup(function(e) {
		untangleGame.targetCircle = undefined;
	});
	
	// setup an interval to loop the game loop
	setInterval(gameloop, 30);
});