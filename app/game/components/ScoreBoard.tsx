import React from 'react';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  combo: number;
}

export default function ScoreBoard({ score, highScore, combo }: ScoreBoardProps) {
  // 调试日志
  console.log('🎯 ScoreBoard 渲染:', {
    score,
    highScore,
    combo,
    shouldShowCombo: combo >= 1
  });

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-600">
      <div className="flex justify-between items-center">
        <div className="flex space-x-8">
          <div>
            <div className="text-sm text-gray-400">得分</div>
            <div className="text-2xl font-bold text-white">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">最高分</div>
            <div className="text-2xl font-bold text-yellow-400">{highScore.toLocaleString()}</div>
          </div>
        </div>
        
        {combo >= 1 && (
          <div className="text-right">
            <div className="text-sm text-gray-400">连击</div>
            <div className="text-xl font-bold text-orange-400">{combo}x</div>
          </div>
        )}
      </div>
    </div>
  );
} 