import { useCallback } from 'react';
import { SpecialFood, SnakeSegment, Food, SpecialFoodType } from '@/types/game';
import { GAME_CONFIG } from '@/lib/constants';

/**
 * 特殊方块系统管理Hook
 * 
 * 核心机制：
 * - 蛇身长度达到10：生成万能方块（8秒存在时间）
 * - 蛇身长度达到20：生成爆炸方块（5秒存在时间）
 * - 基于长度的风险收益博弈机制
 */
export function useSpecialFoodSystem() {
  
  // 检查是否应该生成特殊方块
  const checkSpecialFoodGeneration = useCallback((
    snakeLength: number,
    universalTriggered: boolean,
    bombTriggered: boolean
  ): { shouldGenerateUniversal: boolean; shouldGenerateBomb: boolean } => {
    
    const shouldGenerateUniversal = snakeLength >= 10 && !universalTriggered;
    const shouldGenerateBomb = snakeLength >= 20 && !bombTriggered;
    
    console.log('🎯 特殊方块生成检查:', {
      snakeLength,
      universalTriggered,
      bombTriggered,
      shouldGenerateUniversal,
      shouldGenerateBomb
    });
    
    return {
      shouldGenerateUniversal,
      shouldGenerateBomb
    };
  }, []);
  
  // 生成特殊方块
  const generateSpecialFood = useCallback((
    type: SpecialFoodType,
    snake: SnakeSegment[],
    existingFoods: Food[],
    existingSpecialFoods: SpecialFood[]
  ): SpecialFood | null => {
    
    const occupiedPositions = new Set<string>();
    
    // 记录蛇身占用的位置
    snake.forEach(segment => {
      occupiedPositions.add(`${segment.x},${segment.y}`);
    });
    
    // 记录现有食物占用的位置
    existingFoods.forEach(food => {
      occupiedPositions.add(`${food.x},${food.y}`);
    });
    
    // 记录现有特殊方块占用的位置
    existingSpecialFoods.forEach(specialFood => {
      occupiedPositions.add(`${specialFood.x},${specialFood.y}`);
    });
    
    // 寻找空白位置
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * GAME_CONFIG.gridWidth);
      const y = Math.floor(Math.random() * GAME_CONFIG.gridHeight);
      const positionKey = `${x},${y}`;
      
      if (!occupiedPositions.has(positionKey)) {
        const currentTime = Date.now();
        const duration = type === 'UNIVERSAL' ? 8000 : 5000; // 万能方块8秒，爆炸方块5秒
        
        const specialFood: SpecialFood = {
          x,
          y,
          type,
          expiresAt: currentTime + duration
        };
        
        console.log('✨ 生成特殊方块:', {
          type,
          position: { x, y },
          duration: duration / 1000 + '秒',
          expiresAt: new Date(specialFood.expiresAt).toLocaleTimeString()
        });
        
        return specialFood;
      }
      
      attempts++;
    }
    
    console.warn('⚠️ 无法找到空位置生成特殊方块');
    return null;
  }, []);
  
  // 检查特殊方块是否过期
  const removeExpiredSpecialFoods = useCallback((specialFoods: SpecialFood[]): SpecialFood[] => {
    const currentTime = Date.now();
    const validSpecialFoods = specialFoods.filter(specialFood => {
      const isValid = currentTime < specialFood.expiresAt;
      if (!isValid) {
        console.log('⏰ 特殊方块过期:', {
          type: specialFood.type,
          position: { x: specialFood.x, y: specialFood.y }
        });
      }
      return isValid;
    });
    
    return validSpecialFoods;
  }, []);
  
  // 检查蛇头是否吃到特殊方块
  const checkSpecialFoodCollision = useCallback((
    snakeHead: SnakeSegment,
    specialFoods: SpecialFood[]
  ): SpecialFood | null => {
    const eatenSpecialFood = specialFoods.find(specialFood => 
      specialFood.x === snakeHead.x && specialFood.y === snakeHead.y
    );
    
    if (eatenSpecialFood) {
      console.log('🎉 吃到特殊方块:', {
        type: eatenSpecialFood.type,
        position: { x: eatenSpecialFood.x, y: eatenSpecialFood.y }
      });
    }
    
    return eatenSpecialFood || null;
  }, []);
  
  // 移除被吃掉的特殊方块
  const removeEatenSpecialFood = useCallback((
    specialFoods: SpecialFood[],
    eatenSpecialFood: SpecialFood
  ): SpecialFood[] => {
    return specialFoods.filter(specialFood => 
      !(specialFood.x === eatenSpecialFood.x && 
        specialFood.y === eatenSpecialFood.y &&
        specialFood.type === eatenSpecialFood.type)
    );
  }, []);
  
  return {
    checkSpecialFoodGeneration,
    generateSpecialFood,
    removeExpiredSpecialFoods,
    checkSpecialFoodCollision,
    removeEatenSpecialFood,
  };
} 