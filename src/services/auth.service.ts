import { supabase } from '../lib/supabase';
import { ApiService, handleApiError } from './api.service';
import { AuthUser } from '../types/auth.types';

class AuthServiceClass extends ApiService {
  // Получение текущего пользователя
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      
      if (error) {
        throw handleApiError(error);
      }
      
      return data.user as AuthUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  // Вход в систему
  async signIn(email: string, password: string): Promise<AuthUser> {
    return this.request<{ user: AuthUser }>(async () => {
      return await this.supabase.auth.signInWithPassword({
        email,
        password
      });
    }).then(data => data.user);
  }
  
  // Выход из системы
  async signOut(): Promise<void> {
    return this.request(async () => {
      return await this.supabase.auth.signOut();
    }).then(() => {});
  }
  
  // Регистрация нового пользователя
  async signUp(email: string, password: string, userData: { 
    role: 'client' | 'trainer',
    first_name: string,
    last_name: string
  }): Promise<AuthUser> {
    return this.request<{ user: AuthUser }>(async () => {
      return await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
    }).then(data => data.user);
  }
  
  // Обновление данных пользователя
  async updateUserData(userData: Partial<AuthUser['user_metadata']>): Promise<AuthUser> {
    return this.request<{ user: AuthUser }>(async () => {
      return await this.supabase.auth.updateUser({
        data: userData
      });
    }).then(data => data.user);
  }
  
  // Сброс пароля
  async resetPassword(email: string): Promise<void> {
    return this.request(async () => {
      return await this.supabase.auth.resetPasswordForEmail(email);
    }).then(() => {});
  }
  
  // Проверка роли пользователя
  async hasRole(role: 'client' | 'trainer'): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.user_metadata?.role === role;
  }
}

// Экспортируем экземпляр сервиса
export const AuthService = new AuthServiceClass(); 