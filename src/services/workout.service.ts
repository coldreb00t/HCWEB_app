import { ApiService } from './api.service';
import { Workout, Program, Exercise, WorkoutStats } from '../types/workout.types';
import { AuthService } from './auth.service';
import { ClientService } from './client.service';

class WorkoutServiceClass extends ApiService {
  // Получение тренировки по ID
  async getWorkoutById(workoutId: string): Promise<Workout> {
    return this.request<Workout>(async () => {
      return await this.supabase
        .from('workouts')
        .select(`
          *,
          program:training_program_id (*)
        `)
        .eq('id', workoutId)
        .single();
    });
  }
  
  // Получение тренировок клиента
  async getClientWorkouts(clientId: string): Promise<Workout[]> {
    return this.request<Workout[]>(async () => {
      return await this.supabase
        .from('workouts')
        .select(`
          *,
          program:training_program_id (*)
        `)
        .eq('client_id', clientId)
        .order('start_time', { ascending: false });
    });
  }
  
  // Получение тренировок текущего клиента
  async getCurrentClientWorkouts(): Promise<Workout[]> {
    const client = await ClientService.getCurrentClient();
    if (!client) return [];
    
    return this.getClientWorkouts(client.id);
  }
  
  // Получение следующей тренировки клиента
  async getNextClientWorkout(clientId: string): Promise<Workout | null> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await this.supabase
        .from('workouts')
        .select(`
          *,
          program:training_program_id (*)
        `)
        .eq('client_id', clientId)
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(1)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Нет предстоящих тренировок
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting next workout:', error);
      return null;
    }
  }
  
  // Создание новой тренировки
  async createWorkout(workoutData: Omit<Workout, 'id' | 'created_at'>): Promise<Workout> {
    return this.request<Workout>(async () => {
      return await this.supabase
        .from('workouts')
        .insert(workoutData)
        .select()
        .single();
    });
  }
  
  // Обновление тренировки
  async updateWorkout(workoutId: string, workoutData: Partial<Workout>): Promise<Workout> {
    return this.request<Workout>(async () => {
      return await this.supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', workoutId)
        .select()
        .single();
    });
  }
  
  // Удаление тренировки
  async deleteWorkout(workoutId: string): Promise<void> {
    return this.request(async () => {
      return await this.supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
    }).then(() => {});
  }
  
  // Получение программы тренировок по ID
  async getProgramById(programId: string): Promise<Program> {
    return this.request<Program>(async () => {
      return await this.supabase
        .from('training_programs')
        .select(`
          *,
          exercises:program_exercises (*)
        `)
        .eq('id', programId)
        .single();
    });
  }
  
  // Получение программ тренировок клиента
  async getClientPrograms(clientId: string): Promise<Program[]> {
    return this.request<Program[]>(async () => {
      return await this.supabase
        .from('training_programs')
        .select(`
          *,
          exercises:program_exercises (*)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
    });
  }
  
  // Создание программы тренировок
  async createProgram(programData: Omit<Program, 'id' | 'created_at'>): Promise<Program> {
    return this.request<Program>(async () => {
      return await this.supabase
        .from('training_programs')
        .insert(programData)
        .select()
        .single();
    });
  }
  
  // Получение статистики тренировок клиента
  async getClientWorkoutStats(clientId: string): Promise<WorkoutStats> {
    try {
      // Получаем все тренировки клиента
      const { data: workouts, error } = await this.supabase
        .from('workouts')
        .select(`
          *,
          program:training_program_id (
            *,
            exercises:program_exercises (*)
          )
        `)
        .eq('client_id', clientId);
        
      if (error) throw error;
      
      if (!workouts || workouts.length === 0) {
        return {
          totalCount: 0,
          completedCount: 0,
          totalVolume: 0
        };
      }
      
      // Подсчитываем статистику
      const totalCount = workouts.length;
      const completedCount = workouts.filter((w: Workout) => w.completed).length;
      let totalVolume = 0;
      
      // Подсчет общего объема тренировок
      workouts.forEach((workout: Workout) => {
        if (workout.program && workout.program.exercises) {
          workout.program.exercises.forEach((exercise: Exercise) => {
            if (exercise.sets) {
              exercise.sets.forEach(set => {
                const weight = parseFloat(set.weight) || 0;
                const reps = parseFloat(set.reps) || 0;
                totalVolume += weight * reps;
              });
            }
          });
        }
      });
      
      return {
        totalCount,
        completedCount,
        totalVolume
      };
    } catch (error) {
      console.error('Error getting workout stats:', error);
      return {
        totalCount: 0,
        completedCount: 0,
        totalVolume: 0
      };
    }
  }
}

// Экспортируем экземпляр сервиса
export const WorkoutService = new WorkoutServiceClass(); 