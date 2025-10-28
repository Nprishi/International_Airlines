import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, User, RefreshCw, Ban, Clock, Unlock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface UserData {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  last_login: string | null;
  blocked: boolean;
  suspended_until: string | null;
  blocked_reason: string | null;
  suspended_reason: string | null;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    role: 'user' as 'admin' | 'user',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const loadUsers = async () => {
    console.log('Loading users from database...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading users:', error);
    } else {
      console.log('Loaded users:', data?.length);
      setUsers(data || []);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      role: 'user',
    });
    setShowModal(true);
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleBlock = (user: UserData) => {
    setSelectedUser(user);
    setBlockReason('');
    setShowBlockModal(true);
  };

  const handleSuspend = (user: UserData) => {
    setSelectedUser(user);
    setSuspendReason('');
    setSuspendDays(7);
    setShowSuspendModal(true);
  };

  const handleUnblock = async (userId: string) => {
    await supabase
      .from('users')
      .update({ blocked: false, blocked_reason: null })
      .eq('id', userId);
    loadUsers();
  };

  const handleUnsuspend = async (userId: string) => {
    await supabase
      .from('users')
      .update({ suspended_until: null, suspended_reason: null })
      .eq('id', userId);
    loadUsers();
  };

  const confirmBlock = async () => {
    if (!selectedUser || !blockReason.trim()) {
      alert('Please provide a reason for blocking');
      return;
    }
    await supabase
      .from('users')
      .update({ blocked: true, blocked_reason: blockReason })
      .eq('id', selectedUser.id);
    setShowBlockModal(false);
    loadUsers();
  };

  const confirmSuspend = async () => {
    if (!selectedUser || !suspendReason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }
    const suspendUntil = new Date();
    suspendUntil.setDate(suspendUntil.getDate() + suspendDays);
    await supabase
      .from('users')
      .update({
        suspended_until: suspendUntil.toISOString(),
        suspended_reason: suspendReason
      })
      .eq('id', selectedUser.id);
    setShowSuspendModal(false);
    loadUsers();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      await supabase
        .from('users')
        .update({ role: formData.role })
        .eq('id', editingUser.id);
    }

    setShowModal(false);
    loadUsers();
  };

  const getUserStatus = (user: UserData) => {
    if (user.blocked) return 'Blocked';
    if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
      return 'Suspended';
    }
    return 'Active';
  };

  const getUserStatusColor = (user: UserData) => {
    if (user.blocked) return 'bg-red-100 text-red-800';
    if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('admin.users')}</h2>
          <div className="flex gap-2">
            <button
              onClick={loadUsers}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`${t('common.search')} users...`}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserStatusColor(user)}`}>
                        {getUserStatus(user)}
                      </span>
                      {user.suspended_until && new Date(user.suspended_until) > new Date() && (
                        <div className="text-xs text-gray-500 mt-1">
                          Until: {new Date(user.suspended_until).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Role"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      {!user.blocked ? (
                        <button
                          onClick={() => handleBlock(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Block User"
                        >
                          <Ban className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnblock(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Unblock User"
                        >
                          <Unlock className="h-5 w-5" />
                        </button>
                      )}
                      {(!user.suspended_until || new Date(user.suspended_until) <= new Date()) ? (
                        <button
                          onClick={() => handleSuspend(user)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Suspend User"
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnsuspend(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Remove Suspension"
                        >
                          <Unlock className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit User Role</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read-only)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (Read-only)</label>
                <input
                  type="text"
                  value={editingUser.name}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Read-only)</label>
                <input
                  type="tel"
                  value={editingUser.phone || 'N/A'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role (Editable)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-800">
                  Note: Name and phone cannot be edited by admin. Users manage their own information.
                </p>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Role
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Block User</h3>
            <p className="text-gray-700 mb-4">
              You are about to block <strong>{selectedUser.name}</strong> ({selectedUser.email})
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Blocking</label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Enter reason for blocking this user..."
                required
              />
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-xs text-red-800">
                Blocked users will not be able to log in or access the system.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={confirmBlock}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Block
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-orange-600 mb-4">Suspend User</h3>
            <p className="text-gray-700 mb-4">
              You are about to suspend <strong>{selectedUser.name}</strong> ({selectedUser.email})
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Suspension Duration (Days)</label>
              <select
                value={suspendDays}
                onChange={(e) => setSuspendDays(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value={1}>1 Day</option>
                <option value={3}>3 Days</option>
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Suspension</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="Enter reason for suspension..."
                required
              />
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
              <p className="text-xs text-orange-800">
                Suspended users will not be able to access the system until the suspension period expires.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={confirmSuspend}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Confirm Suspension
              </button>
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
