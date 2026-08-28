'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Card from '@/components/Common/Card';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Badge from '@/components/Common/Badge';
import FormField from '@/components/Common/FormField';
import Input from '@/components/Common/Input';
import { BiUser, BiGlobe, BiCog, BiCheckCircle, BiX, BiPencil, BiSave, BiRefresh } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { User, CurrencyCode } from '@/types';
import api from '@/lib/api';
import { setCurrencyMode, startRealtimeUpdates, stopRealtimeUpdates, getCurrencyMode } from '@/lib/realtimeCurrency';

type SettingsTab = 'profile' | 'currency' | 'system';

interface CurrencyData {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile states
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  // Currency states
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>('USD');
  const [editingRates, setEditingRates] = useState(false);
  const [currencyMode, setCurrencyModeState] = useState<'manual' | 'realtime'>('manual');
  const [currencies, setCurrencies] = useState<CurrencyData[]>([
    { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', rate: 1 },
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.017 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.013 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.016 },
  ]);

  useEffect(() => {
    fetchUserData();
    loadCurrencySettings();
    const mode = getCurrencyMode();
    setCurrencyModeState(mode);
  }, []);

  const loadCurrencySettings = () => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('currencySettings');
        if (saved) {
          const settings = JSON.parse(saved);
          if (settings.default_currency) {
            setDefaultCurrency(settings.default_currency);
          }
          if (settings.currencies) {
            const currencyArray = Object.values(settings.currencies) as CurrencyData[];
            setCurrencies(currencyArray);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load currency settings from localStorage:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me/');
      setUser(response.data);
      setProfileData({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await api.put(`/users/${user?.id}/`, profileData);
      setUser({ ...user, ...profileData } as User);
      setEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCurrencyUpdate = (index: number, field: 'rate' | 'name', value: any) => {
    const updated = [...currencies];
    updated[index] = { ...updated[index], [field]: value };
    setCurrencies(updated);
  };

  const handleSaveCurrencyRates = async () => {
    try {
      const currencyData = currencies.map(c => ({
        code: c.code,
        name: c.name,
        symbol: c.symbol,
        rate: c.rate,
      }));

      // Prepare payload for Django backend
      const payload = {
        default_currency: defaultCurrency,
        base_currency: 'GMD' as CurrencyCode,
        currencies: currencyData,
        mode: currencyMode,
      };

      // Save to Django backend (PRIMARY - mandatory)
      try {
        await api.post('/settings/currency/', payload);
        console.log('✓ Manual rates saved to Django backend');

        // Also save to localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('currencySettings', JSON.stringify(payload));
        }

        setEditingRates(false);
        toast.success('✓ Manual currency rates saved to database!');
      } catch (backendError: any) {
        console.error('Failed to save to backend:', backendError);

        // Show detailed error message
        const errorMsg = backendError.response?.data?.detail ||
                        backendError.message ||
                        'Unknown error occurred';

        toast.error(`Failed to save rates to database: ${errorMsg}`);

        // Still save to localStorage as temporary backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('currencySettings', JSON.stringify(payload));
          console.warn('Saved to localStorage as backup (backend unavailable)');
        }
      }
    } catch (error: any) {
      console.error('Error in handleSaveCurrencyRates:', error);
      toast.error('Failed to prepare currency data for saving');
    }
  };

  const handleToggleCurrencyMode = (mode: 'manual' | 'realtime') => {
    setCurrencyModeState(mode);
    setCurrencyMode(mode);

    if (mode === 'realtime') {
      startRealtimeUpdates();
      toast.success('✓ Real-time mode activated - rates updating live!');
    } else {
      stopRealtimeUpdates();
      toast.success('✓ Manual mode activated - using admin rates');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage profile, currency, and system preferences</p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-4 px-2 font-medium text-sm transition-all ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BiUser size={18} />
                  Profile
                </div>
              </button>
              <button
                onClick={() => setActiveTab('currency')}
                className={`pb-4 px-2 font-medium text-sm transition-all ${
                  activeTab === 'currency'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BiGlobe size={18} />
                  Currency
                </div>
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`pb-4 px-2 font-medium text-sm transition-all ${
                  activeTab === 'system'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BiCog size={18} />
                  System
                </div>
              </button>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <Card padding="lg" className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <ProfessionalButton
                    variant={editingProfile ? 'danger' : 'primary'}
                    size="sm"
                    icon={editingProfile ? <BiX size={16} /> : <BiPencil size={16} />}
                    onClick={() => setEditingProfile(!editingProfile)}
                  >
                    {editingProfile ? 'Cancel' : 'Edit'}
                  </ProfessionalButton>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="First Name">
                      <Input
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                        disabled={!editingProfile}
                        placeholder="John"
                      />
                    </FormField>
                    <FormField label="Last Name">
                      <Input
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                        disabled={!editingProfile}
                        placeholder="Doe"
                      />
                    </FormField>
                  </div>

                  <FormField label="Email Address">
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!editingProfile}
                      placeholder="john@example.com"
                    />
                  </FormField>

                  <FormField label="Username">
                    <Input
                      value={user?.username || ''}
                      disabled={true}
                      placeholder="Username"
                      className="bg-gray-50"
                    />
                  </FormField>

                  {editingProfile && (
                    <div className="pt-4 flex gap-3 justify-end">
                      <ProfessionalButton
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          setEditingProfile(false);
                          setProfileData({
                            first_name: user?.first_name || '',
                            last_name: user?.last_name || '',
                            email: user?.email || '',
                          });
                        }}
                      >
                        Cancel
                      </ProfessionalButton>
                      <ProfessionalButton
                        variant="primary"
                        size="md"
                        icon={<BiSave size={16} />}
                        onClick={handleProfileUpdate}
                      >
                        Save Changes
                      </ProfessionalButton>
                    </div>
                  )}
                </div>
              </Card>

              {/* Profile Status */}
              <Card padding="lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Account Status</p>
                      <p className="text-xs text-gray-600 mt-1">Active and verified</p>
                    </div>
                    <BiCheckCircle className="text-green-600" size={24} />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-gray-700">Role</p>
                    <div className="mt-2">
                      <Badge variant="info">Administrator</Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Account Active</p>
                    <div className="flex items-center gap-2 mt-2">
                      <BiCheckCircle className="text-green-600" size={18} />
                      <span className="text-sm font-medium text-green-700">Yes</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Currency Tab */}
          {activeTab === 'currency' && (
            <div className="space-y-6">
              {/* Default Currency */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Currency Settings</h2>
                  <ProfessionalButton
                    variant={editingRates ? 'danger' : 'primary'}
                    size="sm"
                    icon={editingRates ? <BiX size={16} /> : <BiPencil size={16} />}
                    onClick={() => setEditingRates(!editingRates)}
                  >
                    {editingRates ? 'Cancel' : 'Edit Rates'}
                  </ProfessionalButton>
                </div>

                <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Default Currency</p>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value as CurrencyCode)}
                    disabled={!editingRates}
                    className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-indigo-700 mt-2">Set the default currency for all transactions</p>
                </div>

                      {/* Mode Selector */}
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleToggleCurrencyMode('manual')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currencyMode === 'manual'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 mb-1">📋 Manual Mode</p>
                    <p className="text-sm text-gray-600">Use admin configured rates</p>
                  </button>

                  <button
                    onClick={() => handleToggleCurrencyMode('realtime')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currencyMode === 'realtime'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">📡 Real-Time API</p>
                      {currencyMode === 'realtime' && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-200 rounded-full">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-green-700">Live</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Updates every 5 seconds</p>
                  </button>
                </div>

                {/* Currency Rates Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Currency</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Symbol</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Rate to GMD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currencies.map((currency, idx) => (
                        <tr key={currency.code} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{currency.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <Badge variant={defaultCurrency === currency.code ? 'info' : 'default'}>
                              {currency.code}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{currency.symbol}</td>
                          <td className="px-6 py-4">
                            {editingRates ? (
                              <input
                                type="number"
                                step="0.0001"
                                value={currency.rate}
                                onChange={(e) =>
                                  handleCurrencyUpdate(idx, 'rate', parseFloat(e.target.value))
                                }
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-gray-900">{currency.rate.toFixed(6)}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {editingRates && (
                  <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3 justify-end">
                    <ProfessionalButton
                      variant="secondary"
                      size="md"
                      onClick={() => setEditingRates(false)}
                    >
                      Cancel
                    </ProfessionalButton>
                    <ProfessionalButton
                      variant="primary"
                      size="md"
                      icon={<BiSave size={16} />}
                      onClick={handleSaveCurrencyRates}
                    >
                      Save Rates
                    </ProfessionalButton>
                  </div>
                )}
              </Card>

              {/* Currency Info */}
              <Card padding="lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">About Currency</h3>
                <p className="text-sm text-gray-600 mb-4">
                  All currency rates are relative to the Gambian Dalasi (GMD) as the base currency.
                  Update these rates regularly to ensure accurate payment conversions across the system.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-gray-700">Base Currency</p>
                    <p className="text-lg font-bold text-indigo-600 mt-2">GMD</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-gray-700">Default Currency</p>
                    <p className="text-lg font-bold text-green-600 mt-2">{defaultCurrency}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <Card padding="lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Configuration</h2>
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-900">System Version</p>
                  <p className="text-lg font-bold text-amber-700 mt-2">v1.0.0</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-gray-700">API Status</p>
                    <div className="flex items-center gap-2 mt-2">
                      <BiCheckCircle className="text-green-600" size={18} />
                      <span className="text-sm font-medium text-green-700">Connected</span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-gray-700">Database Status</p>
                    <div className="flex items-center gap-2 mt-2">
                      <BiCheckCircle className="text-green-600" size={18} />
                      <span className="text-sm font-medium text-green-700">Healthy</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">System Information</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Organization</span>
                      <span className="font-medium text-gray-900">GIA Hajj Operations</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Region</span>
                      <span className="font-medium text-gray-900">Gambia</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
      </div>
    </Layout>
  );
}
