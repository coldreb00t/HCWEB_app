import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Базовый класс для обработки ошибок API
export class ApiError extends Error {
  code: string;
  details?: string;

  constructor(message: string, code: string, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

// Функция для обработки ошибок API
export const handleApiError = (error: any, customMessage?: string): ApiError => {
  console.error(error);
  
  let message = customMessage || 'Произошла ошибка';
  let code = 'UNKNOWN_ERROR';
  
  if (error.code) {
    code = error.code;
    
    if (error.code === 'PGRST116') {
      message = 'Запрашиваемые данные не найдены';
    } else if (error.code === 'PGRST301') {
      message = 'У вас нет прав для выполнения этого действия';
    } else if (error.code === 'PGRST204') {
      message = 'Неверный формат данных';
    }
  }
  
  toast.error(message);
  return new ApiError(message, code, error.details);
};

// Базовый класс для сервисов API
export class ApiService {
  protected supabase = supabase;
  
  // Метод для выполнения запроса с обработкой ошибок
  protected async request<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    try {
      const { data, error } = await operation();
      
      if (error) {
        throw handleApiError(error);
      }
      
      if (data === null) {
        throw handleApiError({ code: 'DATA_NULL' }, 'Данные не найдены');
      }
      
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw handleApiError(error);
    }
  }
} 