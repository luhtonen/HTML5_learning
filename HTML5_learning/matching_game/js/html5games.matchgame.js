var matchingGame = {};
matchingGame.deck = [
		'cardAK', 'cardAK',
		'cardAQ', 'cardAQ',
		'cardAJ', 'cardAJ',
		'cardBK', 'cardBK',
		'cardBQ', 'cardBQ',
		'cardBJ', 'cardBJ',
];
matchingGame.savingObject = {};
matchingGame.savingObject.deck = [];
matchingGame.savingObject.removedCards = [];
matchingGame.savingObject.currentElapsedTime = 0;

$(function(){
	matchingGame.deck.sort(shuffle);
	
	// re-create the saved deck
	var savedObject = savedSavingObject();
	if(savedObject != undefined) {
		matchingGame.deck = savedObject.deck;
	}
	
	// copying the deck into saving object.
	matchingGame.savingObject.deck = matchingGame.deck.slice();
	
	// clone 12 copies of the card
	for (var i=0;i<11;i++) {
		$(".card:first-child").clone().appendTo("#cards");
	}
	// initialize each card's position
	$("#cards").children().each(function(index){
		// align the cards to be 4x3 ourselves.
		$(this).css({
			"left" : ($(this).width()  + 20) * (index % 4),
			"top"  : ($(this).height() + 20) * Math.floor(index / 4)
		});
		// get a pattern from the shuffled deck
		var pattern = matchingGame.deck.pop();
		// visually apply the pattern on the card's back side.
		$(this).find(".back").addClass(pattern);
		// embed the pattern data into the DOM element.
		$(this).attr("data-pattern",pattern);
		// save the index into the DOM element, so we know which is the next card.
		$(this).attr("data-card-index",index);
		// listen the click event on each card DIV element.
		$(this).click(selectCard);
	});
	
	// remove cards that were removed in savedObject.
	if (savedObject != undefined) {
		matchingGame.savingObject.removedCards = savedObject.removedCards;
		// find those cards and remove them.
		for(var i in matchingGame.savingObject.removedCards) {
			$(".card[data-card-index="+ matchingGame.savingObject.removedCards[i]+"]").remove();
		}
	}
	// reset the elapsed time to 0.
	matchingGame.elapsedTime = 0;
	
	// restore the saved elapsed time
	if(savedObject != undefined) {
		matchingGame.elapsedTime = savedObject.currentElapsedTime;
		matchingGame.savingObject.currentElapsedTime = savedObject.currentElapsedTime;
	}
	// start the timer
	matchingGame.timer = setInterval(countTimer, 1000);
});

function countTimer() {
	matchingGame.elapsedTime++;
	
	// save the current elapsed time into savingObject.
	matchingGame.savingObject.currentElapsedTime = matchingGame.elapsedTime;
	
	// calculate the minutes and seconds from elapsed time
	var minute = pad(Math.floor(matchingGame.elapsedTime / 60));
	var second = pad(matchingGame.elapsedTime % 60);
	
	// display the elapsed time
	$("#elapsed-time").html(minute+":"+second);
	
	// save the game progress
	saveSavingObject();
}
function shuffle() {
	return 0.5 - Math.random();
}

function selectCard() {
	// we do nothing if there are already two card flipped.
	if ($(".card-flipped").size() > 1) {
		return;
	}
	$(this).addClass("card-flipped");
	// check the pattern of both flipped card 0.7s later.
	if ($(".card-flipped").size() == 2) {
		setTimeout(checkPattern,700);
	}
}

function checkPattern() {
	if(isMatchPattern()) {
		$(".card-flipped").removeClass("card-flipped").addClass("card-removed");
		$(".card-removed").bind("webkitTransitionEnd",removeTookCards);
	} else {
		$(".card-flipped").removeClass("card-flipped");
	}
}

function isMatchPattern() {
	var cards = $(".card-flipped");
	var pattern = $(cards[0]).data("pattern");
	var anotherPattern = $(cards[1]).data("pattern");
	return (pattern == anotherPattern);
}

function removeTookCards() {
	$(".card-removed").each(function(){
		matchingGame.savingObject.removedCards.push($(this).data("card-index"));
		$(this).remove();
	});
	
	// check if all cards are removed and show game over
	if ($(".card").length == 0) {
		gameover();
	}
}

function gameover() {
	// stop the timer
	clearInterval(matchingGame.timer);
	
	// set the score in the game over popup
	$(".score").html($("#elapsed-time").html());
	
	// load the saved last score and time from local storage
	var lastScore = localStorage.getItem("last-score");
	
	// check if there is no any saved record
	lastScoreObj = JSON.parse(lastScore);
	if (lastScoreObj == null) {
		// create an empty record if there is no any saved record
		lastScoreObj = {"savedTime": "no record", "score": 0};
	}
	var lastElapsedTime = lastScoreObj.score;
	
	if (lastElapsedTime == 0 || matchingGame.elapsedTime < lastElapsedTime) {
		$(".ribbon").removeClass("hide");
	}
	
	// convert the elapsed seconds into minute:second format
	// calculate the minutes and seconds from elapsed time
	var minute = pad(Math.floor(lastElapsedTime / 60));
	var second = pad(lastElapsedTime % 60);
	
	// display the last elapsed time in game over popup
	$(".last-score").html(minute+":"+second);
	
	// display the saved time of last score
	var savedTime = lastScoreObj.savedTime;
	$(".saved-time").html(savedTime);
	
	// get the current datetime
	var currentTime = new Date();
	var now = dateString(currentTime);
	
	// construct the object of datetime and game score
	var obj = { "savedTime": now, "score": matchingGame.elapsedTime};
	
	// save the score into local storage
	localStorage.setItem("last-score", JSON.stringify(obj));
	
	// show the game over popup
	$("#popup").removeClass("hide");
	
	// at last, we clear the saved savingObject
	localStorage.removeItem("savingObject");
}

function savedSavingObject() {
	// returns the saved saving object from the local storage.
	var savingObject = localStorage["savingObject"];
	if(savingObject != undefined) {
		savingObject = JSON.parse(savingObject);
	}
	return savingObject;
}

function saveSavingObject() {
	// save the encoded saving object into local storage
	localStorage["savingObject"] = JSON.stringify(matchingGame.savingObject);
}
function dateString(d) {
	return d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear() + " " + d.toLocaleTimeString();
}
function pad(n){
	return n<10 ? '0'+n : n;
}