import { useState } from 'react';
import { useRouter } from 'next/router';
import { login } from '@/lib/auth';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Input from '@/components/Common/Input';
import FormField from '@/components/Common/FormField';
import HajjVisualPanel from '@/components/HajjVisualPanel';
import HajjTermsBackground from '@/components/HajjTermsBackground';
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
    <div className="relative min-h-screen flex bg-gradient-to-b from-emerald-950 via-emerald-950 to-black overflow-hidden">
      <HajjVisualPanel />

      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Geometric Islamic pattern, matching the visual panel */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="girihForm" width="56" height="56" patternUnits="userSpaceOnUse">
              <g stroke="#d4af37" strokeWidth="1" fill="none">
                <rect x="8" y="8" width="40" height="40" transform="rotate(45 28 28)" />
                <rect x="8" y="8" width="40" height="40" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#girihForm)" />
        </svg>

        {/* Soft gold glow, echoing the visual panel */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 30%, rgba(212,175,55,0.10), transparent 60%)' }}
        />

        <HajjTermsBackground />

        {/* Mobile-only compact Hajj banner */}
        <div className="relative z-10 lg:hidden px-6 py-6 flex items-center gap-4 border-b border-emerald-900/60">
          <svg width="40" height="36" viewBox="0 0 220 200" fill="none" className="flex-shrink-0">
            <polygon points="150,60 168,48 168,140 150,150" fill="#000000" />
            <polygon points="70,60 88,48 168,48 150,60" fill="#1c1c1c" />
            <rect x="70" y="60" width="80" height="90" fill="#0a0a0a" />
            <rect x="70" y="82" width="80" height="12" fill="#d4af37" />
            <rect x="102" y="108" width="18" height="32" rx="2" fill="#d4af37" />
          </svg>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">GIA Hajj</h1>
            <p className="text-emerald-200/60 text-xs">Serving the Guests of Allah</p>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            {/* Card */}
            <div className="bg-white/95 backdrop-blur-sm border border-white/10 rounded-lg p-8 shadow-xl shadow-black/40 mt-8 lg:mt-0">
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

                <ProfessionalButton type="submit" variant="success" fullWidth loading={loading}>
                  Sign in
                </ProfessionalButton>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer, centered across the full page width */}
      <div className="absolute bottom-3 left-0 w-full z-10 text-center pointer-events-none">
        <p className="text-xs font-medium text-white">© 2026 Gambia International Airlines</p>
      </div>
    </div>
  );
}
