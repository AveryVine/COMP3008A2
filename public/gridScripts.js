var grid;

$(document).ready(function() {
    grid = new Sortable(sortablelist, {
        swap: true,
	    swapClass: 'highlight',
        animation: 150,
        forceFallback: true
    });
});

function readGrid() {
    return $(".grid-square").text();
}

function renderGridSolution(password) {
    prepareGrid(true);

    var gridSquares = $(".grid-square");
    for (var i = 0; i < password.indices.length; i++) {
        index = password.indices[i];
        emoji = password.chosenEmoji[i];
        $(gridSquares[index]).text(emoji);
        $(gridSquares[index]).addClass("highlight");
    }
}

function renderGrid(emoji) {
    prepareGrid(false);

    var gridSquares = $(".grid-square");
    shuffle(emoji);
    for (var i = 0; i < emoji.length; i++) {
        $(gridSquares[i]).text(emoji[i]);
    }
}

function prepareGrid(disabled) {
    grid.option("disabled", disabled);

    var gridSquares = $(".grid-square");
    gridSquares.removeClass("highlight");
    gridSquares.text("");

    if (disabled) {
        gridSquares.removeClass("draggable");
    } else {
        gridSquares.addClass("draggable");
    }
}

function disableGrid() {
    grid.option("disabled", true);
    $(".grid-square").removeClass("draggable");
}

function shuffle(array) {
	var currentIndex = array.length;
	var temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}
