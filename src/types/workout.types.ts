export interface ExerciseSet {
  set_number: number;
  reps: string;
  weight: string;
  completed?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  video_url?: string;
  sets: ExerciseSet[];
  notes?: string;
  category?: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Program {
  id: string;
  title: string;
  description?: string;
  exercises: Exercise[];
  created_at?: string;
  trainer_id?: string;
  client_id?: string;
}

export interface Workout {
  id: string;
  client_id: string;
  trainer_id: string;
  start_time: string;
  end_time: string;
  title: string;
  notes?: string;
  created_at: string;
  training_program_id?: string;
  program?: Program | null;
  completed?: boolean;
  completion_date?: string;
  feedback?: string;
  rating?: number;
}

export interface WorkoutStats {
  totalCount: number;
  completedCount: number;
  totalVolume: number; // в кг
  exerciseFrequency?: Record<string, number>;
  volumeByMuscleGroup?: Record<string, number>;
} 