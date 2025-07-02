'use client';

import { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import GameOver from './components/GameOver';
import { GameState, Direction, FoodColor } from '@/types/game';
import { GAME_CONFIG, KEY_DIRECTION_MAP, OPPOSITE_DIRECTIONS, FOOD_COLORS, DIRECTION_VECTORS } from '@/lib/constants';
import { useSnakeMovement } from './hooks/useSnakeMovement';
import { useFoodSystem } from './hooks/useFoodSystem';
import { checkElimination, performEliminationWithCompression, calculateEliminationScore } from '@/lib/eliminationLogic';

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>({
    snake: [
      { x: 10, y: 10 }, // 蛇头（永远没有颜色）
      { x: 9, y: 10 }, // 初始身体段（颜色由bodyColors管理）
    ],
    direction: 'RIGHT',
    foods: [],
    specialFoods: [],
    score: 0,
    highScore: 0,
    status: 'IDLE',
    combo: 0,
    universalFoodTriggered: false,
    bombFoodTriggered: false,
  });

  // 独立的身体颜色数组：bodyColors[i] 对应 snake[i+1] 的颜色
  const [bodyColors, setBodyColors] = useState<FoodColor[]>(['RED']); // 初始身体段为红色

  // 使用自定义Hook处理蛇的移动
  const { moveSnake, growSnake, checkCollision } = useSnakeMovement();
  
  // 使用自定义Hook处理食物系统
  const { generateInitialFoods, checkFoodCollision, updateFoodsAfterEating } = useFoodSystem();

  // 键盘控制
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      setGameState(prev => ({
        ...prev,
        status: prev.status === 'PLAYING' ? 'PAUSED' : prev.status === 'PAUSED' ? 'PLAYING' : 'PLAYING'
      }));
      return;
    }

    if (gameState.status !== 'PLAYING') return;

    const newDirection = KEY_DIRECTION_MAP[event.key as keyof typeof KEY_DIRECTION_MAP];
    if (newDirection && newDirection !== OPPOSITE_DIRECTIONS[gameState.direction]) {
      setGameState(prev => ({
        ...prev,
        direction: newDirection as Direction
      }));
    }
  }, [gameState.status, gameState.direction]);

  // 游戏循环
  useEffect(() => {
    if (gameState.status !== 'PLAYING') return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        // 检查蛇头下一步位置
        const head = prev.snake[0];
        const vector = DIRECTION_VECTORS[prev.direction];
        const nextHeadPosition = { x: head.x + vector.x, y: head.y + vector.y };
        
        // 检查是否吃到普通食物
        const eatenFood = checkFoodCollision(nextHeadPosition, prev.foods);
        
        // 检查碰撞（只有在没有吃到食物时才检查）
        if (!eatenFood) {
          const collision = checkCollision([nextHeadPosition, ...prev.snake], GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight);
          
          if (collision) {
            console.log('💀 游戏结束 - 碰撞检测:', {
              nextHeadPosition,
              reason: '撞墙或撞自己'
            });
            return {
              ...prev,
              status: 'GAME_OVER'
            };
          }
        }

        if (eatenFood) {
          // 吃到普通食物：蛇身增长
          const grownSnake = growSnake(prev.snake, prev.direction);
          const updatedFoods = updateFoodsAfterEating(prev.foods, eatenFood, grownSnake);
          
          return {
            ...prev,
            snake: grownSnake,
            foods: updatedFoods,
            score: prev.score + 10,
            lastEatenFood: eatenFood // 添加标记，用于在effect中更新颜色
          };
        } else {
          // 没有吃到任何东西，正常移动
          const newSnake = moveSnake(prev.snake, prev.direction);
          
          return {
            ...prev,
            snake: newSnake
          };
        }
      });
    }, GAME_CONFIG.moveInterval);

    return () => clearInterval(gameLoop);
  }, [gameState.status, moveSnake, growSnake, checkCollision, checkFoodCollision, updateFoodsAfterEating]);

  // 键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // 初始化食物
  useEffect(() => {
    if (gameState.foods.length === 0) {
      const initialFoods = generateInitialFoods(gameState.snake);
      setGameState(prev => ({
        ...prev,
        foods: initialFoods
      }));
    }
  }, [gameState.foods.length, gameState.snake, generateInitialFoods]);

  // 处理吃食物后的颜色更新和消除检查
  useEffect(() => {
    if (gameState.lastEatenFood) {
      setBodyColors(prevColors => {
        const newColors = [gameState.lastEatenFood!.color, ...prevColors];
        
        // 创建临时蛇身用于消除检查
        const tempSnake = gameState.snake.map((segment, index) => ({
          ...segment,
          color: index === 0 ? undefined : newColors[index - 1] // 蛇头没有颜色
        }));
        
        // 检查是否有可消除的段
        const eliminationResult = checkElimination(tempSnake);
        
        if (eliminationResult.shouldEliminate) {
          console.log('🎯 检测到可消除段:', {
            eliminatedColor: eliminationResult.eliminatedColor,
            eliminatedCount: eliminationResult.eliminatedCount,
            eliminatedSegments: eliminationResult.eliminatedSegments
          });
          
          // 执行消除并重构蛇身
          const { newSnake, newBodyColors } = performEliminationWithCompression(
            tempSnake, 
            newColors, 
            eliminationResult.eliminatedSegments
          );
          
          // 计算得分
          const eliminationScore = calculateEliminationScore(eliminationResult.eliminatedCount, gameState.combo + 1);
          
          console.log('✨ 消除完成:', {
            eliminationScore,
            combo: gameState.combo + 1,
            newSnakeLength: newSnake.length,
            newColorsLength: newBodyColors.length
          });
          
          // 更新游戏状态
          setGameState(prev => ({
            ...prev,
            snake: newSnake,
            score: prev.score + eliminationScore,
            combo: prev.combo + 1,
            lastEatenFood: undefined
          }));
          
          return newBodyColors;
        } else {
          // 没有消除，重置连击
          setGameState(prev => ({
            ...prev,
            combo: 0,
            lastEatenFood: undefined
          }));
          
          return newColors;
        }
      });
    }
  }, [gameState.lastEatenFood, gameState.snake, gameState.combo]);

  // 开始游戏
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      status: 'PLAYING'
    }));
  };

  // 重新开始游戏
  const restartGame = () => {
    setGameState({
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
      ],
      direction: 'RIGHT',
      foods: [],
      specialFoods: [],
      score: 0,
      highScore: Math.max(gameState.score, gameState.highScore),
      status: 'PLAYING',
      combo: 0,
      universalFoodTriggered: false,
      bombFoodTriggered: false,
    });
    setBodyColors(['RED']);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">贪吃蛇消消乐</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 游戏区域 */}
          <div className="lg:col-span-3">
            <GameBoard 
              snake={gameState.snake}
              bodyColors={bodyColors}
              foods={gameState.foods}
              specialFoods={[]} // 移除特殊方块
            />
          </div>
          
          {/* 侧边栏 */}
          <div className="space-y-4">
            <ScoreBoard 
              score={gameState.score}
              highScore={gameState.highScore}
              combo={gameState.combo}
            />
            
            {/* 控制说明 */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">控制说明</h3>
              <div className="text-sm space-y-1">
                <p>↑↓←→ 控制方向</p>
                <p>空格键 暂停/继续</p>
              </div>
            </div>
            
            {/* 游戏规则 */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">游戏规则</h3>
              <div className="text-sm space-y-1">
                <p>• 吃食物获得 10 分</p>
                <p>• 3个相同颜色消除获得 9 分</p>
                <p>• 连击有额外奖励</p>
              </div>
            </div>
            
            {/* 开始按钮 */}
            {gameState.status === 'IDLE' && (
              <button
                onClick={startGame}
                className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold"
              >
                开始游戏
              </button>
            )}
          </div>
        </div>
        
        {/* 游戏结束弹窗 */}
        {gameState.status === 'GAME_OVER' && (
          <GameOver
            score={gameState.score}
            highScore={gameState.highScore}
            onRestart={restartGame}
          />
        )}
      </div>
    </div>
  );
} 