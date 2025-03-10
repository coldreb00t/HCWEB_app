import { ApiService } from './api.service';
import { Client, ClientProfile } from '../types/client.types';
import { AuthService } from './auth.service';

class ClientServiceClass extends ApiService {
  // Получение профиля клиента по ID пользователя
  async getClientByUserId(userId: string): Promise<Client> {
    return this.request<Client>(async () => {
      return await this.supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single();
    });
  }
  
  // Получение профиля клиента по ID клиента
  async getClientById(clientId: string): Promise<Client> {
    return this.request<Client>(async () => {
      return await this.supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
    });
  }
  
  // Получение профиля текущего клиента
  async getCurrentClient(): Promise<Client | null> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) return null;
      
      return await this.getClientByUserId(user.id);
    } catch (error) {
      console.error('Error getting current client:', error);
      return null;
    }
  }
  
  // Получение всех клиентов тренера
  async getTrainerClients(): Promise<Client[]> {
    return this.request<Client[]>(async () => {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('Пользователь не авторизован');
      
      return await this.supabase
        .from('clients')
        .select('*')
        .eq('trainer_id', user.id)
        .order('last_name', { ascending: true });
    });
  }
  
  // Создание нового клиента
  async createClient(clientData: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
    return this.request<Client>(async () => {
      return await this.supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
    });
  }
  
  // Обновление данных клиента
  async updateClient(clientId: string, clientData: Partial<Client>): Promise<Client> {
    return this.request<Client>(async () => {
      return await this.supabase
        .from('clients')
        .update(clientData)
        .eq('id', clientId)
        .select()
        .single();
    });
  }
  
  // Получение полного профиля клиента с связанными данными
  async getClientProfile(clientId: string): Promise<ClientProfile> {
    return this.request<ClientProfile>(async () => {
      const { data: client, error } = await this.supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (error) throw error;
      
      // Здесь можно добавить запросы для получения связанных данных
      // (измерения, тренировки, фото прогресса и т.д.)
      
      return { ...client };
    });
  }
}

// Экспортируем экземпляр сервиса
export const ClientService = new ClientServiceClass(); 