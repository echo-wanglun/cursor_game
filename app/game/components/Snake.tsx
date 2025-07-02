import React from 'react';
import { SnakeSegment, FoodColor } from '@/types/game';

interface SnakeProps {
  snake: SnakeSegment[];
  bodyColors: FoodColor[];
  cellX: number;
  cellY: number;
}

/**
 * 超级炫酷的蛇渲染组件
 * 
 * 设计特点：
 * - 蛇头：霓虹白色，带有发光眼睛和脉冲效果
 * - 蛇身：渐变色彩，发光边框，3D立体感
 * - 动画效果：呼吸动画，发光脉冲
 * - 视觉层次：内部高光，外部光环
 */
export default function Snake({ snake, bodyColors, cellX, cellY }: SnakeProps) {
  // 找到当前位置的蛇身段
  const segmentIndex = snake.findIndex(seg => seg.x === cellX && seg.y === cellY);
  
  if (segmentIndex === -1) return null;

  const isHead = segmentIndex === 0;
  
  // 蛇头没有颜色，身体段从bodyColors数组获取颜色
  const color = isHead ? undefined : bodyColors[segmentIndex - 1];

  // 获取蛇身段的炫酷样式
  const getSegmentStyles = (color: FoodColor) => {
    switch (color) {
      case 'RED':
        return {
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #d63031 100%)',
          boxShadow: '0 0 15px rgba(255, 107, 107, 0.8), 0 0 30px rgba(255, 107, 107, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(255, 107, 107, 0.9)'
        };
      case 'BLUE':
        return {
          background: 'linear-gradient(135deg, #74c0fc 0%, #339af0 50%, #1971c2 100%)',
          boxShadow: '0 0 15px rgba(116, 192, 252, 0.8), 0 0 30px rgba(116, 192, 252, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(116, 192, 252, 0.9)'
        };
      case 'GREEN':
        return {
          background: 'linear-gradient(135deg, #8ce99a 0%, #51cf66 50%, #37b24d 100%)',
          boxShadow: '0 0 15px rgba(140, 233, 154, 0.8), 0 0 30px rgba(140, 233, 154, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(140, 233, 154, 0.9)'
        };
      case 'YELLOW':
        return {
          background: 'linear-gradient(135deg, #ffd43b 0%, #fab005 50%, #f59f00 100%)',
          boxShadow: '0 0 15px rgba(255, 212, 59, 0.8), 0 0 30px rgba(255, 212, 59, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(255, 212, 59, 0.9)'
        };
      case 'PURPLE':
        return {
          background: 'linear-gradient(135deg, #d0bfff 0%, #9775fa 50%, #7950f2 100%)',
          boxShadow: '0 0 15px rgba(208, 191, 255, 0.8), 0 0 30px rgba(208, 191, 255, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(208, 191, 255, 0.9)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #e9ecef 0%, #ced4da 50%, #adb5bd 100%)',
          boxShadow: '0 0 15px rgba(206, 212, 218, 0.8), 0 0 30px rgba(206, 212, 218, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(206, 212, 218, 0.9)'
        };
    }
  };

  if (isHead) {
    // 超级炫酷的蛇头
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 外层发光环 */}
        <div 
          className="absolute w-full h-full rounded-lg opacity-40 animate-ping"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            filter: 'blur(3px)',
          }}
        />
        
        {/* 蛇头主体 */}
        <div
          className="relative w-full h-full rounded-lg transform transition-all duration-200 animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 30%, #e9ecef 70%, #dee2e6 100%)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.5), inset 0 3px 6px rgba(255, 255, 255, 0.4)',
            border: '3px solid rgba(255, 255, 255, 0.95)'
          }}
        >
          {/* 蛇头高光 */}
          <div 
            className="absolute top-1 left-1 w-3 h-2 rounded-full opacity-80"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 70%, transparent 100%)'
            }}
          />
          
          {/* 炫酷发光眼睛 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-1.5">
              {/* 左眼 */}
              <div className="relative">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, #ff3838 0%, #c92a2a 50%, #000000 100%)',
                    boxShadow: '0 0 8px rgba(255, 56, 56, 0.8), 0 0 16px rgba(255, 56, 56, 0.4)'
                  }}
                />
                <div 
                  className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white rounded-full opacity-90"
                />
              </div>
              
              {/* 右眼 */}
              <div className="relative">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, #ff3838 0%, #c92a2a 50%, #000000 100%)',
                    boxShadow: '0 0 8px rgba(255, 56, 56, 0.8), 0 0 16px rgba(255, 56, 56, 0.4)'
                  }}
                />
                <div 
                  className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white rounded-full opacity-90"
                />
              </div>
            </div>
          </div>
          
          {/* 蛇头装饰纹理 */}
          <div 
            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 rounded-full opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
            }}
          />
        </div>
      </div>
    );
  } else {
    // 超级炫酷的蛇身
    const styles = color ? getSegmentStyles(color) : getSegmentStyles('RED');
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 外层发光环 */}
        <div 
          className="absolute w-full h-full rounded-md opacity-30 animate-pulse"
          style={{
            background: styles.background,
            filter: 'blur(4px)',
          }}
        />
        
        {/* 蛇身主体 */}
        <div
          className="relative w-full h-full rounded-md transform transition-all duration-300 hover:scale-105"
          style={styles}
        >
          {/* 内部高光 */}
          <div 
            className="absolute top-1 left-1 w-3 h-1.5 rounded-full opacity-70"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 70%, transparent 100%)'
            }}
          />
          
          {/* 次级高光 */}
          <div 
            className="absolute top-2 right-1 w-1.5 h-1 rounded-full opacity-50"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)'
            }}
          />
          
          {/* 蛇身纹理 */}
          <div 
            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 rounded-full opacity-25"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
            }}
          />
          
          {/* 呼吸动画的内部光点 */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full opacity-60 animate-ping"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)'
            }}
          />
        </div>
        
        {/* 底部阴影 */}
        <div 
          className="absolute bottom-0 w-4/5 h-1/3 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
      </div>
    );
  }
} 