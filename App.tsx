import React, { useState, useEffect } from 'react';
import GameScene from './components/GameScene';
import { GameState, GameStore } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  // Add a key to force re-mounting of the game scene component on restart
  const [gameId, setGameId] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('jump_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const handleScore = () => {
    setScore(s => s + 1);
  };

  const handleGameOver = () => {
    setGameState(GameState.GAME_OVER);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('jump_highscore', score.toString());
    }
  };

  const startGame = () => {
    setScore(0);
    setGameState(GameState.PLAYING);
    // Increment gameId to trigger a complete reset of the 3D scene (new refs, new state)
    setGameId(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden font-sans select-none">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <GameScene 
          key={gameId}
          gameState={gameState} 
          onScore={handleScore} 
          onGameOver={handleGameOver} 
        />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* HUD */}
        {gameState === GameState.PLAYING && (
          <div className="absolute top-10 left-0 right-0 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg border border-slate-200">
              <h1 className="text-4xl font-bold text-slate-800">{score}</h1>
            </div>
          </div>
        )}

        {/* Start Screen */}
        {gameState === GameState.MENU && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-auto">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4 transform transition-all animate-bounce-in">
              <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Jump Jump</h1>
              <p className="text-slate-500 mb-8">Hold to charge, release to jump!</p>
              
              <div className="mb-6">
                <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">High Score</div>
                <div className="text-3xl font-bold text-blue-600">{highScore}</div>
              </div>

              <button 
                onClick={startGame}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-transform active:scale-95 shadow-blue-500/50 shadow-lg text-lg"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">You Fell!</h2>
              
              <div className="flex justify-center items-end space-x-2 mb-8">
                <div className="text-6xl font-black text-slate-900">{score}</div>
                <div className="text-xl text-slate-500 pb-2">pts</div>
              </div>

              {score >= highScore && score > 0 && (
                <div className="mb-6 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold border border-yellow-200">
                  New High Score! 🏆
                </div>
              )}

              <button 
                onClick={startGame}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-transform active:scale-95 shadow-lg text-lg flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Help Hint */}
        {gameState === GameState.PLAYING && score === 0 && (
          <div className="absolute bottom-20 left-0 right-0 text-center animate-pulse">
            <p className="text-slate-500 font-medium bg-white/70 inline-block px-4 py-2 rounded-full shadow-sm">
              Press and hold screen to charge
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;