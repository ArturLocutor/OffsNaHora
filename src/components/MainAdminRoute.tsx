import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface MainAdminRouteProps {
  children: React.ReactNode;
}

const MainAdminRoute: React.FC<MainAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isMainAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default MainAdminRoute;