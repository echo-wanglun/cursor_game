import React from 'react';
import Snake from './Snake';
import Food from './Food';
import { SnakeSegment, Food as FoodType, FoodColor } from '@/types/game';
import { GAME_CONFIG } from '@/lib/constants';

interface GameBoardProps {
  snake: SnakeSegment[];
  bodyColors: FoodColor[];
  foods: FoodType[];
  specialFoods: any[]; // 保留接口但不使用
}

export default function GameBoard({ snake, bodyColors, foods }: GameBoardProps) {
  // 创建网格
  const createGrid = () => {
    const grid = [];
    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
      for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
        grid.push({ x, y });
      }
    }
    return grid;
  };

  const grid = createGrid();

  return (
    <div className="relative bg-gray-800 p-4 rounded-lg">
      {/* 游戏网格 */}
      <div 
        className="grid gap-[1px] bg-gray-700 p-1"
        style={{
          gridTemplateColumns: `repeat(${GAME_CONFIG.gridWidth}, 1fr)`,
          gridTemplateRows: `repeat(${GAME_CONFIG.gridHeight}, 1fr)`,
          aspectRatio: '1/1',
          maxWidth: '600px',
          maxHeight: '600px'
        }}
      >
        {grid.map((cell) => (
          <div
            key={`${cell.x}-${cell.y}`}
            className="bg-gray-900 aspect-square relative"
          >
            {/* 渲染蛇身 */}
            <Snake 
              snake={snake} 
              bodyColors={bodyColors} 
              cellX={cell.x} 
              cellY={cell.y} 
            />
            
            {/* 渲染食物 */}
            {foods.map((food, index) => (
              food.x === cell.x && food.y === cell.y && (
                <Food key={`food-${index}`} food={food} />
              )
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 