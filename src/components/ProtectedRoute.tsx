import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { AuthUser } from '../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'client' | 'trainer';
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setUserRole(currentUser.user_metadata.role);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-orange-400 to-gray-500 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return <>{children}</>;
}