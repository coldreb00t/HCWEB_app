import { ApiService } from './api.service';
import { ActivityEntry, ActivityStats, DailyStats } from '../types/activity.types';
import { ClientService } from './client.service';

class ActivityServiceClass extends ApiService {
  // Получение активностей клиента
  async getClientActivities(clientId: string): Promise<ActivityEntry[]> {
    return this.request<ActivityEntry[]>(async () => {
      return await this.supabase
        .from('client_activities')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });
    });
  }
  
  // Получение активностей текущего клиента
  async getCurrentClientActivities(): Promise<ActivityEntry[]> {
    const client = await ClientService.getCurrentClient();
    if (!client) return [];
    
    return this.getClientActivities(client.id);
  }
  
  // Создание новой активности
  async createActivity(activityData: Omit<ActivityEntry, 'id' | 'created_at'>): Promise<ActivityEntry> {
    return this.request<ActivityEntry>(async () => {
      return await this.supabase
        .from('client_activities')
        .insert(activityData)
        .select()
        .single();
    });
  }
  
  // Обновление активности
  async updateActivity(activityId: string, activityData: Partial<ActivityEntry>): Promise<ActivityEntry> {
    return this.request<ActivityEntry>(async () => {
      return await this.supabase
        .from('client_activities')
        .update(activityData)
        .eq('id', activityId)
        .select()
        .single();
    });
  }
  
  // Удаление активности
  async deleteActivity(activityId: string): Promise<void> {
    return this.request(async () => {
      return await this.supabase
        .from('client_activities')
        .delete()
        .eq('id', activityId);
    }).then(() => {});
  }
  
  // Получение статистики активности клиента
  async getClientActivityStats(clientId: string): Promise<ActivityStats> {
    try {
      const activities = await this.getClientActivities(clientId);
      
      if (!activities || activities.length === 0) {
        return {
          totalMinutes: 0,
          types: {}
        };
      }
      
      // Подсчет общего времени и группировка по типам
      let totalMinutes = 0;
      const activityTypes: Record<string, number> = {};
      
      activities.forEach(activity => {
        totalMinutes += activity.duration;
        
        // Группируем по типам активности
        if (!activityTypes[activity.activity_type]) {
          activityTypes[activity.activity_type] = 0;
        }
        activityTypes[activity.activity_type] += activity.duration;
      });
      
      // Находим наиболее частую активность
      let mostFrequentActivity = '';
      let maxDuration = 0;
      
      Object.entries(activityTypes).forEach(([type, duration]) => {
        if (duration > maxDuration) {
          maxDuration = duration;
          mostFrequentActivity = type;
        }
      });
      
      // Подсчет сожженных калорий (если есть данные)
      const caloriesBurned = activities.reduce((total, activity) => {
        return total + (activity.calories_burned || 0);
      }, 0);
      
      // Группировка активности по датам
      const activityByDate: Record<string, number> = {};
      
      activities.forEach(activity => {
        const date = activity.date.split('T')[0]; // Получаем только дату
        if (!activityByDate[date]) {
          activityByDate[date] = 0;
        }
        activityByDate[date] += activity.duration;
      });
      
      return {
        totalMinutes,
        types: activityTypes,
        caloriesBurned,
        activityByDate,
        mostFrequentActivity
      };
    } catch (error) {
      console.error('Error getting activity stats:', error);
      return {
        totalMinutes: 0,
        types: {}
      };
    }
  }
  
  // Получение ежедневной статистики активности
  async getDailyStats(clientId: string, date: string): Promise<DailyStats> {
    try {
      const { data: activities, error } = await this.supabase
        .from('client_activities')
        .select('*')
        .eq('client_id', clientId)
        .eq('date', date);
        
      if (error) throw error;
      
      if (!activities || activities.length === 0) {
        return {
          date,
          total_duration: 0,
          total_calories: 0,
          activities: {}
        };
      }
      
      let total_duration = 0;
      let total_calories = 0;
      const activityStats: Record<string, { duration: number; calories: number; count: number }> = {};
      
      activities.forEach(activity => {
        total_duration += activity.duration;
        total_calories += activity.calories_burned || 0;
        
        if (!activityStats[activity.activity_type]) {
          activityStats[activity.activity_type] = {
            duration: 0,
            calories: 0,
            count: 0
          };
        }
        
        activityStats[activity.activity_type].duration += activity.duration;
        activityStats[activity.activity_type].calories += activity.calories_burned || 0;
        activityStats[activity.activity_type].count += 1;
      });
      
      return {
        date,
        total_duration,
        total_calories,
        activities: activityStats
      };
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return {
        date,
        total_duration: 0,
        total_calories: 0,
        activities: {}
      };
    }
  }
}

// Экспортируем экземпляр сервиса
export const ActivityService = new ActivityServiceClass(); 