import React from 'react';
import { Food as FoodType } from '@/types/game';
import { COLOR_CLASS_MAP } from '@/lib/constants';

interface FoodProps {
  food: FoodType;
}

export default function Food({ food }: FoodProps) {
  return (
    <div
      className={`absolute inset-0 rounded-sm ${COLOR_CLASS_MAP[food.color]} border border-opacity-50 border-white`}
    />
  );
} 