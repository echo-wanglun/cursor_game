import { SnakeSegment, FoodColor } from '@/types/game';

/**
 * 消除逻辑核心算法
 * 
 * 重要规则：
 * - 蛇头（snake[0]）不参与消除
 * - 只检查身体段（snake[1+]）的连续相同颜色
 * - 连续3个或以上相同颜色会被消除
 */

export interface EliminationResult {
  shouldEliminate: boolean;
  eliminatedSegments: number[]; // 被消除的段的索引数组
  eliminatedColor: FoodColor | null;
  eliminatedCount: number;
}

/**
 * 检查蛇身是否有可消除的连续相同颜色段
 * @param snake 完整的蛇（包含蛇头）
 * @returns 消除结果
 */
export function checkElimination(snake: SnakeSegment[]): EliminationResult {
  // 如果蛇身长度小于4（蛇头+3个身体段），无法消除
  if (snake.length < 4) {
    return {
      shouldEliminate: false,
      eliminatedSegments: [],
      eliminatedColor: null,
      eliminatedCount: 0
    };
  }

  // 只检查身体段（跳过蛇头）
  const bodySegments = snake.slice(1);
  
  // 从身体段开始检查连续相同颜色
  let currentColor: FoodColor | undefined = bodySegments[0]?.color;
  let consecutiveCount = 1;
  let startIndex = 1; // 在原蛇数组中的起始索引（蛇头后第一个身体段）
  
  for (let i = 1; i < bodySegments.length; i++) {
    const segment = bodySegments[i];
    
    if (segment.color && segment.color === currentColor) {
      // 颜色相同，增加计数
      consecutiveCount++;
    } else {
      // 颜色不同，检查之前的连续段是否可消除
      if (consecutiveCount >= 3 && currentColor) {
        // 找到可消除的段
        const eliminatedIndices = [];
        for (let j = 0; j < consecutiveCount; j++) {
          eliminatedIndices.push(startIndex + j);
        }
        
        return {
          shouldEliminate: true,
          eliminatedSegments: eliminatedIndices,
          eliminatedColor: currentColor,
          eliminatedCount: consecutiveCount
        };
      }
      
      // 重置计数，开始检查新的颜色段
      currentColor = segment.color;
      consecutiveCount = 1;
      startIndex = i + 1; // 在原蛇数组中的索引
    }
  }
  
  // 检查最后一段连续颜色
  if (consecutiveCount >= 3 && currentColor) {
    const eliminatedIndices = [];
    for (let j = 0; j < consecutiveCount; j++) {
      eliminatedIndices.push(startIndex + j);
    }
    
    return {
      shouldEliminate: true,
      eliminatedSegments: eliminatedIndices,
      eliminatedColor: currentColor,
      eliminatedCount: consecutiveCount
    };
  }
  
  return {
    shouldEliminate: false,
    eliminatedSegments: [],
    eliminatedColor: null,
    eliminatedCount: 0
  };
}

/**
 * 执行消除操作，移除指定的蛇身段
 * @param snake 原蛇
 * @param eliminatedIndices 要消除的段的索引数组
 * @returns 消除后的新蛇
 */
export function performElimination(snake: SnakeSegment[], eliminatedIndices: number[]): SnakeSegment[] {
  // 确保蛇头不被消除
  if (eliminatedIndices.includes(0)) {
    throw new Error('消除操作错误：蛇头不能被消除');
  }
  
  // 创建新蛇，保留未被消除的段
  const newSnake = snake.filter((_, index) => !eliminatedIndices.includes(index));
  
  return newSnake;
}

/**
 * 执行消除并重构蛇身，让后续方块瞬间填补空隙
 * @param snake 原蛇
 * @param bodyColors 身体颜色数组
 * @param eliminatedIndices 要消除的段的索引数组
 * @returns { newSnake: 重构后的蛇, newBodyColors: 重构后的颜色数组 }
 */
export function performEliminationWithCompression(
  snake: SnakeSegment[], 
  bodyColors: FoodColor[], 
  eliminatedIndices: number[]
): { newSnake: SnakeSegment[], newBodyColors: FoodColor[] } {
  // 确保蛇头不被消除
  if (eliminatedIndices.includes(0)) {
    throw new Error('消除操作错误：蛇头不能被消除');
  }
  
  console.log('🔧 开始消除并重构蛇身:', {
    originalSnakeLength: snake.length,
    originalBodyColorsLength: bodyColors.length,
    eliminatedIndices,
    eliminatedCount: eliminatedIndices.length
  });
  
  // 从bodyColors中移除对应的颜色（注意索引转换：snake[i] 对应 bodyColors[i-1]）
  const newBodyColors = bodyColors.filter((_, colorIndex) => {
    const snakeIndex = colorIndex + 1; // bodyColors[i] 对应 snake[i+1]
    return !eliminatedIndices.includes(snakeIndex);
  });
  
  // 保留未被消除的蛇身段，保持它们的原始位置
  const remainingSegments = snake.filter((_, index) => !eliminatedIndices.includes(index));
  
  console.log('✅ 蛇身重构完成:', {
    newSnakeLength: remainingSegments.length,
    newBodyColorsLength: newBodyColors.length,
    headPosition: { x: remainingSegments[0].x, y: remainingSegments[0].y },
    bodyPositions: remainingSegments.slice(1).map(seg => ({ x: seg.x, y: seg.y }))
  });
  
  // 更新剩余身体段的颜色
  const newSnake = remainingSegments.map((segment, index) => ({
    ...segment,
    color: index === 0 ? undefined : newBodyColors[index - 1] // 蛇头没有颜色
  }));
  
  return {
    newSnake,
    newBodyColors
  };
}

/**
 * 计算消除得分
 * @param eliminatedCount 消除的段数
 * @param comboCount 连击数（从1开始）
 * @returns 得分
 */
export function calculateEliminationScore(eliminatedCount: number, comboCount: number = 1): number {
  // 基础消除得分：每个段3分
  let score = eliminatedCount * 3;
  
  // 连击奖励（从2连击开始有奖励）
  if (comboCount >= 2) {
    // 2连击+5分，3连击+8分，4连击+12分...
    const comboBonus = Math.floor((comboCount - 1) * (comboCount + 2) / 2);
    score += comboBonus;
  }
  
  return score;
} 