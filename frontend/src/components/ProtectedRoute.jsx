import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const getDefaultRouteForRole = (role) => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'STORE_OWNER':
      return '/owner/dashboard';
    case 'NORMAL_USER':
      return '/stores';
    default:
      return '/login';
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // User tries to access forbidden role route -> redirect to their default dashboard
    const targetRoute = getDefaultRouteForRole(role);
    return <Navigate to={targetRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;
