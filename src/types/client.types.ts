export interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  goals?: string;
  notes?: string;
  avatar_url?: string;
}

export interface ClientProfile extends Client {
  measurements?: ClientMeasurement[];
  workouts?: ClientWorkout[];
  progress_photos?: ProgressPhoto[];
}

export interface ClientMeasurement {
  id: string;
  client_id: string;
  date: string;
  weight?: number;
  height?: number;
  body_fat_percentage?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  created_at: string;
}

export interface ClientWorkout {
  id: string;
  client_id: string;
  trainer_id: string;
  start_time: string;
  end_time: string;
  title: string;
  notes?: string;
  created_at: string;
  completed?: boolean;
}

export interface ProgressPhoto {
  id: string;
  client_id: string;
  photo_url: string;
  date: string;
  type: 'front' | 'side' | 'back' | 'other';
  notes?: string;
  created_at: string;
} 