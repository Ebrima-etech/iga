'use client';

import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import ReceiptManagement from '@/components/Dashboard/ReceiptManagement';
import { useEffect, useState } from 'react';
import { getMe } from '@/lib/auth';
import { User } from '@/types';
import Card from '@/components/Common/Card';
import { BiX } from 'react-icons/bi';

export default function ReceiptsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

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

  if (!user?.is_staff) {
    return (
      <Layout>
        <div className="min-h-screen bg-white p-8">
          <PageHeader
            title="Receipts"
            description="View and manage payment receipts"
          />
          <Card padding="lg" shadow="none" className="mt-8">
            <div className="text-center py-12">
              <BiX size={48} className="text-red-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Only administrators can view receipt records</p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <PageHeader
          title="Receipts"
          description="View and manage all generated payment receipts"
        />
        <div className="mt-8">
          <Card padding="lg" shadow="none">
            <ReceiptManagement />
          </Card>
        </div>
      </div>
    </Layout>
  );
}
