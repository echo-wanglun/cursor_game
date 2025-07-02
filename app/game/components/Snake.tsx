import React from 'react';
import { SnakeSegment } from '@/types/game';
import { COLOR_CLASS_MAP } from '@/lib/constants';

interface SnakeProps {
  snake: SnakeSegment[];
  cellX: number;
  cellY: number;
}

/**
 * 蛇的渲染组件
 * 
 * 核心设计原则：
 * 1. 蛇头：固定白色外观，不参与颜色变化和消除逻辑
 * 2. 蛇身：根据segment.color渲染对应颜色，参与消除匹配
 * 3. 蛇头永远是snake[0]，其余为身体段
 */
export default function Snake({ snake, cellX, cellY }: SnakeProps) {
  // 找到当前位置的蛇身段
  const segment = snake.find((seg, index) => seg.x === cellX && seg.y === cellY);
  
  if (!segment) return null;

  // 判断是否为蛇头（永远是数组第一个元素）
  const isHead = snake[0].x === cellX && snake[0].y === cellY;
  
  // 渲染调试日志
  const segmentIndex = snake.findIndex(seg => seg.x === cellX && seg.y === cellY);
  console.log('🎭 Snake 渲染:', {
    position: { x: cellX, y: cellY },
    isHead,
    segmentIndex,
    segmentColor: segment.color,
    hasColor: !!segment.color
  });
  
  // 确定使用的CSS类
  const cssClass = isHead 
    ? 'bg-white border-2 border-gray-300' // 蛇头：固定白色 + 灰色边框
    : segment.color 
      ? COLOR_CLASS_MAP[segment.color]     // 身体：根据颜色渲染
      : 'bg-gray-400';                     // 身体：默认灰色（无颜色时）
      
  console.log('🎨 CSS类选择:', {
    position: { x: cellX, y: cellY },
    isHead,
    segmentColor: segment.color,
    selectedCssClass: cssClass,
    colorMapping: segment.color ? COLOR_CLASS_MAP[segment.color] : 'none'
  });

  return (
    <div
      className={`absolute inset-0 rounded-sm ${cssClass}`}
    >
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