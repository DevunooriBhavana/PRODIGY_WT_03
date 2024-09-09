let currentPlayer = 'X';
let boardState = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;
let twoPlayerMode = true; // Default to 2 players
let difficulty = 'easy'; // Default difficulty level
let playerScore = 0;
let computerScore = 0;

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

document.querySelectorAll('input[name="mode"]').forEach(input => {
  input.addEventListener('change', handleModeChange);
});

function handleModeChange() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const difficultySelect = document.getElementById('difficulty');
  
  if (mode === 'vs-computer') {
    difficultySelect.style.display = 'inline-block';
  } else {
    difficultySelect.style.display = 'none';
  }
}

function startGame() {
  resetBoard();
  gameActive = true;
  twoPlayerMode = document.querySelector('input[name="mode"]:checked').value === '2-player';
  difficulty = document.getElementById('difficulty').value;
  document.getElementById('status').innerText = `Player ${currentPlayer}'s turn`;
  document.querySelector('.options').style.display = 'none';
  document.getElementById('board').style.display = 'grid';
  document.getElementById('scoreboard').style.display = twoPlayerMode ? 'none' : 'block'; // Show scoreboard only in vs-computer mode
}

function resetBoard() {
  boardState = ['', '', '', '', '', '', '', '', ''];
  document.querySelectorAll('.cell').forEach(cell => {
    cell.innerText = '';
    cell.style.backgroundColor = '#2e2e2e';
    cell.classList.remove('X', 'O', 'glow');
  });
  currentPlayer = 'X';
  gameActive = false;
  document.getElementById('status').innerText = `Player X's turn`;
  document.querySelector('.options').style.display = 'flex';
  document.getElementById('buttons').style.display = 'none'; // Ensure buttons are hidden on reset
}

function cellClicked(index) {
  if (!gameActive || boardState[index] !== '') return;

  boardState[index] = currentPlayer;
  const cell = document.getElementsByClassName('cell')[index];
  cell.innerText = currentPlayer;
  cell.classList.add(currentPlayer);

  const winResult = checkWin();
  if (winResult) {
    highlightWinningCells(winResult.combination);
    if (currentPlayer === 'X') {
      document.getElementById('status').innerText = twoPlayerMode 
        ? 'Player 1 wins!'
        : 'You win!';
      if (!twoPlayerMode) {
        playerScore++;
        document.getElementById('player-score').innerText = playerScore;
      }
    } else {
      document.getElementById('status').innerText = twoPlayerMode
        ? 'Player 2 wins!'
        : 'You lose!';
      if (!twoPlayerMode) {
        computerScore++;
        document.getElementById('computer-score').innerText = computerScore;
      }
    }
    gameActive = false;
    document.getElementById('buttons').style.display = 'flex'; // Show buttons
    return;
  }

  if (checkDraw()) {
    document.getElementById('status').innerText = 'It\'s a draw!';
    gameActive = false;
    document.getElementById('buttons').style.display = 'flex'; // Show buttons
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  document.getElementById('status').innerText = `Player ${currentPlayer}'s turn`;

  if (!twoPlayerMode && currentPlayer === 'O' && gameActive) {
    computerMove();
  }
}

function checkWin() {
  for (let condition of winningConditions) {
    let [a, b, c] = condition;
    if (boardState[a] !== '' && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return { winner: boardState[a], combination: condition };
    }
  }
  return null;
}

function checkDraw() {
  return boardState.every(cell => cell !== '');
}

function highlightWinningCells(cells) {
  cells.forEach(index => {
    const cell = document.getElementsByClassName('cell')[index];
    cell.classList.add('glow');
  });
}

function computerMove() {
  switch (difficulty) {
    case 'easy':
      makeEasyMove();
      break;
    case 'hard':
      makeHardMove();
      break;
    case 'extremely-hard':
      makeExtremelyHardMove();
      break;
    default:
      makeEasyMove(); // Default to easy mode
      break;
  }
}

function makeEasyMove() {
  let availableCells = boardState.reduce((acc, cell, index) => {
    if (cell === '') acc.push(index);
    return acc;
  }, []);

  let randomIndex = Math.floor(Math.random() * availableCells.length);
  let moveIndex = availableCells[randomIndex];

  performComputerMove(moveIndex);
}

function makeHardMove() {
  makeEasyMove(); // Placeholder for actual hard move logic
}

function makeExtremelyHardMove() {
  // Use Minimax algorithm to determine best move
  let bestMove = getBestMove();
  performComputerMove(bestMove);
}

function performComputerMove(moveIndex) {
  setTimeout(() => {
    cellClicked(moveIndex);

    // Check if computer wins after making its move
    if (checkWin()) {
      if (!twoPlayerMode) {
        document.getElementById('status').innerText = 'You lose!';
      }
      gameActive = false;
      document.getElementById('buttons').style.display = 'flex'; // Show buttons
    }
  }, 500); // Delay for a better user experience (imitating "thinking")
}

function rematch() {
  resetBoard();
  startGame(); // Start a new game with current settings
}

function exit() {
  resetBoard();
  document.getElementById('board').style.display = 'none'; // Hide game board
  document.getElementById('buttons').style.display = 'none'; // Hide buttons
  document.querySelector('.options').style.display = 'flex'; // Show initial options
}

function getBestMove() {
  // Minimax algorithm implementation
  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === '') {
      boardState[i] = 'O'; // Assume AI's move
      let score = minimax(boardState, 0, false);
      boardState[i] = ''; // Undo move

      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing) {
  if (checkWin()) {
    return isMaximizing ? -1 : 1; // Human wins (-1), AI wins (1)
  } else if (checkDraw()) {
    return 0; // Draw
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'O'; // Assume AI's move
        let score = minimax(board, depth + 1, false);
        board[i] = ''; // Undo move
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'X'; // Assume human's move
        let score = minimax(board, depth + 1, true);
        board[i] = ''; // Undo move
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}