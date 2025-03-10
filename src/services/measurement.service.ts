import { ApiService } from './api.service';
import { Measurement, BodyMeasurement, MeasurementPhoto, MeasurementStats } from '../types/measurement.types';
import { ClientService } from './client.service';

class MeasurementServiceClass extends ApiService {
  // Получение измерений клиента
  async getClientMeasurements(clientId: string): Promise<Measurement[]> {
    return this.request<Measurement[]>(async () => {
      return await this.supabase
        .from('measurements')
        .select(`
          *,
          body_measurements (*)
        `)
        .eq('client_id', clientId)
        .order('date', { ascending: false });
    });
  }
  
  // Получение измерений текущего клиента
  async getCurrentClientMeasurements(): Promise<Measurement[]> {
    const client = await ClientService.getCurrentClient();
    if (!client) return [];
    
    return this.getClientMeasurements(client.id);
  }
  
  // Создание нового измерения
  async createMeasurement(measurementData: Omit<Measurement, 'id' | 'created_at'>, 
                           bodyMeasurementData?: Omit<BodyMeasurement, 'id' | 'measurement_id' | 'created_at'>): Promise<Measurement> {
    return this.request<Measurement>(async () => {
      // Создаем запись измерения
      const { data: measurement, error } = await this.supabase
        .from('measurements')
        .insert(measurementData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Если есть данные о измерениях тела, создаем запись
      if (bodyMeasurementData && measurement) {
        const { error: bodyError } = await this.supabase
          .from('body_measurements')
          .insert({
            ...bodyMeasurementData,
            measurement_id: measurement.id
          });
          
        if (bodyError) throw bodyError;
      }
      
      // Получаем полные данные с связанными измерениями тела
      const { data: fullMeasurement, error: getMeasurementError } = await this.supabase
        .from('measurements')
        .select(`
          *,
          body_measurements (*)
        `)
        .eq('id', measurement.id)
        .single();
        
      if (getMeasurementError) throw getMeasurementError;
      
      return fullMeasurement;
    });
  }
  
  // Получение измерения по ID
  async getMeasurementById(measurementId: string): Promise<Measurement> {
    return this.request<Measurement>(async () => {
      return await this.supabase
        .from('measurements')
        .select(`
          *,
          body_measurements (*)
        `)
        .eq('id', measurementId)
        .single();
    });
  }
  
  // Обновление измерения
  async updateMeasurement(measurementId: string, 
                          measurementData: Partial<Measurement>,
                          bodyMeasurementData?: Partial<BodyMeasurement>): Promise<Measurement> {
    return this.request<Measurement>(async () => {
      // Обновляем запись измерения
      const { error } = await this.supabase
        .from('measurements')
        .update(measurementData)
        .eq('id', measurementId);
        
      if (error) throw error;
      
      // Если есть данные о измерениях тела, обновляем запись
      if (bodyMeasurementData) {
        const { data: bodyMeasurement } = await this.supabase
          .from('body_measurements')
          .select('id')
          .eq('measurement_id', measurementId)
          .single();
          
        if (bodyMeasurement) {
          const { error: bodyError } = await this.supabase
            .from('body_measurements')
            .update(bodyMeasurementData)
            .eq('id', bodyMeasurement.id);
            
          if (bodyError) throw bodyError;
        } else {
          const { error: bodyError } = await this.supabase
            .from('body_measurements')
            .insert({
              ...bodyMeasurementData,
              measurement_id: measurementId
            });
            
          if (bodyError) throw bodyError;
        }
      }
      
      // Получаем обновленные данные
      const { data: updatedMeasurement, error: getMeasurementError } = await this.supabase
        .from('measurements')
        .select(`
          *,
          body_measurements (*)
        `)
        .eq('id', measurementId)
        .single();
        
      if (getMeasurementError) throw getMeasurementError;
      
      return updatedMeasurement;
    });
  }
  
  // Удаление измерения
  async deleteMeasurement(measurementId: string): Promise<void> {
    return this.request(async () => {
      return await this.supabase
        .from('measurements')
        .delete()
        .eq('id', measurementId);
    }).then(() => {});
  }
  
  // Получение фотографий измерений клиента
  async getClientMeasurementPhotos(clientId: string): Promise<MeasurementPhoto[]> {
    return this.request<MeasurementPhoto[]>(async () => {
      return await this.supabase
        .from('measurement_photos')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });
    });
  }
  
  // Загрузка фотографии измерения
  async uploadMeasurementPhoto(clientId: string, file: File, type: MeasurementPhoto['type'], date: string, notes?: string): Promise<MeasurementPhoto> {
    return this.request<MeasurementPhoto>(async () => {
      // Генерируем уникальное имя файла
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}/${Date.now()}.${fileExt}`;
      const filePath = `measurement_photos/${fileName}`;
      
      // Загружаем файл
      const { error: uploadError } = await this.supabase.storage
        .from('photos')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Получаем публичную ссылку на файл
      const { data: { publicUrl } } = this.supabase.storage
        .from('photos')
        .getPublicUrl(filePath);
      
      // Создаем запись о фотографии
      const photoData = {
        client_id: clientId,
        photo_url: publicUrl,
        date,
        type,
        notes
      };
      
      const { data, error } = await this.supabase
        .from('measurement_photos')
        .insert(photoData)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    });
  }
  
  // Получение статистики измерений клиента
  async getClientMeasurementStats(clientId: string): Promise<MeasurementStats> {
    try {
      const { data: measurements, error } = await this.supabase
        .from('measurements')
        .select(`
          *,
          body_measurements (*)
        `)
        .eq('client_id', clientId)
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      if (!measurements || measurements.length === 0) {
        return {
          currentWeight: null,
          initialWeight: null,
          weightChange: null
        };
      }
      
      // Получаем первое и последнее измерение
      const initialMeasurement = measurements[0];
      const currentMeasurement = measurements[measurements.length - 1];
      
      // Вычисляем изменение веса
      const initialWeight = initialMeasurement.weight || null;
      const currentWeight = currentMeasurement.weight || null;
      const weightChange = (initialWeight !== null && currentWeight !== null) 
        ? currentWeight - initialWeight 
        : null;
      
      // Собираем данные для графиков
      const dates = measurements.map((m: Measurement) => m.date);
      const bodyMeasurements: MeasurementStats['bodyMeasurements'] = {
        chest: [],
        waist: [],
        hips: [],
        arms: [],
        thighs: []
      };
      
      // Заполняем данные измерений тела
      measurements.forEach((measurement: Measurement) => {
        if (measurement.body_measurements && measurement.body_measurements.length > 0) {
          const bodyMeasurement = measurement.body_measurements[0];
          
          if (bodyMeasurement.chest) bodyMeasurements.chest?.push(bodyMeasurement.chest);
          if (bodyMeasurement.waist) bodyMeasurements.waist?.push(bodyMeasurement.waist);
          if (bodyMeasurement.hips) bodyMeasurements.hips?.push(bodyMeasurement.hips);
          if (bodyMeasurement.arms) bodyMeasurements.arms?.push(bodyMeasurement.arms);
          if (bodyMeasurement.thighs) bodyMeasurements.thighs?.push(bodyMeasurement.thighs);
        }
      });
      
      return {
        currentWeight,
        initialWeight,
        weightChange,
        bodyFatPercentage: currentMeasurement.body_fat_percentage || null,
        bodyMeasurements,
        dates
      };
    } catch (error) {
      console.error('Error getting measurement stats:', error);
      return {
        currentWeight: null,
        initialWeight: null,
        weightChange: null
      };
    }
  }
}

// Экспортируем экземпляр сервиса
export const MeasurementService = new MeasurementServiceClass(); 