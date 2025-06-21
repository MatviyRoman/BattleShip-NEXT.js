'use client';
import { useState, useEffect, useRef } from "react";

// Board and ship types
const BOARD_SIZE = 10;
const SHIPS = [
  { name: "Super Carrier", size: 6 }, // 6-deck
  { name: "Carrier", size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Submarine", size: 3 },
  { name: "Destroyer", size: 2 },
  { name: "Patrol Boat", size: 1 }, // single-deck
];

type Cell = {
  hasShip: boolean;
  isPlaced: boolean;
  isHit: boolean;
  isMiss: boolean;
};

type ShipPlacement = {
  name: string;
  size: number;
  placed: boolean;
};

type GameMode = 'bot' | 'human';

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ hasShip: false, isPlaced: false, isHit: false, isMiss: false }))
  );
}

// Confetti component
function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const confettiCount = 150;
    const confetti: {x:number,y:number,r:number,d:number,color:string, tilt:number, tiltAngleIncremental:number, tiltAngle:number}[] = [];
    const colors = ["#fde68a","#f87171","#60a5fa","#34d399","#f472b6","#facc15","#a78bfa"];
    for(let i=0;i<confettiCount;i++){
      confetti.push({
        x:Math.random()*W,
        y:Math.random()*H-H,
        r:Math.random()*6+4,
        d:Math.random()*confettiCount,
        color:colors[Math.floor(Math.random()*colors.length)],
        tilt:Math.floor(Math.random()*10)-10,
        tiltAngleIncremental:(Math.random()*0.07)+.05,
        tiltAngle:0
      });
    }
    let angle = 0;
    let animationFrameId:number;
    function draw(){
      if (!ctx) return;
      ctx.clearRect(0,0,W,H);
      angle+=0.01;
      for(let i=0;i<confettiCount;i++){
        const c=confetti[i]; // changed let to const to fix prefer-const
        c.tiltAngle+=c.tiltAngleIncremental;
        c.y+= (Math.cos(angle+c.d)+3+c.r/2)/2;
        c.x+= Math.sin(angle);
        c.tilt=Math.sin(c.tiltAngle- (i%3)) * 15;
        ctx.beginPath();
        ctx.lineWidth = c.r;
        ctx.strokeStyle = c.color;
        ctx.moveTo(c.x+c.tilt+5,c.y);
        ctx.lineTo(c.x,c.y+c.tilt+5);
        ctx.stroke();
      }
      animationFrameId=requestAnimationFrame(draw);
    }
    draw();
    return ()=>cancelAnimationFrame(animationFrameId);
  },[]);
  return <canvas ref={ref} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',pointerEvents:'none',zIndex:1000}} />;
}

