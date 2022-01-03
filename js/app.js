'use strict'

var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GAMER_IMG = '<img src="./img/gamer.png" />';
var BALL_IMG = '<img src="./img/ball.png" />';
var GLUE_IMG = '<img src="./img/glue1.jpg" />';

var gBoard;
var gGamerPos;
var gBallCollectCounter = 0;
var gNumOfBalls = 2;
var elBallCounter = document.querySelector('h2 span');
var gBallInterval;
var gGlueInterval;
var isGlued = false


function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBallCollectCounter = 0
	gNumOfBalls = 2
	isGlued = false
	gBoard = buildBoard();
	renderBoard(gBoard);
}

function restartGame() {
	initGame()
	var elReastart = document.querySelector('.restart');
	elReastart.classList.add('hide');

}


function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}
	// Place passages
	board[0][5].type = FLOOR;
	board[9][5].type = FLOOR;
	board[5][0].type = FLOOR;
	board[5][11].type = FLOOR;

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;
	gGlueInterval = setInterval(addGlue, 7000, board);
	gBallInterval = setInterval(addBall, 1500, board);

	return board;
}

// Render the board to an HTML table
function renderBoard(board) {
	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			} else if (currCell.gameElement === GLUE) {
				strHTML += GLUE_IMG;
			}
			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}


// Move the player to a specific location
function moveTo(i, j) {

	if (isGlued) return

	if (i === -1) {
		var targetCell = gBoard[9][j];
	} else if (i === 10) {
		var targetCell = gBoard[0][j];
	} else if (j === -1) {
		var targetCell = gBoard[i][11];
	} else if (j === 12) {
		var targetCell = gBoard[i][0];
	} else {
		var targetCell = gBoard[i][j];
	}
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			gBallCollectCounter++;
			elBallCounter.innerText = gBallCollectCounter;
			var audioBallEat = new Audio('sound/FOOTBALLKICK.wav');
			audioBallEat.play();
			gNumOfBalls--;
			if (gNumOfBalls === 0) {
				gameOver();
			}
		} else if (targetCell.gameElement === GLUE) {
			isGlued = true
			var audioGlue = new Audio('sound/GLUE.wav');
			audioGlue.play();
			setTimeout(function () {
				isGlued = false
			}, 3000);
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		if (gGamerPos.i === -1) {
			gGamerPos.i = 9;
		} else if (gGamerPos.i === 10) {
			gGamerPos.i = 0;
		} else if (gGamerPos.j === -1) {
			gGamerPos.j = 11;
		} else if (gGamerPos.j === 12) {
			gGamerPos.j = 0;
		}
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;
	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function addBall(board) {
	var i = getRandomIntInclusive(1, 8)
	var j = getRandomIntInclusive(1, 10)
	if (board[i][j].gameElement === null) {
		board[i][j].gameElement = BALL;
		gNumOfBalls++;
		renderBoard(board)
		//renderCell
	}
}

function gameOver() {
	clearInterval(gGlueInterval)
	clearInterval(gBallInterval);
	var elRestart = document.querySelector('.restart')
	elRestart.classList.remove('hide');
}

function addGlue(board) {
	var i = getRandomIntInclusive(1, 8)
	var j = getRandomIntInclusive(1, 10)
	if (board[i][j].gameElement === null) {
		board[i][j].gameElement = GLUE;
		renderBoard(board)
		setTimeout(function () {
			board[i][j].gameElement = null;
			//renderCell
		}, 3000);
	}
}