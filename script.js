const { useState, useEffect } = React;

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  const [scores, setScores] = useState({ x: 0, o: 0, draws: 0 });
  const [winner, setWinner] = useState(null);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
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

  const handleClick = (index) => {
    if (board[index] || winner || (!isPlayerTurn && isSinglePlayer)) return;

    const newBoard = [...board];
    newBoard[index] = isSinglePlayer ? 'X' : isPlayerTurn ? 'X' : 'O';
    setBoard(newBoard);
    setIsPlayerTurn(!isPlayerTurn);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      updateScores(result);
    }
  };

  const aiMove = () => {
    const emptyCells = board.reduce((acc, cell, idx) => {
      if (!cell) acc.push(idx);
      return acc;
    }, []);
    if (emptyCells.length === 0) return;

    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = [...board];
    newBoard[randomIndex] = 'O';
    setBoard(newBoard);
    setIsPlayerTurn(true);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      updateScores(result);
    }
  };

  const updateScores = (result) => {
    setScores(prev => ({
      x: result === 'X' ? prev.x + 1 : prev.x,
      o: result === 'O' ? prev.o + 1 : prev.o,
      draws: result === 'draw' ? prev.draws + 1 : prev.draws
    }));
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };

  useEffect(() => {
    if (isSinglePlayer && !isPlayerTurn && !winner) {
      setTimeout(aiMove, 500);
    }
  }, [isPlayerTurn, winner, isSinglePlayer]);

  const toggleMode = () => {
    setIsSinglePlayer(!isSinglePlayer);
    resetGame();
    setScores({ x: 0, o: 0, draws: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Tic-Tac-Toe</h1>
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={toggleMode}
        >
          {isSinglePlayer ? 'Switch to Multiplayer' : 'Switch to Single Player'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 w-80 h-80 bg-gray-200 p-2">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`cell w-full h-full bg-white flex items-center justify-center text-4xl cursor-pointer ${cell ? cell.toLowerCase() : ''}`}
            onClick={() => handleClick(index)}
          />
        ))}
      </div>
      {winner && (
        <div className="mt-4 text-2xl">
          {winner === 'draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
        </div>
      )}
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={resetGame}
      >
        Reset Game
      </button>
      <div className="mt-4 text-lg">
        <p>X Wins: {scores.x}</p>
        <p>O Wins: {scores.o}</p>
        <p>Draws: {scores.draws}</p>
      </div>
    </div>
  );
};

ReactDOM.render(<TicTacToe />, document.getElementById('root'));