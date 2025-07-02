import React from 'react';
import { Food as FoodType } from '@/types/game';

interface FoodProps {
  food: FoodType;
}

/**
 * 美化的食物组件
 * 
 * 设计特点：
 * - 圆形设计，更加美观
 * - 渐变色彩，增加视觉层次
 * - 发光效果，吸引注意力
 * - 脉冲动画，增加活力
 * - 内部高光，增加3D效果
 */
export default function Food({ food }: FoodProps) {
  // 根据食物颜色定义渐变和发光效果
  const getFoodStyles = (color: string) => {
    switch (color) {
      case 'RED':
        return {
          background: 'radial-gradient(circle at 30% 30%, #ff6b6b, #e63946, #d62828)',
          boxShadow: '0 0 20px rgba(230, 57, 70, 0.8), 0 0 40px rgba(230, 57, 70, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(255, 107, 107, 0.6)'
        };
      case 'BLUE':
        return {
          background: 'radial-gradient(circle at 30% 30%, #74c0fc, #339af0, #1971c2)',
          boxShadow: '0 0 20px rgba(51, 154, 240, 0.8), 0 0 40px rgba(51, 154, 240, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(116, 192, 252, 0.6)'
        };
      case 'GREEN':
        return {
          background: 'radial-gradient(circle at 30% 30%, #8ce99a, #51cf66, #37b24d)',
          boxShadow: '0 0 20px rgba(81, 207, 102, 0.8), 0 0 40px rgba(81, 207, 102, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(140, 233, 154, 0.6)'
        };
      case 'YELLOW':
        return {
          background: 'radial-gradient(circle at 30% 30%, #ffd43b, #fab005, #f59f00)',
          boxShadow: '0 0 20px rgba(250, 176, 5, 0.8), 0 0 40px rgba(250, 176, 5, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(255, 212, 59, 0.6)'
        };
      case 'PURPLE':
        return {
          background: 'radial-gradient(circle at 30% 30%, #d0bfff, #9775fa, #7950f2)',
          boxShadow: '0 0 20px rgba(151, 117, 250, 0.8), 0 0 40px rgba(151, 117, 250, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(208, 191, 255, 0.6)'
        };
      default:
        return {
          background: 'radial-gradient(circle at 30% 30%, #ffffff, #e9ecef, #ced4da)',
          boxShadow: '0 0 20px rgba(206, 212, 218, 0.8), 0 0 40px rgba(206, 212, 218, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.6)'
        };
    }
  };

  const styles = getFoodStyles(food.color);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* 外层发光环 */}
      <div 
        className="absolute w-full h-full rounded-full opacity-30 animate-ping"
        style={{
          background: styles.background,
          filter: 'blur(4px)',
        }}
      />
      
      {/* 主体食物 */}
      <div
        className="relative w-4/5 h-4/5 rounded-full transform transition-all duration-300 hover:scale-110 animate-pulse"
        style={styles}
      >
        {/* 内部高光效果 */}
        <div 
          className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 70%, transparent 100%)'
          }}
        />
        
        {/* 次级高光 */}
        <div 
          className="absolute top-2 right-1 w-1 h-1 bg-white rounded-full opacity-40"
        />
      </div>
      
      {/* 底部阴影 */}
      <div 
        className="absolute bottom-0 w-3/4 h-1/4 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
          filter: 'blur(2px)',
        }}
      />
    </div>
  );
} 