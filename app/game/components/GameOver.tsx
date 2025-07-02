import React from 'react';

interface GameOverProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export default function GameOver({ score, highScore, onRestart }: GameOverProps) {
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-600 text-center max-w-sm w-full mx-4">
        <h2 className="text-3xl font-bold text-red-400 mb-4">游戏结束</h2>
        
        <div className="mb-6 space-y-2">
          <div>
            <span className="text-gray-400">本局得分：</span>
            <span className="text-xl font-bold text-white ml-2">{score.toLocaleString()}</span>
          </div>
          
          {isNewRecord && (
            <div className="text-yellow-400 font-bold animate-pulse">
              🎉 新纪录！
            </div>
          )}
          
          <div>
            <span className="text-gray-400">最高分：</span>
            <span className="text-lg font-bold text-yellow-400 ml-2">{highScore.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
        >
          重新开始
        </button>
        
        <div className="mt-4 text-sm text-gray-400">
          按空格键也可以重新开始
        </div>
      </div>
    </div>
  );
} 