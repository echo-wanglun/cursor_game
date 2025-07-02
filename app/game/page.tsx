'use client';

import { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import GameOver from './components/GameOver';
import { GameState, Direction, FoodColor } from '@/types/game';
import { GAME_CONFIG, KEY_DIRECTION_MAP, OPPOSITE_DIRECTIONS, FOOD_COLORS, DIRECTION_VECTORS } from '@/lib/constants';
import { useSnakeMovement } from './hooks/useSnakeMovement';
import { useFoodSystem } from './hooks/useFoodSystem';
import { useSpecialFoodSystem } from './hooks/useSpecialFoodSystem';
import { checkElimination, performElimination, calculateEliminationScore } from '@/lib/eliminationLogic';
import { safeRebuildSnake } from '@/lib/snakeRebuildLogic';

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
  
  // 使用自定义Hook处理特殊方块系统
  const { 
    checkSpecialFoodGeneration, 
    generateSpecialFood, 
    removeExpiredSpecialFoods, 
    checkSpecialFoodCollision, 
    removeEatenSpecialFood 
  } = useSpecialFoodSystem();

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
        
        // 检查是否吃到特殊方块
        const eatenSpecialFood = checkSpecialFoodCollision(nextHeadPosition, prev.specialFoods);
        
        // 🔥 重要修复：只有在没有吃到任何东西时才检查碰撞
        // 避免特殊方块位置被误判为碰撞
        if (!eatenFood && !eatenSpecialFood) {
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
          const updatedFoods = updateFoodsAfterEating(prev.foods, eatenFood, grownSnake, prev.specialFoods);
          
          return {
            ...prev,
            snake: grownSnake,
            foods: updatedFoods,
            score: prev.score + 10,
            lastEatenFood: eatenFood // 添加标记，用于在effect中更新颜色
          };
        } else if (eatenSpecialFood) {
          // 吃到特殊方块：蛇身增长，移除特殊方块
          console.log('🌟 吃到特殊方块:', {
            type: eatenSpecialFood.type,
            position: { x: eatenSpecialFood.x, y: eatenSpecialFood.y },
            nextHeadPosition
          });
          
          const grownSnake = growSnake(prev.snake, prev.direction);
          const updatedSpecialFoods = removeEatenSpecialFood(prev.specialFoods, eatenSpecialFood);
          
          // 特殊方块的处理逻辑将在后续的effect中处理
          return {
            ...prev,
            snake: grownSnake,
            specialFoods: updatedSpecialFoods,
            score: prev.score + 50, // 特殊方块给更多分数
            lastEatenSpecialFood: eatenSpecialFood // 添加标记，用于在effect中处理特殊效果
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
  }, [gameState.status, moveSnake, growSnake, checkCollision, checkFoodCollision, checkSpecialFoodCollision, removeEatenSpecialFood, updateFoodsAfterEating]);

  // 键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // 初始化食物
  useEffect(() => {
    if (gameState.foods.length === 0) {
      const initialFoods = generateInitialFoods(gameState.snake, gameState.specialFoods);
      setGameState(prev => ({
        ...prev,
        foods: initialFoods
      }));
    }
  }, [gameState.foods.length, gameState.snake, gameState.specialFoods, generateInitialFoods]);

  // 处理吃食物后的颜色更新和消除检查
  useEffect(() => {
    if (gameState.lastEatenFood) {
      setBodyColors(prevColors => {
        const newColors = [gameState.lastEatenFood!.color, ...prevColors];
        return newColors;
      });
      
      // 清除标记，避免重复更新
      setGameState(prev => ({
        ...prev,
        lastEatenFood: undefined
      }));
    }
  }, [gameState.lastEatenFood, bodyColors]);

  // 处理特殊方块效果
  useEffect(() => {
    if (gameState.lastEatenSpecialFood) {
      const specialFood = gameState.lastEatenSpecialFood;
      
      console.log('🎉 处理特殊方块效果:', {
        type: specialFood.type,
        position: { x: specialFood.x, y: specialFood.y }
      });
      
      if (specialFood.type === 'UNIVERSAL') {
        // 🌟 万能方块：变成最常见的颜色，立即触发大量消除
        const colorCounts = bodyColors.reduce((counts, color) => {
          counts[color] = (counts[color] || 0) + 1;
          return counts;
        }, {} as Record<string, number>);
        
        // 找到最常见的颜色
        const mostCommonColor = Object.entries(colorCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] as FoodColor || 'RED';
        
        setBodyColors(prevColors => {
          const newColors: FoodColor[] = [mostCommonColor, ...prevColors];
          console.log('🌟 万能方块效果 - 变成最常见颜色:', {
            mostCommonColor,
            colorCounts,
            newColors: newColors.slice(0, 8)
          });
          
          // 显示效果提示
          alert(`🌟 万能方块效果！\n变成最常见颜色: ${mostCommonColor}\n准备触发大量消除！`);
          
          return newColors;
        });
        
      } else if (specialFood.type === 'BOMB') {
        // 💥 爆炸方块：消除蛇身所有相同颜色的方块（选择最多的颜色）
        if (bodyColors.length > 0) {
          const colorCounts = bodyColors.reduce((counts, color) => {
            counts[color] = (counts[color] || 0) + 1;
            return counts;
          }, {} as Record<string, number>);
          
          // 找到数量最多的颜色
          const targetColor = Object.entries(colorCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] as FoodColor;
          
          if (targetColor) {
            // 移除所有相同颜色的方块
            const remainingColors = bodyColors.filter(color => color !== targetColor);
            const eliminatedCount = bodyColors.length - remainingColors.length;
            
            // 🔥 安全检查：确保爆炸后至少保留一个身体段
            const safeRemainingColors: FoodColor[] = remainingColors.length > 0 ? remainingColors : ['RED'];
            const actualEliminatedCount = bodyColors.length - safeRemainingColors.length;
            
                        console.log('💥 爆炸方块效果 - 消除所有相同颜色:', {
              targetColor,
              eliminatedCount: actualEliminatedCount,
              beforeLength: bodyColors.length,
              afterLength: safeRemainingColors.length,
              colorCounts,
              safetyApplied: safeRemainingColors.length !== remainingColors.length
            });
            
            // 🔥 重要修复：使用延迟处理避免状态冲突
            setTimeout(() => {
              // 立即更新颜色
              setBodyColors(safeRemainingColors);
              
              // 重建蛇身
              const head = gameState.snake[0];
              const newSnake = safeRebuildSnake(head, safeRemainingColors, gameState.direction);
              
              // 计算爆炸得分（更高的奖励）
              const explosionScore = actualEliminatedCount * 20; // 每个消除的方块20分
              
              setGameState(prev => ({
                ...prev,
                snake: newSnake,
                score: prev.score + explosionScore
              }));
              
              console.log('💥 爆炸得分:', explosionScore);
              
              // 显示爆炸效果提示
              alert(`💥 爆炸方块效果！\n消除了 ${actualEliminatedCount} 个 ${targetColor} 方块\n获得 ${explosionScore} 分！`);
            }, 50); // 延迟50ms处理，避免与游戏循环冲突
          }
        } else {
          console.log('💥 爆炸方块：蛇身为空，无法爆炸');
        }
      }
      
      // 清除标记，避免重复处理
      setGameState(prev => ({
        ...prev,
        lastEatenSpecialFood: undefined
      }));
    }
  }, [gameState.lastEatenSpecialFood, bodyColors]);

  // 消除检查和处理
  useEffect(() => {
    if (gameState.status === 'PLAYING' && gameState.snake.length > 3) {
      // 创建带颜色的蛇用于消除检查
      const snakeForElimination = gameState.snake.map((segment, index) => {
        if (index === 0) {
          return segment; // 蛇头无颜色
        } else {
          return {
            ...segment,
            color: bodyColors[index - 1] || 'RED'
          };
        }
      });

      const eliminationResult = checkElimination(snakeForElimination);
      
      if (eliminationResult.shouldEliminate) {
        // 使用setTimeout避免无限循环，延迟执行消除
        setTimeout(() => {
          // 执行消除
          const eliminatedBodyIndices = eliminationResult.eliminatedSegments.map(snakeIndex => snakeIndex - 1);
          const newBodyColors = bodyColors.filter((_, index) => !eliminatedBodyIndices.includes(index));
          
          // 使用安全的蛇身重建逻辑，避免超出边界
          const head = gameState.snake[0];
          const newSnake = safeRebuildSnake(head, newBodyColors, gameState.direction);
          
          // 连击逻辑：检查时间窗口
          const currentTime = Date.now();
          const COMBO_WINDOW = 3000; // 3秒连击窗口
          
          let newCombo = 0;
          if (gameState.lastEliminationTime && (currentTime - gameState.lastEliminationTime) <= COMBO_WINDOW) {
            // 在连击窗口内，增加连击数
            newCombo = gameState.combo + 1;
            console.log('🔥 连击增加:', {
              previousCombo: gameState.combo,
              newCombo,
              timeSinceLastElimination: currentTime - gameState.lastEliminationTime,
              comboWindow: COMBO_WINDOW
            });
          } else {
            // 超出连击窗口，重置连击数
            newCombo = 1; // 第一次消除，连击数为1
            console.log('🎯 首次消除或连击重置:', {
              previousCombo: gameState.combo,
              newCombo,
              hasLastEliminationTime: !!gameState.lastEliminationTime,
              timeSinceLastElimination: gameState.lastEliminationTime ? currentTime - gameState.lastEliminationTime : 0,
              comboWindow: COMBO_WINDOW
            });
          }
          
          const eliminationScore = calculateEliminationScore(eliminationResult.eliminatedCount, newCombo);
          
          console.log('💯 消除得分计算:', {
            eliminatedCount: eliminationResult.eliminatedCount,
            comboCount: newCombo,
            score: eliminationScore,
            eliminatedColor: eliminationResult.eliminatedColor
          });
          
          setBodyColors(newBodyColors);
          setGameState(prev => ({
            ...prev,
            snake: newSnake,
            score: prev.score + eliminationScore,
            combo: newCombo,
            lastEliminationTime: currentTime
          }));
        }, 100); // 延迟100ms执行消除
      }
    }
  }, [bodyColors, gameState.snake.length, gameState.status]);

  // 连击重置检查
  useEffect(() => {
    if (gameState.lastEliminationTime && gameState.combo > 0) {
      const COMBO_WINDOW = 3000; // 3秒连击窗口
      const timeoutId = setTimeout(() => {
        const currentTime = Date.now();
        if (currentTime - gameState.lastEliminationTime! > COMBO_WINDOW) {
          // 超出连击窗口，重置连击数
          setGameState(prev => ({
            ...prev,
            combo: 0
          }));
        }
      }, COMBO_WINDOW);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState.lastEliminationTime, gameState.combo]);

  // 特殊方块系统：基于长度的生成和过期管理
  useEffect(() => {
    if (gameState.status === 'PLAYING') {
      const snakeLength = gameState.snake.length;
      
      // 检查是否需要生成特殊方块
      const { shouldGenerateUniversal, shouldGenerateBomb } = checkSpecialFoodGeneration(
        snakeLength,
        gameState.universalFoodTriggered,
        gameState.bombFoodTriggered
      );
      
      let newSpecialFoods = [...gameState.specialFoods];
      let stateUpdates: Partial<GameState> = {};
      
      // 生成万能方块（长度10）
      if (shouldGenerateUniversal) {
        const universalFood = generateSpecialFood(
          'UNIVERSAL',
          gameState.snake,
          gameState.foods,
          newSpecialFoods
        );
        
        if (universalFood) {
          newSpecialFoods.push(universalFood);
          stateUpdates.universalFoodTriggered = true;
          
          console.log('🌟 万能方块生成! 蛇身长度:', snakeLength);
        }
      }
      
      // 生成爆炸方块（长度20）
      if (shouldGenerateBomb) {
        const bombFood = generateSpecialFood(
          'BOMB',
          gameState.snake,
          gameState.foods,
          newSpecialFoods
        );
        
        if (bombFood) {
          newSpecialFoods.push(bombFood);
          stateUpdates.bombFoodTriggered = true;
          
          console.log('💥 爆炸方块生成! 蛇身长度:', snakeLength);
        }
      }
      
      // 移除过期的特殊方块
      const validSpecialFoods = removeExpiredSpecialFoods(newSpecialFoods);
      
      // 如果有变化，更新状态
      if (Object.keys(stateUpdates).length > 0 || validSpecialFoods.length !== gameState.specialFoods.length) {
        setGameState(prev => ({
          ...prev,
          specialFoods: validSpecialFoods,
          ...stateUpdates
        }));
      }
    }
  }, [
    gameState.status,
    gameState.snake.length,
    gameState.universalFoodTriggered,
    gameState.bombFoodTriggered,
    gameState.specialFoods,
    checkSpecialFoodGeneration,
    generateSpecialFood,
    removeExpiredSpecialFoods
  ]);



  // 将bodyColors应用到snake身体段
  const snakeWithColors = gameState.snake.map((segment, index) => {
    if (index === 0) {
      // 蛇头永远没有颜色
      return segment;
    } else {
      // 身体段从bodyColors数组获取颜色
      const bodyColorIndex = index - 1;
      const assignedColor = bodyColors[bodyColorIndex] || 'RED';

      return {
        ...segment,
        color: assignedColor
      };
    }
  });

  // 开始游戏
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      status: 'PLAYING'
    }));
  };

  // 重新开始游戏
  const restartGame = () => {
    const initialSnake = [
      { x: 10, y: 10 }, // 蛇头
      { x: 9, y: 10 }, // 初始身体段
    ];
    
    setGameState({
      snake: initialSnake,
      direction: 'RIGHT',
      foods: generateInitialFoods(initialSnake, []),
      specialFoods: [],
      score: 0,
      highScore: gameState.highScore,
      status: 'PLAYING',
      combo: 0,
      universalFoodTriggered: false,
      bombFoodTriggered: false,
    });
    
    // 重置身体颜色数组
    setBodyColors(['RED']);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <ScoreBoard 
          score={gameState.score}
          highScore={gameState.highScore}
          combo={gameState.combo}
        />
        
        <div className="relative">
          <GameBoard gameState={{...gameState, snake: snakeWithColors}} />
          
          {gameState.status === 'GAME_OVER' && (
            <GameOver 
              score={gameState.score}
              highScore={gameState.highScore}
              onRestart={restartGame}
            />
          )}
        </div>

        <div className="mt-4 text-center text-gray-400">
          <p>方向键控制移动 | 空格键暂停/继续</p>
          {gameState.status === 'IDLE' && (
            <button 
              onClick={startGame}
              className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              开始游戏
            </button>
          )}
          {gameState.status === 'PAUSED' && (
            <p className="mt-2 text-yellow-400">游戏已暂停</p>
          )}
        </div>
        
        {/* 调试信息 */}
        <div className="mt-4 text-xs text-gray-500">
          <p>调试信息：</p>
          <p>蛇身长度: {gameState.snake.length}</p>
          <p>身体颜色: [{bodyColors.join(', ')}]</p>
          <p>连击数: {gameState.combo}</p>
          <p>最后消除时间: {gameState.lastEliminationTime ? new Date(gameState.lastEliminationTime).toLocaleTimeString() : '无'}</p>
          <p>特殊方块数量: {gameState.specialFoods.length}</p>
          <p>万能方块已触发: {gameState.universalFoodTriggered ? '是' : '否'}</p>
          <p>爆炸方块已触发: {gameState.bombFoodTriggered ? '是' : '否'}</p>
        </div>
      </div>
    </div>
  );
} 