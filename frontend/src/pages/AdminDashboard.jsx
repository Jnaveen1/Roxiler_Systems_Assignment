import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StarRating from '../components/StarRating';
import {
  Users,
  Store,
  Star,
  Search,
  UserPlus,
  Plus,
  Filter,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Building,
  Mail,
  MapPin,
  Lock,
  User,
  Shield,
  RefreshCw,
} from 'lucide-react';

const AdminDashboard = () => {
  // Stats State
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stores'

  // User Management State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('createdAt');
  const [userSortOrder, setUserSortOrder] = useState('desc');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  // Store Management State
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');

  // Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [availableOwners, setAvailableOwners] = useState([]);

  // Form States & Validation Errors
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER',
  });
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  const [newStoreForm, setNewStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [addStoreError, setAddStoreError] = useState('');
  const [addStoreSuccess, setAddStoreSuccess] = useState('');
  const [isAddingStore, setIsAddingStore] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/admin/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await api.get('/admin/users', {
        params: {
          search: userSearch,
          role: userRoleFilter,
          sortBy: userSortBy,
          sortOrder: userSortOrder,
          page: userPage,
          limit: 10,
        },
      });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setUserPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch, userRoleFilter, userSortBy, userSortOrder, userPage]);

  // Fetch Stores
  const fetchStores = useCallback(async () => {
    try {
      setStoresLoading(true);
      const res = await api.get('/admin/stores', {
        params: {
          search: storeSearch,
          sortBy: storeSortBy,
          sortOrder: storeSortOrder,
        },
      });
      if (res.data.success) {
        setStores(res.data.data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setStoresLoading(false);
    }
  }, [storeSearch, storeSortBy, storeSortOrder]);

  // Fetch Unassigned Store Owners
  const fetchAvailableOwners = async () => {
    try {
      const res = await api.get('/admin/available-owners');
      if (res.data.success) {
        setAvailableOwners(res.data.data.owners);
      }
    } catch (err) {
      console.error('Failed to fetch available owners:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, fetchUsers, fetchStores]);

  // Handle Add User Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserSuccess('');

    if (newUserForm.name.length < 20 || newUserForm.name.length > 60) {
      setAddUserError('Name must be between 20 and 60 characters.');
      return;
    }

    setIsAddingUser(true);
    try {
      const res = await api.post('/admin/users', newUserForm);
      setAddUserSuccess('User created successfully!');
      setNewUserForm({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
      fetchUsers();
      fetchStats();
      setTimeout(() => {
        setIsAddUserModalOpen(false);
        setAddUserSuccess('');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create user.';
      setAddUserError(msg);
    } finally {
      setIsAddingUser(false);
    }
  };

  // Handle Add Store Submit
  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    setAddStoreError('');
    setAddStoreSuccess('');

    if (!newStoreForm.ownerId) {
      setAddStoreError('Please select an unassigned Store Owner.');
      return;
    }

    setIsAddingStore(true);
    try {
      const res = await api.post('/admin/stores', newStoreForm);
      setAddStoreSuccess('Store created and owner assigned successfully!');
      setNewStoreForm({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
      setTimeout(() => {
        setIsAddStoreModalOpen(false);
        setAddStoreSuccess('');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create store.';
      setAddStoreError(msg);
    } finally {
      setIsAddingStore(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Command Center</h1>
            <p className="text-xs text-slate-500 mt-1">
              Overview of application stats, platform user accounts, and registered stores
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                fetchStats();
                fetchUsers();
                fetchStores();
              }}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title="Total Users"
            value={statsLoading ? '...' : stats.totalUsers}
            icon={Users}
            color="indigo"
            subtitle="Admins, Owners & Customers"
          />
          <StatCard
            title="Total Registered Stores"
            value={statsLoading ? '...' : stats.totalStores}
            icon={Store}
            color="emerald"
            subtitle="Active Business Accounts"
          />
          <StatCard
            title="Total Ratings Submitted"
            value={statsLoading ? '...' : stats.totalRatings}
            icon={Star}
            color="amber"
            subtitle="Verified Customer Reviews"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center space-x-2 bg-slate-200/60 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'users'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('stores')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'stores'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Store Management
              </button>
            </div>

            {/* Action Buttons */}
            {activeTab === 'users' ? (
              <button
                onClick={() => {
                  setAddUserError('');
                  setAddUserSuccess('');
                  setIsAddUserModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Add New User
              </button>
            ) : (
              <button
                onClick={() => {
                  setAddStoreError('');
                  setAddStoreSuccess('');
                  fetchAvailableOwners();
                  setIsAddStoreModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add New Store
              </button>
            )}
          </div>

          {/* TAB 1: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="p-6 space-y-4">
              {/* Search & Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Search */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    placeholder="Search users by name, email, or address..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                {/* Role Filter */}
                <div className="sm:col-span-3">
                  <div className="relative">
                    <Filter className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <select
                      value={userRoleFilter}
                      onChange={(e) => {
                        setUserRoleFilter(e.target.value);
                        setUserPage(1);
                      }}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                    >
                      <option value="">All Roles</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="STORE_OWNER">STORE_OWNER</option>
                      <option value="NORMAL_USER">NORMAL_USER</option>
                    </select>
                  </div>
                </div>

                {/* Sort By */}
                <div className="sm:col-span-3">
                  <div className="relative">
                    <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <select
                      value={`${userSortBy}-${userSortOrder}`}
                      onChange={(e) => {
                        const [by, order] = e.target.value.split('-');
                        setUserSortBy(by);
                        setUserSortOrder(order);
                      }}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="email-asc">Email (A-Z)</option>
                      <option value="role-asc">Role (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {usersLoading ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          Loading user records...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          No users found matching query.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                          <td className="py-3 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'STORE_OWNER'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={u.address}>
                            {u.address}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                page={userPage}
                totalPages={userPagination.totalPages}
                onPageChange={(p) => setUserPage(p)}
                totalItems={userPagination.total}
                limit={userPagination.limit}
              />
            </div>
          )}

          {/* TAB 2: STORE MANAGEMENT */}
          {activeTab === 'stores' && (
            <div className="p-6 space-y-4">
              {/* Search & Sort Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    placeholder="Search stores by store name, email, or address..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <div className="relative">
                    <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <select
                      value={`${storeSortBy}-${storeSortOrder}`}
                      onChange={(e) => {
                        const [by, order] = e.target.value.split('-');
                        setStoreSortBy(by);
                        setStoreSortOrder(order);
                      }}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                    >
                      <option value="name-asc">Store Name (A-Z)</option>
                      <option value="name-desc">Store Name (Z-A)</option>
                      <option value="overallRating-desc">Highest Rated</option>
                      <option value="overallRating-asc">Lowest Rated</option>
                      <option value="createdAt-desc">Newest Stores</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stores Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Store Name</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Assigned Owner</th>
                      <th className="py-3 px-4">Overall Rating</th>
                      <th className="py-3 px-4">Total Ratings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {storesLoading ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          Loading stores...
                        </td>
                      </tr>
                    ) : stores.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          No stores found matching query.
                        </td>
                      </tr>
                    ) : (
                      stores.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div>{s.name}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{s.email}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={s.address}>
                            {s.address}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800">{s.owner?.name}</span>
                            <div className="text-[11px] text-slate-400">{s.owner?.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            {s.overallRating ? (
                              <div className="inline-flex items-center space-x-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                <StarRating value={Math.round(s.overallRating)} readOnly size="sm" />
                                <span className="font-bold text-amber-700">{s.overallRating}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No ratings yet</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">{s.totalRatingsCount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add Platform User Account"
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-4">
          {addUserError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{addUserError}</span>
            </div>
          )}

          {addUserSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{addUserSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Role
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="NORMAL_USER">NORMAL_USER (Customer)</option>
                <option value="STORE_OWNER">STORE_OWNER (Store Owner)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-slate-400 font-normal">(20–60 characters)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g. System Administrator Account Name"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Length: {newUserForm.name.length} / 60</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-slate-400 font-normal">(8–16 chars, 1+ uppercase, 1+ special)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g. Password@123"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows="2"
                required
                value={newUserForm.address}
                onChange={(e) => setNewUserForm({ ...newUserForm, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                placeholder="Street address, city, state..."
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingUser}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {isAddingUser ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE STORE MODAL */}
      <Modal
        isOpen={isAddStoreModalOpen}
        onClose={() => setIsAddStoreModalOpen(false)}
        title="Add New Store & Assign Owner"
      >
        <form onSubmit={handleAddStoreSubmit} className="space-y-4">
          {addStoreError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{addStoreError}</span>
            </div>
          )}

          {addStoreSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{addStoreSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name</label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={newStoreForm.name}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g. Metro Supermarket & Groceries"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Store Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={newStoreForm.email}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="contact@store.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Store Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows="2"
                required
                value={newStoreForm.address}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                placeholder="Full store physical address..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Store Owner (STORE_OWNER role)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <select
                required
                value={newStoreForm.ownerId}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, ownerId: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">-- Select Unassigned Store Owner --</option>
                {availableOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>
            {availableOwners.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-600">
                No unassigned Store Owner users available. Please create a STORE_OWNER user first.
              </p>
            )}
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddStoreModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingStore || availableOwners.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {isAddingStore ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
