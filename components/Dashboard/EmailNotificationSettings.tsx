'use client';

import { useState, useEffect } from 'react';
import { BiPlus, BiX, BiSave, BiRefresh, BiEnvelope, BiCheckCircle } from 'react-icons/bi';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface EmailNotification {
  id: number;
  email: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface EmailNotificationSettings {
  id: number;
  enable_notifications: boolean;
  notify_on_payment: boolean;
  notify_on_receipt: boolean;
  notification_delay: number; // in minutes
  email_from: string;
  email_subject: string;
  created_at: string;
  updated_at: string;
}

export default function EmailNotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [settings, setSettings] = useState<EmailNotificationSettings>({
    id: 0,
    enable_notifications: true,
    notify_on_payment: true,
    notify_on_receipt: false,
    notification_delay: 0,
    email_from: 'noreply@giabanking.gm',
    email_subject: 'GIA Banking Notification',
    created_at: '',
    updated_at: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [emailsRes, settingsRes] = await Promise.all([
        api.get('/settings/email-notifications/'),
        api.get('/settings/email-notifications/config/'),
      ]);

      // Handle paginated results from DRF
      const emailList = emailsRes.data.results || emailsRes.data || [];
      setEmails(Array.isArray(emailList) ? emailList : []);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Failed to load email notification settings:', error);
      toast.error('Failed to load settings');
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const addEmail = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (emails.some(e => e.email.toLowerCase() === newEmail.toLowerCase())) {
      toast.error('This email is already added');
      return;
    }

    try {
      setSaving(true);
      const response = await api.post('/settings/email-notifications/', {
        email: newEmail,
        description: newDescription,
        is_active: true,
      });

      setEmails([...emails, response.data]);
      setNewEmail('');
      setNewDescription('');
      toast.success('Email added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add email');
    } finally {
      setSaving(false);
    }
  };

  const removeEmail = async (id: number) => {
    try {
      setSaving(true);
      await api.delete(`/settings/email-notifications/${id}/`);
      setEmails(emails.filter(e => e.id !== id));
      toast.success('Email removed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to remove email');
    } finally {
      setSaving(false);
    }
  };

  const toggleEmailStatus = async (id: number, isActive: boolean) => {
    try {
      setSaving(true);
      const email = emails.find(e => e.id === id);
      if (!email) return;

      const response = await api.patch(`/settings/email-notifications/${id}/`, {
        is_active: !isActive,
      });

      setEmails(emails.map(e => e.id === id ? { ...e, is_active: !isActive } : e));
      toast.success(isActive ? 'Email deactivated' : 'Email activated');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update email status');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/settings/email-notifications/config/', {
        enable_notifications: settings.enable_notifications,
        notify_on_payment: settings.notify_on_payment,
        notify_on_receipt: settings.notify_on_receipt,
        notification_delay: settings.notification_delay,
        email_from: settings.email_from,
        email_subject: settings.email_subject,
      });

      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <BiRefresh size={32} className="text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Settings */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Email Notification Settings</h3>

        <div className="space-y-4">
          {/* Enable Notifications */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enable_notifications}
              onChange={(e) =>
                setSettings({ ...settings, enable_notifications: e.target.checked })
              }
              className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <div>
              <p className="font-medium text-gray-900">Enable Email Notifications</p>
              <p className="text-sm text-gray-600">
                Turn on to send email notifications to configured recipients
              </p>
            </div>
          </label>

          {settings.enable_notifications && (
            <>
              {/* Notify on Payment */}
              <label className="flex items-center gap-3 cursor-pointer ml-6">
                <input
                  type="checkbox"
                  checked={settings.notify_on_payment}
                  onChange={(e) =>
                    setSettings({ ...settings, notify_on_payment: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Notify on New Payment</p>
                  <p className="text-sm text-gray-600">Send email when a new payment is created</p>
                </div>
              </label>

              {/* Notify on Receipt */}
              <label className="flex items-center gap-3 cursor-pointer ml-6">
                <input
                  type="checkbox"
                  checked={settings.notify_on_receipt}
                  onChange={(e) =>
                    setSettings({ ...settings, notify_on_receipt: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Notify on New Receipt</p>
                  <p className="text-sm text-gray-600">Send email when a receipt is generated</p>
                </div>
              </label>

              {/* Notification Delay */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Delay (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1440"
                  value={settings.notification_delay}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notification_delay: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0 for immediate notification"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add a delay before sending notifications (0 = immediate)
                </p>
              </div>

              {/* Email From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email Address
                </label>
                <input
                  type="email"
                  value={settings.email_from}
                  onChange={(e) => setSettings({ ...settings, email_from: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Gmail/Google Workspace email address</p>
              </div>

              {/* Email Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject Template
                </label>
                <input
                  type="text"
                  value={settings.email_subject}
                  onChange={(e) => setSettings({ ...settings, email_subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="GIA Banking Notification"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Subject line for notification emails
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email Recipients */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Notification Recipients</h3>

        {/* Add New Email */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Add Email Address</p>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Description (e.g., Admin, Finance Team)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              onClick={addEmail}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
            >
              <BiPlus size={18} />
              Add Email
            </button>
          </div>
        </div>

        {/* Email List */}
        {emails.length === 0 ? (
          <div className="text-center py-8">
            <BiEnvelope size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600">No email recipients added yet</p>
            <p className="text-sm text-gray-500">Add email addresses above to enable notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {emails.map((email) => (
              <div
                key={email.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      email.is_active ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}
                  >
                    <BiEnvelope
                      size={18}
                      className={email.is_active ? 'text-emerald-600' : 'text-gray-400'}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{email.email}</p>
                    {email.description && (
                      <p className="text-sm text-gray-600">{email.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Added: {new Date(email.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEmailStatus(email.id, email.is_active)}
                    disabled={saving}
                    className={`p-2 rounded-lg transition-colors ${
                      email.is_active
                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    } disabled:opacity-50`}
                    title={email.is_active ? 'Deactivate' : 'Activate'}
                  >
                    <BiCheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => removeEmail(email.id)}
                    disabled={saving}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                    title="Remove"
                  >
                    <BiX size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <ProfessionalButton
          onClick={saveSettings}
          disabled={saving}
          loading={saving}
          icon={<BiSave />}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </ProfessionalButton>
      </div>
    </div>
  );
}
