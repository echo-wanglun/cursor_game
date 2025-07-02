import React from 'react';
import { SpecialFood as SpecialFoodType } from '@/types/game';

interface SpecialFoodProps {
  specialFood: SpecialFoodType;
}

export default function SpecialFood({ specialFood }: SpecialFoodProps) {
  const getSpecialFoodStyle = () => {
    if (specialFood.type === 'UNIVERSAL') {
      return {
        background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6347, #FF1493, #9370DB, #4169E1)',
        backgroundSize: '200% 200%',
        animation: 'rainbow 2s ease infinite, pulse 1s ease-in-out infinite alternate'
      };
    } else if (specialFood.type === 'BOMB') {
      return {
        background: 'radial-gradient(circle, #FF0000, #FF4500, #FF6600)',
        animation: 'explode 1.5s ease-in-out infinite, shake 0.5s ease-in-out infinite'
      };
    }
    return {};
  };

  const getSpecialFoodIcon = () => {
    if (specialFood.type === 'UNIVERSAL') {
      return '✨'; // 万能方块显示星星
    } else if (specialFood.type === 'BOMB') {
      return '💥'; // 爆炸方块显示爆炸
    }
    return '';
  };

  const getRemainingTime = () => {
    const remaining = Math.max(0, specialFood.expiresAt - Date.now());
    return Math.ceil(remaining / 1000);
  };

  return (
    <>
      <style jsx>{`
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        
        @keyframes explode {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        @keyframes countdown {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
      
      <div
        className="absolute inset-0 rounded-lg border-2 border-white shadow-lg"
        style={getSpecialFoodStyle()}
      >
        {/* 特殊方块图标 */}
        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white drop-shadow-lg">
          {getSpecialFoodIcon()}
        </div>
        
        {/* 倒计时显示 */}
        <div 
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
          style={{ animation: 'countdown 1s ease-in-out infinite' }}
        >
          {getRemainingTime()}
        </div>
        
        {/* 光环效果 */}
        <div 
          className="absolute inset-0 rounded-lg opacity-50"
          style={{
            boxShadow: specialFood.type === 'UNIVERSAL' 
              ? '0 0 20px #FFD700, 0 0 40px #FFD700' 
              : '0 0 20px #FF0000, 0 0 40px #FF0000',
            animation: 'pulse 1s ease-in-out infinite alternate'
          }}
        />
      </div>
    </>
  );
} 