export interface NutritionEntry {
  id: string;
  client_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  photo_url?: string;
  notes?: string;
  created_at: string;
}

export interface NutritionPhoto {
  id: string;
  nutrition_entry_id: string;
  photo_url: string;
  created_at: string;
}

export interface NutritionStats {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFats: number;
  mealFrequency: Record<string, number>;
  caloriesByDate: Record<string, number>;
} 