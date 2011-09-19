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
	lines: [],
	currentLevel: 0,
	progressPercentage: 0
};

untangleGame.levels = [
  {
	  "level" : 0,
	  "circles" : [{"x" : 400, "y" : 156},
	               {"x" : 381, "y" : 241},
	               {"x" : 84,  "y" : 233},
	               {"x" : 88,  "y" : 73}],
	  "relationship" : {
		  "0" : {"connectedPoints" : [1,2]},
		  "1" : {"connectedPoints" : [0,3]},
		  "2" : {"connectedPoints" : [0,3]},
		  "3" : {"connectedPoints" : [1,2]}
	  }
  },
  {
	  "level" : 1,
	  "circles" : [{"x" : 401, "y" : 73},
	               {"x" : 400, "y" : 240},
	               {"x" : 88,  "y" : 241},
	               {"x" : 84,  "y" : 72}],
	  "relationship" : {
		  "0" : {"connectedPoints" : [1,2,3]},
		  "1" : {"connectedPoints" : [0,2,3]},
		  "2" : {"connectedPoints" : [0,1,3]},
		  "3" : {"connectedPoints" : [0,1,2]}
	  }
  },
  {
	  "level" : 2,
	  "circles" : [{"x" : 192, "y" : 155},
	               {"x" : 353, "y" : 109},
	               {"x" : 493, "y" : 156},
	               {"x" : 490, "y" : 236},
	               {"x" : 348, "y" : 276},
	               {"x" : 195, "y" : 228}],
	  "relationship" : {
		  "0" : {"connectedPoints" : [2,3,4]},
		  "1" : {"connectedPoints" : [3,5]},
		  "2" : {"connectedPoints" : [0,4,5]},
		  "3" : {"connectedPoints" : [0,1,5]},
		  "4" : {"connectedPoints" : [0,2]},
		  "5" : {"connectedPoints" : [1,2,3]}
	  }
  }
];

function setupCurrentLevel() {
	untangleGame.circles = [];
	var level = untangleGame.levels[untangleGame.currentLevel];
	for (var i=0;i<level.circles.length;i++) {
		untangleGame.circles.push(new Circle(level.circles[i].x, level.circles[i].y, 10));
	}
	// setup line data after setup the circles.
	connectCircles();
	updateLineIntersection();
}

function checkLevelCompleteness() {
	if ($("#progress").html() == "100") {
		if (untangleGame.currentLevel+1 < untangleGame.levels.length) {
			untangleGame.currentLevel++;
		}
		setupCurrentLevel();
	}
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
	// prepare the radial gradients fill style
	var circle_gradient = ctx.createRadialGradient(x-3,y-3,1,x,y,radius);
	circle_gradient.addColorStop(0, "#fff");
	circle_gradient.addColorStop(1, "#cc0");
	ctx.fillStyle = circle_gradient;
	
	// draw the path
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI*2, true);
	ctx.closePath();
	
	// actually fill the circle path
	ctx.fill();
}

$(function() {
	var canvas = document.getElementById("game");
	var ctx = canvas.getContext("2d");
	
	// draw a splash screen when loading the game background
	// draw gradients background	
	var bg_gradient = ctx.createLinearGradient(0,0,0,ctx.canvas.height);
	bg_gradient.addColorStop(0, "#cccccc");
	bg_gradient.addColorStop(1, "#efefef");
	ctx.fillStyle = bg_gradient;
	ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
	
	// draw the loading text
	ctx.font = "34px 'Rock Salt'";
	ctx.textAlign = "center";
	ctx.fillStyle = "#333333";
	ctx.fillText("loading...",ctx.canvas.width/2,ctx.canvas.height/2);
	
	// load the background image
	untangleGame.background = new Image();
	untangleGame.background.onload = function() {
		// setup an interval to loop the game loop
		setInterval(gameloop, 30);
	};
	untangleGame.background.onerror = function() {
		console.log("Error loading the image.");
	};
	untangleGame.background.src = "images/board.png";
	
	setupCurrentLevel();
	updateLevelProgress();
	
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
	
	// we move the target dragging circle when the mouse is moving
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
		updateLevelProgress();
	});
	
	// We clear the dragging circle data when mouse is up
	$("#game").mouseup(function(e) {
		untangleGame.targetCircle = undefined;
		
		// on every mouse up check if the untangle puzzle is solved.
		checkLevelCompleteness();
	});
});

function connectCircles() {
	// setup all lines based on the circles relationship
	var level = untangleGame.levels[untangleGame.currentLevel];
	untangleGame.lines.length = 0;
	for (var i in level.relationship) {
		var connectedPoints = level.relationship[i].connectedPoints;
		var startPoint = untangleGame.circles[i];
		for (var j in connectedPoints) {
			var endPoint = untangleGame.circles[connectedPoints[j]];
			untangleGame.lines.push(new Line(startPoint, endPoint));
		}
	}
}

function updateLineIntersection() {
	// checking lines intersection and bold those lines.
	for (var i=0;i<untangleGame.lines.length;i++) {
		var line1 = untangleGame.lines[i];
		line1.thickness = untangleGame.thinLineThickness;
		for (var j=0;j<i;j++) {
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

function updateLevelProgress() {
	// check the untangle progress of the level
	var progress = 0;
	for (var i=0;i<untangleGame.lines.length;i++) {
		if (untangleGame.lines[i].thickness == untangleGame.thinLineThickness) {
			progress++;
		}
	}
	untangleGame.progressPercentage = Math.floor(progress/untangleGame.lines.length*100);
	$("#progress").html(untangleGame.progressPercentage);
	
	// display the current level
	$("#level").html(untangleGame.currentLevel);
}

function gameloop() {
	// get the references of the canvas element and the drawing context.
	var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');
	
	// clear the canvas before re-drawing.
	clear(ctx);
	
	// draw the image background
	ctx.drawImage(untangleGame.background, 0, 0);
	
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
	
	// draw the title text
	ctx.font = "26px 'Rock Salt'";
	ctx.textAlign = "center";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Untangle Game", ctx.canvas.width/2, 50);
	
	// draw the level progress text
	ctx.textAlign = "left";
	ctx.textBaseline = "buttom";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Puzzle " + untangleGame.currentLevel + ", Completeness: "
			+ untangleGame.progressPercentage + "%", 60, ctx.canvas.height-80);
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
