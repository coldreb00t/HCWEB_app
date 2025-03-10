export interface ActivityEntry {
  id: string;
  client_id: string;
  date: string;
  activity_type: string;
  duration: number; // в минутах
  calories_burned?: number;
  distance?: number;
  notes?: string;
  created_at: string;
}

export interface DailyStats {
  date: string;
  total_duration: number;
  total_calories: number;
  activities: {
    [key: string]: {
      duration: number;
      calories: number;
      count: number;
    };
  };
}

export interface ActivityStats {
  totalMinutes: number;
  types: Record<string, number>;
  caloriesBurned?: number;
  activityByDate?: Record<string, number>;
  mostFrequentActivity?: string;
} 