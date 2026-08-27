import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import { Search, MapPin, Building2, Star, CheckCircle2, AlertCircle, RefreshCw, ArrowUpDown } from 'lucide-react';

const NormalUserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [nameSearch, setNameSearch] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState(null); // { type: 'success'|'error', text: '' }
  const [submittingRatingFor, setSubmittingRatingFor] = useState(null);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/stores', {
        params: {
          name: nameSearch,
          address: addressSearch,
          sortBy,
          sortOrder,
        },
      });
      if (res.data.success) {
        setStores(res.data.data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  }, [nameSearch, addressSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Handle rating submission/update
  const handleRatingChange = async (storeId, newRatingValue) => {
    setSubmittingRatingFor(storeId);
    setToastMessage(null);

    try {
      const res = await api.post(`/stores/${storeId}/rate`, { value: newRatingValue });
      if (res.data.success) {
        setToastMessage({
          type: 'success',
          text: `Your rating of ${newRatingValue} star${newRatingValue > 1 ? 's' : ''} was saved!`,
        });

        // Optimistically update store state locally
        setStores((prevStores) =>
          prevStores.map((s) => {
            if (s.id === storeId) {
              return {
                ...s,
                userSubmittedRating: newRatingValue,
                overallRating: res.data.data.overallRating,
                totalRatingsCount: res.data.data.totalRatingsCount,
              };
            }
            return s;
          })
        );
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating. Please try again.';
      setToastMessage({ type: 'error', text: msg });
    } finally {
      setSubmittingRatingFor(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-center space-x-3 transition-all duration-300 animate-slide-in ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-white" />
            )}
            <span className="text-xs font-semibold">{toastMessage.text}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Explore Stores</h1>
            <p className="text-xs text-slate-500 mt-1">
              Discover local stores, view overall customer ratings, and rate your experiences
            </p>
          </div>
          <button
            onClick={fetchStores}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh Stores
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search by Store Name */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="Search by store name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Search by Store Address */}
          <div className="sm:col-span-4 relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              placeholder="Search by city, address..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-3">
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by);
                  setSortOrder(order);
                }}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="overallRating-desc">Highest Rated</option>
                <option value="overallRating-asc">Lowest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Store Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-medium">Fetching stores directory...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center max-w-md mx-auto my-8">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Stores Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No store matching your search criteria was found. Try clearing your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between"
              >
                {/* Store Header */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-brand-50 text-brand-600 rounded-xl border border-brand-100 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base line-clamp-1">{store.name}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{store.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mt-4 flex items-start space-x-2 text-slate-600 text-xs">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{store.address}</span>
                  </div>

                  {/* Overall Rating Section */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Overall Rating</span>
                    {store.overallRating !== null ? (
                      <div className="flex items-center space-x-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-700">{store.overallRating}</span>
                        <span className="text-[11px] text-amber-600 font-normal">
                          ({store.totalRatingsCount})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl font-medium">
                        No ratings yet
                      </span>
                    )}
                  </div>
                </div>

                {/* User Interactive Rating Section */}
                <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 p-4 rounded-b-2xl flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Your Rating</span>
                    {store.userSubmittedRating && (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Rated {store.userSubmittedRating} Stars
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <StarRating
                      value={store.userSubmittedRating || 0}
                      onChange={(val) => handleRatingChange(store.id, val)}
                      size="lg"
                    />
                    <span className="text-[11px] text-slate-400 italic">
                      {submittingRatingFor === store.id ? 'Saving...' : 'Click star to submit'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NormalUserStores;
