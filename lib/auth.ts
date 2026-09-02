import api from './api';

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  access: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/token/', { username, password });
    const token = response.data.access;
    localStorage.setItem('access_token', token);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
};

export const getMe = async (): Promise<User> => {
  const response = await api.get('/auth/me/');
  return response.data;
};

export const getUserRole = async (userId: number): Promise<string | null> => {
  try {
    const response = await api.get(`/user-roles/?user=${userId}`);
    const roles = response.data.results || response.data;
    if (roles.length > 0) {
      return roles[0].role; // Return first role
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const isGIAUser = async (userId: number): Promise<boolean> => {
  const role = await getUserRole(userId);
  return !!(role && (role === 'hajj_admin' || role === 'hajj_staff'));
};

export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};
