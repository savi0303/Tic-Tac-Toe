const { useState, useEffect } = React;

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('ticTacToeScores');
    return saved ? JSON.parse(saved) : { x: 0, o: 0, draws: 0 };
  });
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (currentBoard) => {
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    return currentBoard.every(cell => cell !== null) ? 'draw' : null;
  };

  const minimax = (newBoard, depth, isMaximizing) => {
    const result = checkWinner(newBoard);
    if (result === 'O') return { score: 10 - depth };
    if (result === 'X') return { score: depth - 10 };
    if (result === 'draw') return { score: 0 };

    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove;
      for (let i = 0; i < newBoard.length; i++) {
        if (!newBoard[i]) {
          newBoard[i] = 'O';
          const { score } = minimax(newBoard, depth + 1, false);
          newBoard[i] = null;
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      return { score: bestScore, move: bestMove };
    } else {
      let bestScore = Infinity;
      let bestMove;
      for (let i = 0; i < newBoard.length; i++) {
        if (!newBoard[i]) {
          newBoard[i] = 'X';
          const { score } = minimax(newBoard, depth + 1, true);
          newBoard[i] = null;
          if (score < bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      return { score: bestScore, move: bestMove };
    }
  };

  const playWinSound = () => {
    const sound = new Audio('https://www.soundjay.com/misc/sounds/cheer-1.mp3');
    sound.play().catch(() => {});
  };

  const handleClick = (index) => {
    if (board[index] || winner || (!isPlayerTurn && isSinglePlayer)) return;

    const newBoard = [...board];
    newBoard[index] = isSinglePlayer ? 'X' : isPlayerTurn ? 'X' : 'O';
    setBoard(newBoard);
    setHistory([...history, { player: isSinglePlayer ? 'X' : isPlayerTurn ? 'X' : 'O', index }]);
    setIsPlayerTurn(!isPlayerTurn);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      updateScores(result);
      playWinSound();
    }
  };

  const aiMove = () => {
    const { move } = minimax([...board], 0, true);
    if (move !== undefined) {
      const newBoard = [...board];
      newBoard[move] = 'O';
      setBoard(newBoard);
      setHistory([...history, { player: 'O', index: move }]);
      setIsPlayerTurn(true);

      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result);
        updateScores(result);
        playWinSound();
      }
    }
  };

  const updateScores = (result) => {
    setScores(prev => {
      const newScores = {
        x: result === 'X' ? prev.x + 1 : prev.x,
        o: result === 'O' ? prev.o + 1 : prev.o,
        draws: result === 'draw' ? prev.draws + 1 : prev.draws
      };
      localStorage.setItem('ticTacToeScores', JSON.stringify(newScores));
      return newScores;
    });
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setHistory([]);
  };

  const undoMove = () => {
    if (!isSinglePlayer || !isPlayerTurn || history.length === 0 || winner) return;
    const lastMove = history[history.length - 1];
    const newBoard = [...board];
    newBoard[lastMove.index] = null;
    setBoard(newBoard);
    setHistory(history.slice(0, -1));
  };

  const toggleMode = () => {
    setIsSinglePlayer(!isSinglePlayer);
    resetGame();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const resetScores = () => {
    setScores({ x: 0, o: 0, draws: 0 });
    localStorage.removeItem('ticTacToeScores');
  };

  useEffect(() => {
    if (isSinglePlayer && !isPlayerTurn && !winner) {
      setTimeout(aiMove, 500);
    }
  }, [isPlayerTurn, winner, isSinglePlayer]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-100 to-gray-100'}`}>
      <div className="container mx-auto p-4 flex flex-col items-center">
        <div className="flex justify-between w-full max-w-md mb-4">
          <h1 className="text-3xl font-bold">Tic-Tac-Toe</h1>
          <button
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={toggleTheme}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <div className="flex flex-col md:flex-row w-full max-w-4xl gap-8">
          <div className="flex-1">
            <div className="mb-4 flex gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={toggleMode}
              >
                {isSinglePlayer ? 'Switch to Multiplayer' : 'Switch to Single Player'}
              </button>
              {isSinglePlayer && (
                <button
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  onClick={undoMove}
                  disabled={history.length === 0 || !isPlayerTurn || winner}
                >
                  Undo Move
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 w-80 h-80 bg-gray-300 dark:bg-gray-800 p-3 rounded-lg shadow-lg mx-auto">
              {board.map((cell, index) => (
                <div
                  key={index}
                  className={`cell w-full h-full flex items-center justify-center text-4xl cursor-pointer ${cell ? cell.toLowerCase() : ''}`}
                  onClick={() => handleClick(index)}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                onClick={resetGame}
              >
                New Game
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Scoreboard</h2>
              <p>X Wins: {scores.x}</p>
              <p>O Wins: {scores.o}</p>
              <p>Draws: {scores.draws}</p>
              <button
                className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={resetScores}
              >
                Reset Scores
              </button>
            </div>
            <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Game History</h2>
              <ul className="max-h-40 overflow-y-auto">
                {history.map((move, idx) => (
                  <li key={idx} className="text-sm">
                    {move.player} placed at position {move.index + 1}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {winner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="modal bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
              <h2 className="text-2xl font-bold mb-4">
                {winner === 'draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
              </h2>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={resetGame}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<TicTacToe />, document.getElementById('root'));