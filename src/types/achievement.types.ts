import { ReactNode } from 'react';

export interface Achievement {
  title: string;
  description: string;
  icon: ReactNode;
  value: string;
  color: string;
  bgImage?: string;
  motivationalPhrase: string;
}

export interface AchievementStats {
  total: number;
  completed: number;
  recentAchievements?: Achievement[];
}

export interface UserStats {
  workouts: {
    totalCount: number;
    completedCount: number;
    totalVolume: number; // в кг
  };
  activities: {
    totalMinutes: number;
    types: Record<string, number>;
  };
  measurements: {
    currentWeight: number | null;
    initialWeight: number | null;
    weightChange: number | null;
  };
  achievements: {
    total: number;
    completed: number;
  };
} 