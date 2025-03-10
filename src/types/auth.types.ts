import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  id: string;
  user_metadata: {
    role: 'client' | 'trainer';
    first_name?: string;
    last_name?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
} 