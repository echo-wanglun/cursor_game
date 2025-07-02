// 游戏基础类型定义

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type FoodColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PURPLE';

export type SpecialFoodType = 'UNIVERSAL' | 'BOMB';

/**
 * 蛇段接口
 * 
 * 重要说明：
 * - 蛇头（snake[0]）：color属性为undefined，固定白色外观
 * - 身体段（snake[1+]）：color属性必须有值，用于渲染和消除匹配
 */
export interface SnakeSegment {
  x: number;           // X坐标
  y: number;           // Y坐标
  color?: FoodColor;   // 颜色（蛇头无颜色，身体段有颜色）
}

export interface Food extends Position {
  color: FoodColor;
  type: 'NORMAL';
}

export interface SpecialFood extends Position {
  type: SpecialFoodType;
  expiresAt: number;
}

export interface GameState {
  snake: SnakeSegment[];
  direction: Direction;
  foods: Food[];
  specialFoods: SpecialFood[];
  score: number;
  highScore: number;
  status: GameStatus;
  combo: number;
  lastEatenFood?: Food; // 最后吃到的食物，用于颜色更新
  lastEliminationTime?: number; // 最后一次消除的时间戳
  // 长度里程碑追踪
  universalFoodTriggered: boolean; // 是否已触发万能方块（长度10）
  bombFoodTriggered: boolean; // 是否已触发爆炸方块（长度20）
  lastEatenSpecialFood?: SpecialFood; // 最后吃到的特殊方块，用于特殊效果处理
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  moveInterval: number;
  foodCount: number;
  initialSnakeLength: number;
} 