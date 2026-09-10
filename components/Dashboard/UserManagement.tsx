'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { BiPlus, BiPencil, BiTrash, BiSearch, BiRefresh, BiCheckCircle, BiX } from 'react-icons/bi';
import Card from '@/components/Common/Card';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

interface UserRole {
  id: number;
  user: UserData;
  user_id: number;
  role: 'hajj_admin' | 'hajj_staff' | 'bank_admin' | 'bank_staff';
  is_active: boolean;
  created_at: string;
}

const ROLE_OPTIONS = [
  { value: 'hajj_admin', label: 'Hajj Company Admin', color: 'bg-purple-100 text-purple-800' },
  { value: 'hajj_staff', label: 'Hajj Company Staff', color: 'bg-blue-100 text-blue-800' },
];

const ALL_ROLE_LABELS: Record<string, { label: string; color: string; type: 'hajj' | 'bank' }> = {
  'hajj_admin': { label: 'Hajj Company Admin', color: 'bg-purple-100 text-purple-800', type: 'hajj' },
  'hajj_staff': { label: 'Hajj Company Staff', color: 'bg-blue-100 text-blue-800', type: 'hajj' },
  'bank_admin': { label: 'Bank Admin', color: 'bg-green-100 text-green-800', type: 'bank' },
  'bank_staff': { label: 'Bank Staff', color: 'bg-yellow-100 text-yellow-800', type: 'bank' },
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRole | null>(null);

  // Create/Edit form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'hajj_staff' as 'hajj_admin' | 'hajj_staff',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.user.first_name} ${user.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user-roles/');
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!formData.username || !formData.password) {
        toast.error('Username and password are required');
        return;
      }

      // Create user
      const userResponse = await api.post('/users/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Create user role
      await api.post('/user-roles/', {
        user_id: userResponse.data.id,
        role: formData.role,
        is_active: formData.is_active,
      });

      toast.success('User created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error?.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      // Update user role
      await api.patch(`/user-roles/${editingUser.id}/`, {
        role: formData.role,
        is_active: formData.is_active,
      });

      toast.success('User updated successfully!');
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/user-roles/${userId}/`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleEditClick = (userRole: UserRole) => {
    // Don't allow editing bank users
    if (userRole.role === 'bank_admin' || userRole.role === 'bank_staff') {
      toast.error('Bank users cannot be edited from GIA admin panel');
      return;
    }
    setEditingUser(userRole);
    setFormData({
      username: userRole.user.username,
      email: userRole.user.email,
      first_name: userRole.user.first_name,
      last_name: userRole.user.last_name,
      password: '',
      role: (userRole.role as 'hajj_admin' | 'hajj_staff'),
      is_active: userRole.is_active,
    });
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      role: 'hajj_staff',
      is_active: true,
    });
  };

  const getRoleColor = (role: string) => {
    return ALL_ROLE_LABELS[role]?.color || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    return ALL_ROLE_LABELS[role]?.label || role;
  };

  const isBankUser = (role: string) => {
    return role === 'bank_admin' || role === 'bank_staff';
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <BiSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-700"
          />
        </div>
        <ProfessionalButton
          variant="primary"
          size="md"
          icon={<BiPlus size={16} />}
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowCreateModal(true);
          }}
        >
          Add User
        </ProfessionalButton>
        <button
          onClick={fetchUsers}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Refresh users"
        >
          <BiRefresh size={18} />
        </button>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card padding="lg" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <BiX size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  disabled={!!editingUser}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  placeholder="Enter email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    disabled={!!editingUser}
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    disabled={!!editingUser}
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter password"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card padding="lg" shadow="none">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Users & Staff ({filteredUsers.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              💡 Bank users are displayed as view-only for reference only (cannot edit or delete)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No users found matching your search' : 'No users yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userRole) => (
                  <tr
                    key={userRole.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {userRole.user.first_name} {userRole.user.last_name}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{userRole.user.username}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{userRole.user.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" size="sm">
                        {getRoleLabel(userRole.role)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {userRole.is_active ? (
                          <>
                            <BiCheckCircle size={16} className="text-green-600" />
                            <span className="text-sm text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <BiX size={16} className="text-red-600" />
                            <span className="text-sm text-red-600">Inactive</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isBankUser(userRole.role) ? (
                        <span className="text-xs text-gray-500">View Only</span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(userRole)}
                            className="p-2 hover:bg-blue-100 rounded text-blue-600 transition"
                            title="Edit user"
                          >
                            <BiPencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userRole.id)}
                            className="p-2 hover:bg-red-100 rounded text-red-600 transition"
                            title="Delete user"
                          >
                            <BiTrash size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
