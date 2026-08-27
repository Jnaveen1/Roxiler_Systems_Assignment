import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StarRating from '../components/StarRating';
import { Store, Star, Users, MapPin, Mail, RefreshCw, AlertCircle, Calendar } from 'lucide-react';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/owner/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch owner dashboard:', err);
      const msg = err.response?.data?.message || 'Failed to load store dashboard data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-medium">Loading store dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-16">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">Dashboard Unavailable</h2>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
            <button
              onClick={fetchDashboard}
              className="mt-6 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { store, averageRating, totalRatings, ratingDistribution, customerRatings } = dashboardData;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Store Owner Portal
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{store.name}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Performance metrics, rating distribution, and customer feedback history
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh Analytics
          </button>
        </div>

        {/* Assigned Store Info Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl border border-brand-100 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Store</p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{store.name}</h3>
              <p className="text-xs text-slate-500">{store.email}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Physical Address</p>
              <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">{store.address}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registration Date</p>
              <p className="text-xs text-slate-700 mt-1 font-medium">
                {new Date(store.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Average Customer Rating"
            value={averageRating ? `${averageRating} / 5.0` : 'No ratings'}
            icon={Star}
            color="amber"
            subtitle={averageRating ? 'Calculated across all ratings' : 'Waiting for first review'}
          />
          <StatCard
            title="Total Customer Reviews"
            value={totalRatings}
            icon={Users}
            color="emerald"
            subtitle="Total unique customer submissions"
          />
        </div>

        {/* Rating Breakdown & Customer History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Rating Distribution (5 Star Bars) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Rating Distribution
            </h3>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((starVal) => {
                const count = ratingDistribution?.[starVal] || 0;
                const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;

                return (
                  <div key={starVal} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="inline-flex items-center space-x-1 font-semibold text-slate-700">
                        <span>{starVal}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-slate-500">
                        {count} ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Feedback List */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Customer Rating History</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                List of customers who submitted reviews for your store
              </p>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Rating Given</th>
                    <th className="py-3 px-4">Date Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {customerRatings.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        No customer ratings submitted yet for your store.
                      </td>
                    </tr>
                  ) : (
                    customerRatings.map((r) => (
                      <tr key={r.ratingId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{r.user.name}</td>
                        <td className="py-3 px-4 text-slate-600">{r.user.email}</td>
                        <td className="py-3 px-4">
                          <StarRating value={r.value} readOnly size="sm" showText />
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(r.updatedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
