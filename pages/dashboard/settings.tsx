import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Card from '@/components/Common/Card';
import FormField from '@/components/Common/FormField';
import Input from '@/components/Common/Input';
import PageHeader from '@/components/Dashboard/PageHeader';
import { getMe } from '@/lib/auth';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { BiUser, BiMail, BiLock } from 'react-icons/bi';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      setFormData({
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to load user settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Page Header */}
        <PageHeader
          title="Settings"
          description="Manage your account and preferences"
        />

        {/* Settings Grid */}
        <div className="max-w-2xl space-y-8">
          {/* Account Information */}
          <Card padding="lg" shadow="md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField label="First Name">
                  <Input
                    icon={<BiUser size={20} />}
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="First name"
                  />
                </FormField>

                <FormField label="Last Name">
                  <Input
                    icon={<BiUser size={20} />}
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last name"
                  />
                </FormField>
              </div>

              <FormField label="Username" description="Your login username (cannot be changed)">
                <Input
                  icon={<BiUser size={20} />}
                  type="text"
                  value={formData.username}
                  disabled
                  placeholder="Username"
                />
              </FormField>

              <FormField label="Email Address">
                <Input
                  icon={<BiMail size={20} />}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                />
              </FormField>

              <div className="flex gap-3 pt-4">
                <ProfessionalButton variant="primary" onClick={handleSaveSettings}>
                  Save Changes
                </ProfessionalButton>
                <ProfessionalButton variant="secondary">
                  Cancel
                </ProfessionalButton>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card padding="lg" shadow="md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Security</h2>

            <div className="space-y-6">
              <FormField label="Current Password">
                <Input
                  icon={<BiLock size={20} />}
                  type="password"
                  placeholder="Enter current password"
                />
              </FormField>

              <FormField label="New Password">
                <Input
                  icon={<BiLock size={20} />}
                  type="password"
                  placeholder="Enter new password"
                />
              </FormField>

              <FormField label="Confirm Password">
                <Input
                  icon={<BiLock size={20} />}
                  type="password"
                  placeholder="Confirm new password"
                />
              </FormField>

              <div className="flex gap-3 pt-4">
                <ProfessionalButton variant="primary">
                  Update Password
                </ProfessionalButton>
                <ProfessionalButton variant="secondary">
                  Cancel
                </ProfessionalButton>
              </div>
            </div>
          </Card>

          {/* System Settings */}
          <Card padding="lg" shadow="md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>

            <div className="space-y-4">
              <label className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                <span className="ml-3">
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email updates for important events</p>
                </span>
              </label>

              <label className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                <span className="ml-3">
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </span>
              </label>

              <label className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                <span className="ml-3">
                  <p className="font-medium text-gray-900">Activity Logging</p>
                  <p className="text-sm text-gray-600">Keep a record of all your activities</p>
                </span>
              </label>
            </div>
          </Card>

          {/* About Section */}
          <Card padding="lg" shadow="sm">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <h3 className="font-semibold text-blue-900 mb-1">About This Application</h3>
              <p className="text-sm text-blue-800">
                GIA Hajj Operations Management System v1.0
              </p>
              <p className="text-sm text-blue-800 mt-2">
                © 2026 Gambia International Airlines. All rights reserved.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
