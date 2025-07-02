import { SnakeSegment, Direction, FoodColor } from '@/types/game';
import { DIRECTION_VECTORS, GAME_CONFIG } from '@/lib/constants';

/**
 * 安全的蛇身重建逻辑
 * 解决消除后蛇身超出边界的问题
 */

/**
 * 检查位置是否在游戏边界内
 */
function isPositionValid(x: number, y: number): boolean {
  return x >= 0 && x < GAME_CONFIG.gridWidth && y >= 0 && y < GAME_CONFIG.gridHeight;
}

/**
 * 获取所有可能的方向向量
 */
function getAllDirectionVectors(): Array<{ x: number; y: number; direction: Direction }> {
  return [
    { x: 0, y: -1, direction: 'UP' },
    { x: 0, y: 1, direction: 'DOWN' },
    { x: -1, y: 0, direction: 'LEFT' },
    { x: 1, y: 0, direction: 'RIGHT' }
  ];
}

/**
 * 安全重建蛇身
 * @param head 蛇头位置
 * @param remainingBodyColors 剩余身体段的颜色数组
 * @param currentDirection 当前移动方向
 * @returns 重建后的蛇身
 */
export function safeRebuildSnake(
  head: SnakeSegment,
  remainingBodyColors: FoodColor[],
  currentDirection: Direction
): SnakeSegment[] {
  
  console.log('🔧 开始安全重建蛇身:', {
    headPosition: { x: head.x, y: head.y },
    remainingBodyCount: remainingBodyColors.length,
    currentDirection
  });

  const newSnake: SnakeSegment[] = [head];
  
  if (remainingBodyColors.length === 0) {
    console.log('✅ 蛇身重建完成: 只剩蛇头');
    return newSnake;
  }

  // 尝试不同的方向来放置身体段
  const allDirections = getAllDirectionVectors();
  
  // 优先使用当前移动方向的反方向
  const currentVector = DIRECTION_VECTORS[currentDirection];
  const preferredVector = { x: -currentVector.x, y: -currentVector.y };
  
  // 将首选方向放在最前面
  const sortedDirections = allDirections.sort((a, b) => {
    if (a.x === preferredVector.x && a.y === preferredVector.y) return -1;
    if (b.x === preferredVector.x && b.y === preferredVector.y) return 1;
    return 0;
  });

  let placedCount = 0;
  
  for (const directionInfo of sortedDirections) {
    const vector = { x: directionInfo.x, y: directionInfo.y };
    
    // 尝试在这个方向上放置尽可能多的身体段
    for (let i = placedCount; i < remainingBodyColors.length; i++) {
      const distance = i - placedCount + 1;
      const newPosition = {
        x: head.x + vector.x * distance,
        y: head.y + vector.y * distance
      };
      
      // 检查位置是否有效
      if (!isPositionValid(newPosition.x, newPosition.y)) {
        console.log(`⚠️ 位置超出边界: (${newPosition.x}, ${newPosition.y}), 方向: ${directionInfo.direction}`);
        break;
      }
      
      // 检查是否与已放置的身体段重叠
      const isOverlapping = newSnake.some(segment => 
        segment.x === newPosition.x && segment.y === newPosition.y
      );
      
      if (isOverlapping) {
        console.log(`⚠️ 位置重叠: (${newPosition.x}, ${newPosition.y}), 方向: ${directionInfo.direction}`);
        break;
      }
      
      // 放置身体段
      newSnake.push({
        x: newPosition.x,
        y: newPosition.y,
        color: remainingBodyColors[i]
      });
      
      placedCount++;
      
      console.log(`✅ 放置身体段 ${placedCount}/${remainingBodyColors.length}: (${newPosition.x}, ${newPosition.y}), 颜色: ${remainingBodyColors[i]}`);
    }
    
    // 如果所有身体段都放置完毕，退出循环
    if (placedCount >= remainingBodyColors.length) {
      break;
    }
  }

  // 如果还有身体段无法放置，采用螺旋放置策略
  if (placedCount < remainingBodyColors.length) {
    console.log('🌀 采用螺旋放置策略放置剩余身体段');
    
    const spiralPositions = generateSpiralPositions(head, GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight);
    
    for (let i = placedCount; i < remainingBodyColors.length; i++) {
      let placed = false;
      
      for (const pos of spiralPositions) {
        // 检查位置是否被占用
        const isOccupied = newSnake.some(segment => 
          segment.x === pos.x && segment.y === pos.y
        );
        
        if (!isOccupied) {
          newSnake.push({
            x: pos.x,
            y: pos.y,
            color: remainingBodyColors[i]
          });
          
          console.log(`🌀 螺旋放置身体段: (${pos.x}, ${pos.y}), 颜色: ${remainingBodyColors[i]}`);
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        console.warn(`⚠️ 无法放置身体段 ${i + 1}/${remainingBodyColors.length}`);
        break;
      }
    }
  }

  console.log('🎯 蛇身重建完成:', {
    totalSegments: newSnake.length,
    expectedSegments: remainingBodyColors.length + 1,
    placedBodySegments: placedCount
  });

  return newSnake;
}

/**
 * 生成螺旋位置序列
 * 从蛇头开始，以螺旋方式生成位置
 */
function generateSpiralPositions(
  center: SnakeSegment, 
  gridWidth: number, 
  gridHeight: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const visited = new Set<string>();
  
  // 螺旋方向：右、下、左、上
  const directions = [
    { x: 1, y: 0 },   // 右
    { x: 0, y: 1 },   // 下
    { x: -1, y: 0 },  // 左
    { x: 0, y: -1 }   // 上
  ];
  
  let currentX = center.x;
  let currentY = center.y;
  let directionIndex = 0;
  let steps = 1;
  
  visited.add(`${center.x},${center.y}`);
  
  while (positions.length < gridWidth * gridHeight - 1) {
    for (let i = 0; i < 2; i++) { // 每个步长重复两次
      const direction = directions[directionIndex];
      
      for (let step = 0; step < steps; step++) {
        currentX += direction.x;
        currentY += direction.y;
        
        const posKey = `${currentX},${currentY}`;
        
        if (isPositionValid(currentX, currentY) && !visited.has(posKey)) {
          positions.push({ x: currentX, y: currentY });
          visited.add(posKey);
        }
      }
      
      directionIndex = (directionIndex + 1) % 4;
    }
    
    steps++;
  }
  
  return positions;
} 