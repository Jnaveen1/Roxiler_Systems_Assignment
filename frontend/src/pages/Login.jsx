import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultRouteForRole } from '../components/ProtectedRoute';
import { Store, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck, Store as StoreIcon } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionExpired = searchParams.get('session_expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email.trim(), password.trim());
      const targetRoute = getDefaultRouteForRole(user.role);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid login credentials. Please ensure case sensitivity (e.g. Admin@123).';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo Credentials Helper
  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-brand-600 rounded-2xl text-white shadow-lg shadow-brand-500/30">
            <Store className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Store Rating System
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Sign in to access your role-specific dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 sm:px-10">
          {sessionExpired && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your session has expired. Please log in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Instant Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@storerating.com', 'Admin@123')}
                className="flex flex-col items-center p-2 rounded-xl border border-purple-100 bg-purple-50/60 hover:bg-purple-100/80 transition-colors text-purple-700"
              >
                <ShieldCheck className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-bold">Admin</span>
                <span className="text-[10px] text-purple-500 font-normal">Admin@123</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('owner1@storerating.com', 'Owner@123')}
                className="flex flex-col items-center p-2 rounded-xl border border-amber-100 bg-amber-50/60 hover:bg-amber-100/80 transition-colors text-amber-700"
              >
                <StoreIcon className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-bold">Store Owner</span>
                <span className="text-[10px] text-amber-500 font-normal">Owner@123</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('user1@storerating.com', 'User@123')}
                className="flex flex-col items-center p-2 rounded-xl border border-blue-100 bg-blue-50/60 hover:bg-blue-100/80 transition-colors text-blue-700"
              >
                <UserCheck className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-bold">Customer</span>
                <span className="text-[10px] text-blue-500 font-normal">User@123</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Register as Customer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
