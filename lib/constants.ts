import { GameConfig, FoodColor } from '@/types/game';

// 游戏配置常量
export const GAME_CONFIG: GameConfig = {
  gridWidth: 20,
  gridHeight: 20,
  moveInterval: 250,
  foodCount: 5,
  initialSnakeLength: 2,
};

// 食物颜色配置
export const FOOD_COLORS: FoodColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];

// 颜色映射到CSS类名
export const COLOR_CLASS_MAP: Record<FoodColor, string> = {
  RED: 'bg-red-500',
  BLUE: 'bg-blue-500',
  GREEN: 'bg-green-500',
  YELLOW: 'bg-yellow-500',
  PURPLE: 'bg-purple-500',
};

// 方向键映射
export const KEY_DIRECTION_MAP = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
} as const;

// 方向向量
export const DIRECTION_VECTORS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const;

// 相反方向映射（用于防止反向操作）
export const OPPOSITE_DIRECTIONS = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
} as const; 