import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';

export interface UserRoleData {
  id: string;
  role: 'hajj_admin' | 'hajj_staff' | 'bank_admin' | 'bank_staff';
  is_active: boolean;
  bank?: {
    id: number;
    name: string;
  };
}

export function useUserRole() {
  const [role, setRole] = useState<UserRoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const userRes = await api.get('/users/me/');
      const userId = userRes.data.id;

      const roleRes = await api.get(`/user-roles/?user=${userId}`);
      const roleData = roleRes.data.results?.[0] || roleRes.data?.[0];

      if (roleData) {
        setRole(roleData);
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    role,
    loading,
    isBankAdmin: role?.role === 'bank_admin',
    isHajjAdmin: role?.role === 'hajj_admin',
    isHajjStaff: role?.role === 'hajj_staff',
    isBankStaff: role?.role === 'bank_staff',
    canSortAndFilter: role?.role === 'bank_admin' || role?.role === 'hajj_admin',
  };
}
