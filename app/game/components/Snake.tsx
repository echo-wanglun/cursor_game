import React from 'react';
import { SnakeSegment, FoodColor } from '@/types/game';
import { COLOR_CLASS_MAP } from '@/lib/constants';

interface SnakeProps {
  snake: SnakeSegment[];
  bodyColors: FoodColor[];
  cellX: number;
  cellY: number;
}

/**
 * 蛇的渲染组件
 * 
 * 核心设计原则：
 * 1. 蛇头：固定白色外观，不参与颜色变化和消除逻辑
 * 2. 蛇身：根据bodyColors数组渲染对应颜色，参与消除匹配
 * 3. 蛇头永远是snake[0]，其余为身体段
 */
export default function Snake({ snake, bodyColors, cellX, cellY }: SnakeProps) {
  // 找到当前位置的蛇身段
  const segmentIndex = snake.findIndex(seg => seg.x === cellX && seg.y === cellY);
  
  if (segmentIndex === -1) return null;

  const isHead = segmentIndex === 0;
  
  // 蛇头没有颜色，身体段从bodyColors数组获取颜色
  const color = isHead ? undefined : bodyColors[segmentIndex - 1];
  
  // 确定使用的CSS类
  const cssClass = isHead 
    ? 'bg-white border-2 border-gray-300' // 蛇头：固定白色 + 灰色边框
    : color 
      ? COLOR_CLASS_MAP[color]           // 身体：根据颜色渲染
      : 'bg-gray-400';                   // 身体：默认灰色（无颜色时）

  return (
    <div className={`absolute inset-0 rounded-sm ${cssClass}`}>
      {/* 蛇头眼睛 - 只有蛇头才显示 */}
      {isHead && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
} 