
export interface Meal {
  id: string;
  name: string;
  type: '早餐' | '午餐' | '晚餐' | '加餐';
  time: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
  insight?: string;
  createdAt?: string; // ISO 日期字符串，用于历史记录筛选
}

export interface UserStats {
  dailyGoal: number;
  consumed: number;
  macros: {
    protein: { current: number; goal: number };
    carbs: { current: number; goal: number };
    fat: { current: number; goal: number };
  };
  streak: number;
  weight: number;
}

export type View = 'splash' | 'home' | 'camera' | 'analysis' | 'profile' | 'diary' | 'reports' | 'login';

export interface AnalysisResult {
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  insight: string;
}
