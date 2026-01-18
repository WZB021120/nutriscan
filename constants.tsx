
import { Meal, UserStats } from './types';

export const INITIAL_STATS: UserStats = {
  dailyGoal: 2000,
  consumed: 750,
  macros: {
    protein: { current: 85, goal: 140 },
    carbs: { current: 120, goal: 250 },
    fat: { current: 45, goal: 70 }
  },
  streak: 12,
  weight: 65
};

export const MOCK_MEALS: Meal[] = [
  {
    id: '1',
    name: '燕麦碗',
    type: '早餐',
    time: '8:30 AM',
    calories: 450,
    macros: { protein: 15, carbs: 65, fat: 12 },
    imageUrl: 'https://picsum.photos/seed/oatmeal/200/200'
  },
  {
    id: '2',
    name: '苹果与花生酱',
    type: '加餐',
    time: '11:00 AM',
    calories: 120,
    macros: { protein: 4, carbs: 18, fat: 8 },
    imageUrl: 'https://picsum.photos/seed/apple/200/200'
  },
  {
    id: '3',
    name: '烤鸡肉沙拉',
    type: '午餐',
    time: '1:15 PM',
    calories: 520,
    macros: { protein: 38, carbs: 12, fat: 22 },
    imageUrl: 'https://picsum.photos/seed/salad/200/200'
  }
];
