import { useCallback } from 'react';
import { SnakeSegment, Direction, FoodColor } from '@/types/game';
import { DIRECTION_VECTORS } from '@/lib/constants';

/**
 * 蛇移动逻辑Hook
 * 
 * 核心设计：
 * 1. 蛇头（snake[0]）永远没有颜色，固定白色显示
 * 2. 身体段（snake[1+]）颜色由独立的bodyColors数组管理
 * 3. bodyColors[i] 对应 snake[i+1] 的颜色
 * 4. 移动时只管理位置，颜色由独立数组维护
 */
export function useSnakeMovement() {
  // 移动蛇（只处理位置，不处理颜色）
  const moveSnake = useCallback((snake: SnakeSegment[], direction: Direction): SnakeSegment[] => {
    const head = snake[0];
    const vector = DIRECTION_VECTORS[direction];
    
    // 计算新蛇头位置（永远没有颜色属性）
    const newHead: SnakeSegment = {
      x: head.x + vector.x,
      y: head.y + vector.y,
      // 蛇头永远不设置color属性
    };

    // 身体段跟随移动：新蛇头 + 原来的蛇（除了最后一段）
    const newSnake = [newHead, ...snake.slice(0, -1)];
    
    return newSnake;
  }, []);

  // 蛇吃食物时增长（只处理位置，颜色由外部管理）
  const growSnake = useCallback((snake: SnakeSegment[], direction: Direction): SnakeSegment[] => {
    const head = snake[0];
    const vector = DIRECTION_VECTORS[direction];
    
    // 计算新蛇头位置
    const newHead: SnakeSegment = {
      x: head.x + vector.x,
      y: head.y + vector.y,
      // 蛇头永远不设置color属性
    };

    // 蛇增长：新蛇头 + 原来的完整蛇身
    const newSnake = [newHead, ...snake];
    
    return newSnake;
  }, []);

  // 检查碰撞
  const checkCollision = useCallback((snake: SnakeSegment[], gridWidth: number, gridHeight: number): boolean => {
    const head = snake[0];
    
    // 检查撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
      return true;
    }
    
    // 检查撞自己（蛇头与身体段碰撞）
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    
    return false;
  }, []);

  return {
    moveSnake,
    growSnake,
    checkCollision,
  };
} 