import React from 'react';
import { GameState } from '@/types/game';
import { GAME_CONFIG, COLOR_CLASS_MAP } from '@/lib/constants';
import Snake from './Snake';
import Food from './Food';
import SpecialFood from './SpecialFood';

interface GameBoardProps {
  gameState: GameState;
}

export default function GameBoard({ gameState }: GameBoardProps) {
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
    <div className="relative bg-gray-800 border-2 border-gray-600 rounded-lg p-2">
      <div 
        className="grid gap-px bg-gray-700 p-1 rounded"
        style={{
          gridTemplateColumns: `repeat(${GAME_CONFIG.gridWidth}, minmax(0, 1fr))`,
          aspectRatio: '1',
        }}
      >
        {grid.map(({ x, y }) => (
          <div
            key={`${x}-${y}`}
            className="bg-gray-800 aspect-square relative"
          >
            {/* 渲染蛇身 */}
            <Snake snake={gameState.snake} cellX={x} cellY={y} />
            
            {/* 渲染食物 */}
            {gameState.foods.map((food, index) => (
              food.x === x && food.y === y && (
                <Food key={`food-${index}`} food={food} />
              )
            ))}
            
            {/* 渲染特殊食物 */}
            {gameState.specialFoods.map((specialFood, index) => (
              specialFood.x === x && specialFood.y === y && (
                <SpecialFood key={`special-${index}`} specialFood={specialFood} />
              )
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 