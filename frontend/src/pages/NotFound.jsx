import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultRouteForRole } from '../components/ProtectedRoute';
import { Store, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const { role } = useAuth();
  const defaultRoute = getDefaultRouteForRole(role);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-md">
        <div className="p-4 bg-brand-50 text-brand-600 rounded-3xl inline-block mb-4 border border-brand-100">
          <Store className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mt-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The page you are trying to access does not exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            to={defaultRoute}
            className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
