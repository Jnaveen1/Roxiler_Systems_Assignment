import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, LogOut, KeyRound, User as UserIcon, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

const Navbar = () => {
  const { user, role, logout, updatePassword } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleBadges = {
    ADMIN: { label: 'Administrator', style: 'bg-purple-50 text-purple-700 border-purple-200' },
    STORE_OWNER: { label: 'Store Owner', style: 'bg-amber-50 text-amber-700 border-amber-200' },
    NORMAL_USER: { label: 'Customer', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setIsSubmitting(true);

    try {
      const res = await updatePassword(oldPassword, newPassword);
      setPasswordSuccess(res.message || 'Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess('');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to update password';
      setPasswordError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left Brand */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-600 rounded-xl text-white shadow-md shadow-brand-500/20">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Store<span className="text-brand-600">Rate</span>
              </span>
            </div>

            {/* Right Profile & Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">{user.name}</span>
                    <span className="text-[11px] text-slate-500">{user.email}</span>
                  </div>

                  {/* Role Badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      roleBadges[role]?.style || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {roleBadges[role]?.label || role}
                  </span>

                  {/* Update Password Trigger */}
                  <button
                    onClick={() => {
                      setPasswordError('');
                      setPasswordSuccess('');
                      setIsPasswordModalOpen(true);
                    }}
                    className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Change Password"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Account Password"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="8-16 chars, 1+ uppercase, 1+ special (!@#$%^&*)"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Must be 8–16 characters with at least 1 uppercase letter and 1 special symbol (!@#$%^&*).
            </p>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Navbar;
