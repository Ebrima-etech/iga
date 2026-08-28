import { useState } from 'react';
import { useRouter } from 'next/router';
import { login } from '@/lib/auth';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Input from '@/components/Common/Input';
import FormField from '@/components/Common/FormField';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      toast.success('Login successful! Redirecting...');
      router.push('/dashboard');
    } catch (err) {
      const errorMessage =
        (err as any)?.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">GIA Hajj</h1>
          <p className="text-sm text-gray-600">Operations Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Sign in</h2>
            <p className="text-sm text-gray-600">to access your dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Username">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </FormField>

            <FormField label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </FormField>

            <ProfessionalButton
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Sign in
            </ProfessionalButton>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* Demo Credentials */}
          <div className="text-xs text-gray-600">
            <p className="font-medium text-gray-900 mb-2">Demo Credentials</p>
            <div className="space-y-1 font-mono text-gray-600">
              <div>admin / admin123</div>
              <div>bank_admin / password123</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2026 Gambia International Airlines</p>
        </div>
      </div>
    </div>
  );
}
