import React, { useEffect, useState } from 'react';
import { Layout, Card, CardHeader, CardTitle, CardContent, Button, Alert } from '../../components';
import { getAllUsers } from '../../services/api';
import { User } from '../../types';
import { Users, GraduationCap, UserCheck, Shield, Mail, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'student' | 'lecturer' | 'admin'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'lecturer': return <UserCheck className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'lecturer': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">View and manage all system users</p>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'student', 'lecturer', 'admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
              {role !== 'all' && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {users.filter(u => u.role === role).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">User</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Role</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Email</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {format(new Date(user.createdAt || new Date()), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">No users match the selected filter.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};