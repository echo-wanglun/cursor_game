import { useCallback } from 'react';
import { Food, SnakeSegment, FoodColor } from '@/types/game';
import { FOOD_COLORS, GAME_CONFIG } from '@/lib/constants';

/**
 * 食物系统管理Hook
 * 
 * 功能：
 * 1. 生成随机位置的彩色食物
 * 2. 检测蛇头与食物的碰撞
 * 3. 管理食物的生成和移除
 */
export function useFoodSystem() {
  // 生成随机食物
  const generateFood = useCallback((
    snake: SnakeSegment[], 
    existingFoods: Food[]
  ): Food => {
    const occupiedPositions = new Set<string>();
    
    // 记录蛇身占用的位置
    snake.forEach(segment => {
      occupiedPositions.add(`${segment.x},${segment.y}`);
    });
    
    // 记录现有食物占用的位置
    existingFoods.forEach(food => {
      occupiedPositions.add(`${food.x},${food.y}`);
    });
    
    // 寻找空白位置
    let attempts = 0;
    const maxAttempts = 100; // 防止无限循环
    
    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * GAME_CONFIG.gridWidth);
      const y = Math.floor(Math.random() * GAME_CONFIG.gridHeight);
      const positionKey = `${x},${y}`;
      
      if (!occupiedPositions.has(positionKey)) {
        // 随机选择食物颜色
        const color = FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)];
        
        return { x, y, color, type: 'NORMAL' as const };
      }
      
      attempts++;
    }
    
    // 如果找不到空位置，返回一个默认位置（这种情况很少发生）
    return { 
      x: 0, 
      y: 0, 
      color: FOOD_COLORS[0],
      type: 'NORMAL' as const
    };
  }, []);
  
  // 生成初始食物数组
  const generateInitialFoods = useCallback((
    snake: SnakeSegment[]
  ): Food[] => {
    const foods: Food[] = [];
    
    for (let i = 0; i < GAME_CONFIG.foodCount; i++) {
      const food = generateFood(snake, foods);
      foods.push(food);
    }
    
    return foods;
  }, [generateFood]);
  
  // 检测蛇头是否吃到食物
  const checkFoodCollision = useCallback((snakeHead: SnakeSegment, foods: Food[]): Food | null => {
    return foods.find(food => 
      food.x === snakeHead.x && food.y === snakeHead.y
    ) || null;
  }, []);
  
  // 移除被吃掉的食物并生成新食物
  const updateFoodsAfterEating = useCallback((
    foods: Food[], 
    eatenFood: Food, 
    snake: SnakeSegment[]
  ): Food[] => {
    // 移除被吃掉的食物
    const remainingFoods = foods.filter(food => 
      !(food.x === eatenFood.x && food.y === eatenFood.y)
    );
    
    // 生成新食物
    const newFood = generateFood(snake, remainingFoods);
    
    return [...remainingFoods, newFood];
  }, [generateFood]);
  
  return {
    generateFood,
    generateInitialFoods,
    checkFoodCollision,
    updateFoodsAfterEating,
  };
} 