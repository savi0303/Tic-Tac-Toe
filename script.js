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
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
        {/* Header with logo and theme toggle */}
        <div className="flex justify-between items-center w-full max-w-4xl mb-8 px-4">
          <h1 className="text-4xl font-bold flex items-center">
            <span className="mr-2">Tic-Tac-Toe</span>
            <span className="text-blue-500 dark:text-blue-400 text-lg font-normal">Pro</span>
          </h1>
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 flex items-center"
            onClick={toggleTheme}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row w-full max-w-4xl gap-8 px-4">
          {/* Game section */}
          <div className="flex-1 flex flex-col items-center">
            {/* Game control buttons */}
            <div className="mb-6 flex gap-3 w-full max-w-md justify-center">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex-1"
                onClick={toggleMode}
              >
                {isSinglePlayer ? 'Multiplayer Mode' : 'Single Player Mode'}
              </button>
              {isSinglePlayer && (
                <button
                  className={`px-4 py-2 rounded-lg shadow-md transition duration-200 flex-1 ${
                    history.length === 0 || !isPlayerTurn || winner 
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                  onClick={undoMove}
                  disabled={history.length === 0 || !isPlayerTurn || winner}
                >
                  Undo Move
                </button>
              )}
            </div>

            {/* Game board */}
            <div className="grid grid-cols-3 gap-3 w-80 h-80 bg-gray-300 dark:bg-gray-700 p-4 rounded-xl shadow-lg mb-6">
              {board.map((cell, index) => (
                <div
                  key={index}
                  className={`cell w-full h-full flex items-center justify-center text-5xl cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow transition-all duration-200 hover:shadow-md ${
                    !cell && !winner ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                  } ${cell ? cell.toLowerCase() : ''}`}
                  onClick={() => handleClick(index)}
                />
              ))}
            </div>

            {/* New game button */}
            <div className="flex justify-center">
              <button
                className="px-8 py-3 bg-green-600 text-white text-lg rounded-lg shadow-md hover:bg-green-700 transition duration-200"
                onClick={resetGame}
              >
                New Game
              </button>
            </div>
          </div>

          {/* Info panels */}
          <div className="flex-1 flex flex-col">
            {/* Current player indicator */}
            {!winner && (
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md text-gray-800 dark:text-white mb-5">
                <h2 className="text-xl font-semibold mb-3">Current Turn</h2>
                <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className={`text-4xl font-bold ${isPlayerTurn ? 'text-blue-500' : 'text-red-500'}`}>
                    {isPlayerTurn ? 'X' : 'O'}
                  </div>
                  <div className="ml-4 text-lg">
                    {isSinglePlayer 
                      ? (isPlayerTurn ? "Your Turn" : "Computer's Turn") 
                      : `Player ${isPlayerTurn ? '1' : '2'}'s Turn`}
                  </div>
                </div>
              </div>
            )}

            {/* Scoreboard */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md text-gray-800 dark:text-white mb-5">
              <h2 className="text-xl font-semibold mb-3">Scoreboard</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col items-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span className="text-lg mb-1">Player X</span>
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{scores.x}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-lg mb-1">Draws</span>
                  <span className="text-3xl font-bold text-gray-600 dark:text-gray-400">{scores.draws}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <span className="text-lg mb-1">Player O</span>
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">{scores.o}</span>
                </div>
              </div>
              <button
                className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                onClick={resetScores}
              >
                Reset Scores
              </button>
            </div>

            {/* Game History */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md text-gray-800 dark:text-white">
              <h2 className="text-xl font-semibold mb-3">Game History</h2>
              {history.length > 0 ? (
                <div className="max-h-48 overflow-y-auto scrollbar-thin pr-2">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-2 text-left">Move</th>
                        <th className="pb-2 text-left">Player</th>
                        <th className="pb-2 text-left">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((move, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2">{idx + 1}</td>
                          <td className={`py-2 font-medium ${move.player === 'X' ? 'text-blue-500' : 'text-red-500'}`}>
                            {move.player}
                          </td>
                          <td className="py-2">Position {move.index + 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No moves yet
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Winner modal */}
        {winner && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="modal bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center text-gray-800 dark:text-white">
              {winner === 'draw' ? (
                <>
                  <h2 className="text-3xl font-bold mb-4">It's a Draw!</h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">Good game! The board is full with no winner.</p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4">
                    {winner === 'X' ? 'Player X Wins!' : 'Player O Wins!'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {isSinglePlayer && winner === 'X' ? 'Congratulations on your victory!' : 
                     isSinglePlayer && winner === 'O' ? 'The computer has won this round!' : 
                     'Well played!'}
                  </p>
                </>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  onClick={resetGame}
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<TicTacToe />, document.getElementById('root'));