export default function Home() {
  // Player and opponent boards
  const [playerBoard, setPlayerBoard] = useState<Cell[][]>(createEmptyBoard());
  const [opponentBoard, setOpponentBoard] = useState<Cell[][]>(createEmptyBoard());
  const [ships, setShips] = useState<ShipPlacement[]>(
    SHIPS.map((ship) => ({ ...ship, placed: false }))
  );
  const [selectedShip, setSelectedShip] = useState<ShipPlacement | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [phase, setPhase] = useState<'placement' | 'attack' | 'gameover'>('placement');
  const [playerTurn, setPlayerTurn] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [gameMode, setGameMode] = useState<GameMode>('bot');
  const [waitingForHuman, setWaitingForHuman] = useState(false);
  // End effect state for win/lose
  const [endEffect, setEndEffect] = useState<{ type: 'win' | 'lose'; visible: boolean } | null>(null);

  // Check if ship can be placed without adjacency
  function canPlaceShip(board: Cell[][], row: number, col: number, size: number, isVertical: boolean): boolean {
    for (let i = 0; i < size; i++) {
      const r = row + (isVertical ? i : 0);
      const c = col + (isVertical ? 0 : i);
      if (r >= BOARD_SIZE || c >= BOARD_SIZE || board[r][c].hasShip) { return false; }
      // Check adjacent cells
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc].hasShip && !(nr === r && nc === c)) { return false; }
        }
      }
    }
    return true;
  }

  // Place ship on player's board
  const handleCellClick = (row: number, col: number) => {
    if (phase !== 'placement' || !selectedShip || selectedShip.placed) return;
    if (!canPlaceShip(playerBoard, row, col, selectedShip.size, isVertical)) return;
    // Place ship
    const newBoard = playerBoard.map((row) => row.map((cell) => ({ ...cell })));
    for (let i = 0; i < selectedShip.size; i++) {
      const r = row + (isVertical ? i : 0);
      const c = col + (isVertical ? 0 : i);
      newBoard[r][c].hasShip = true;
      newBoard[r][c].isPlaced = true;
    }
    setPlayerBoard(newBoard);
    setShips((prev) =>
      prev.map((ship) =>
        ship.name === selectedShip.name ? { ...ship, placed: true } : ship
      )
    );
    setSelectedShip(null);
  };

  // Randomly place ships for opponent (no adjacent ships)
  function canPlaceShipNoAdj(board: Cell[][], row: number, col: number, size: number, isVertical: boolean): boolean {
    for (let i = 0; i < size; i++) {
      const r = row + (isVertical ? i : 0);
      const c = col + (isVertical ? 0 : i);
      if (r >= BOARD_SIZE || c >= BOARD_SIZE || board[r][c].hasShip) { return false; }
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc].hasShip && !(nr === r && nc === c)) { return false; }
        }
      }
    }
    return true;
  }

  // Randomly place ships for opponent
  useEffect(() => {
    if (phase === 'placement') {
      const newBoard = createEmptyBoard();
      SHIPS.forEach((ship) => { // removed idx to fix unused variable error
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 1000) {
          const vertical = Math.random() < 0.5;
          const row = Math.floor(Math.random() * (vertical ? BOARD_SIZE - ship.size + 1 : BOARD_SIZE));
          const col = Math.floor(Math.random() * (vertical ? BOARD_SIZE : BOARD_SIZE - ship.size + 1));
          if (canPlaceShipNoAdj(newBoard, row, col, ship.size, vertical)) {
            for (let i = 0; i < ship.size; i++) {
              const r = row + (vertical ? i : 0);
              const c = col + (vertical ? 0 : i);
              newBoard[r][c].hasShip = true;
              newBoard[r][c].isPlaced = true;
            }
            placed = true;
          }
          attempts++;
        }
      });
      setOpponentBoard(newBoard);
    }
  }, [phase]);

  // Start attack phase when all ships placed
  useEffect(() => {
    if (phase === 'placement' && ships.every((s) => s.placed)) {
      setPhase('attack');
      setMessage('Attack the enemy board!');
    }
  }, [ships, phase]);

  // Handle attack (bot/human mode)
  const handleAttack = (row: number, col: number) => {
    if (phase !== 'attack' || !playerTurn) return;
    if (gameMode === 'bot') {
      const cell = opponentBoard[row][col];
      if (cell.isHit || cell.isMiss) return;
      const newBoard = opponentBoard.map((row) => row.map((cell) => ({ ...cell })));
      if (cell.hasShip) {
        newBoard[row][col].isHit = true;
        setMessage('Hit!');
      } else {
        newBoard[row][col].isMiss = true;
        setMessage('Miss!');
      }
      setOpponentBoard(newBoard);
      setPlayerTurn(false);
      setTimeout(() => opponentMove(), 1000);
    } else {
      // Human mode: alternate turns
      const cell = opponentBoard[row][col];
      if (cell.isHit || cell.isMiss) return;
      const newBoard = opponentBoard.map((row) => row.map((cell) => ({ ...cell })));
      if (cell.hasShip) {
        newBoard[row][col].isHit = true;
        setMessage('Hit! Now let your opponent play.');
      } else {
        newBoard[row][col].isMiss = true;
        setMessage('Miss! Now let your opponent play.');
      }
      setOpponentBoard(newBoard);
      setPlayerTurn(false);
      setWaitingForHuman(true);
    }
  };

  // Simple opponent move (random attack)
  const opponentMove = () => {
    let r = 0, c = 0;
    let found = false;
    while (!found) {
      r = Math.floor(Math.random() * BOARD_SIZE);
      c = Math.floor(Math.random() * BOARD_SIZE);
      if (
        typeof r === 'number' && typeof c === 'number' &&
        !playerBoard[r][c].isHit && !playerBoard[r][c].isMiss
      ) {
        found = true;
      }
    }
    const newBoard = playerBoard.map((row) => row.map((cell) => ({ ...cell })));
    if (typeof r === 'number' && typeof c === 'number') {
      if (playerBoard[r][c].hasShip) {
        newBoard[r][c].isHit = true;
        setMessage('Opponent hit your ship!');
      } else {
        newBoard[r][c].isMiss = true;
        setMessage('Opponent missed!');
      }
      setPlayerBoard(newBoard);
      setPlayerTurn(true);
    }
  };

  // For human mode: allow switching turn
  const nextHumanTurn = () => {
    setPlayerTurn(true);
    setWaitingForHuman(false);
    setMessage('Your turn!');
  };

  // Check for win/lose
  useEffect(() => {
    if (phase === 'attack') {
      const playerLost = playerBoard.flat().filter((c) => c.hasShip && !c.isHit).length === 0;
      const opponentLost = opponentBoard.flat().filter((c) => c.hasShip && !c.isHit).length === 0;
      if (playerLost) {
        setPhase('gameover');
        setMessage('You lost!');
      } else if (opponentLost) {
        setPhase('gameover');
        setMessage('You win!');
      }
    }
  }, [playerBoard, opponentBoard, phase]);

  // Win/lose effect with timer and manual close
  useEffect(() => {
    if (phase === 'gameover') {
      if (message === 'You win!') {
        setEndEffect({ type: 'win', visible: true });
        const timeout = setTimeout(() => setEndEffect((e) => e && { ...e, visible: false }), 4000);
        return () => clearTimeout(timeout);
      } else if (message === 'You lost!') {
        setEndEffect({ type: 'lose', visible: true });
        const timeout = setTimeout(() => setEndEffect((e) => e && { ...e, visible: false }), 4000);
        return () => clearTimeout(timeout);
      }
    }
  }, [phase, message]);

  // Manual close for end effect
  const handleCloseEndEffect = () => {
    setEndEffect((e) => e && { ...e, visible: false });
  };

  // Reset game
  const resetGame = () => {
    setPlayerBoard(createEmptyBoard());
    setOpponentBoard(createEmptyBoard());
    setShips(SHIPS.map((ship) => ({ ...ship, placed: false })));
    setSelectedShip(null);
    setIsVertical(false);
    setPhase('placement');
    setPlayerTurn(true);
    setMessage('');
  };

  // Total decks left
  const playerTotalLeft = playerBoard.flat().filter(cell => cell.hasShip && !cell.isHit).length;
  const opponentTotalLeft = opponentBoard.flat().filter(cell => cell.hasShip && !cell.isHit).length;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Confetti and message for win/lose */}
      {endEffect && endEffect.visible && (
        <>
          <Confetti />
          <div
            className="fixed inset-0 flex items-center justify-center z-[1001] bg-black/40 cursor-pointer"
            onClick={handleCloseEndEffect}
            tabIndex={-1}
            aria-label="Close effect"
          >
            <div
              className={`relative text-5xl font-extrabold drop-shadow-lg animate-bounce bg-black/70 px-8 py-6 rounded-xl border-4 ${endEffect.type === 'win' ? 'text-yellow-400 border-yellow-300' : 'text-red-400 border-red-300'}`}
              onClick={e => e.stopPropagation()}
            >
              {endEffect.type === 'win' ? 'YOU WIN!' : 'YOU LOSE!'}
              <button
                className="absolute top-2 right-2 text-2xl text-white hover:text-gray-300 focus:outline-none"
                onClick={handleCloseEndEffect}
                aria-label="Close effect"
                tabIndex={0}
              >
                ×
              </button>
            </div>
          </div>
        </>
      )}
      <h1 className="text-3xl font-bold mb-2">Battleship</h1>
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded border font-medium transition-colors ${gameMode === 'bot' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-100'}`}
          onClick={() => { setGameMode('bot'); resetGame(); }}
        >
          Play vs Bot
        </button>
        {/* <button
          className={`px-4 py-2 rounded border font-medium transition-colors ${gameMode === 'human' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-100'}`}
          onClick={() => { setGameMode('human'); resetGame(); }}
        >
          Play vs Human
        </button> */}
      </div>
      <div className="mb-2 text-lg font-semibold text-center text-blue-700">{message}</div>
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Opponent Board */}
        <div>
          <div className="mb-2 text-lg font-semibold text-center">Opponent Board</div>
          <div className="mb-2 text-base text-center text-blue-800 font-bold">
            Decks left: {opponentTotalLeft}
          </div>
          <div className="grid grid-cols-10 gap-1 bg-blue-200 p-2 rounded shadow">
            {opponentBoard.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <button
                  key={`o-${rIdx}-${cIdx}`}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded border border-blue-400 flex items-center justify-center transition-colors
                    ${cell.isHit ? "bg-red-600" : cell.isMiss ? "bg-gray-300" : "bg-white hover:bg-blue-100"}
                    ${phase !== 'attack' || !playerTurn || cell.isHit || cell.isMiss ? "cursor-not-allowed" : "cursor-pointer"}
                  `}
                  onClick={() => handleAttack(rIdx, cIdx)}
                  disabled={phase !== 'attack' || !playerTurn || cell.isHit || cell.isMiss}
                  aria-label={`Opponent Cell ${rIdx + 1}, ${cIdx + 1}`}
                >
                  {cell.isHit ? "✖" : cell.isMiss ? "•" : ""}
                </button>
              ))
            )}
          </div>
        </div>
        {/* Player Board */}
        <div>
          <div className="mb-2 text-lg font-semibold text-center">Your Board</div>
          <div className="mb-2 text-base text-center text-blue-800 font-bold">
            Decks left: {playerTotalLeft}
          </div>
          <div className="grid grid-cols-10 gap-1 bg-blue-200 p-2 rounded shadow">
            {playerBoard.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <button
                  key={`p-${rIdx}-${cIdx}`}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded border border-blue-400 flex items-center justify-center transition-colors
                    ${cell.hasShip ? (cell.isHit ? "bg-red-600" : "bg-blue-600") : cell.isMiss ? "bg-gray-300" : "bg-white hover:bg-blue-100"}
                    ${cell.isPlaced && phase === 'placement' ? "cursor-not-allowed" : "cursor-pointer"}
                  `}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  disabled={cell.isPlaced && phase === 'placement'}
                  aria-label={`Cell ${rIdx + 1}, ${cIdx + 1}`}
                >
                  {cell.isHit ? "✖" : cell.isMiss ? "•" : ""}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ship selection */}
        {phase === 'placement' && (
          <div className="flex flex-col gap-4 items-center">
            <div className="text-lg font-semibold">Place Your Ships</div>
            <div className="flex flex-col gap-2">
              {ships.map((ship) => (
                <button
                  key={ship.name}
                  className={`px-4 py-2 rounded border font-medium transition-colors
                    ${ship.placed ? "bg-gray-300 text-gray-500 cursor-not-allowed" :
                      selectedShip?.name === ship.name ? "bg-blue-500 text-white" : "bg-white hover:bg-blue-100"}
                  `}
                  onClick={() => setSelectedShip(ship)}
                  disabled={ship.placed}
                >
                  {ship.name} ({ship.size})
                </button>
              ))}
            </div>
            <button
              className="mt-4 px-3 py-1 rounded border bg-white hover:bg-blue-100"
              onClick={() => setIsVertical((v) => !v)}
            >
              Orientation: {isVertical ? "Vertical" : "Horizontal"}
            </button>
          </div>
        )}
      </div>
      {gameMode === 'human' && waitingForHuman && (
        <button
          className="mt-4 px-6 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
          onClick={nextHumanTurn}
        >
          Pass
        </button>
      )}
      {phase === 'gameover' && (
        <button
          className="mt-6 px-6 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
          onClick={resetGame}
        >
          Restart Game
        </button>
      )}
    </div>
  );
}
