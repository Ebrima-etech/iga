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
            {/* Header (desktop) */}
            <div className="hidden lg:block text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-1">GIA Hajj</h1>
              <p className="text-sm text-emerald-200/60">Operations Management System</p>
              <div className="mt-4 h-px w-16 bg-amber-400/50 mx-auto" />
            </div>

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

              {/* Divider */}
              <div className="my-6 border-t border-emerald-100"></div>

              {/* Demo Credentials */}
              <div className="text-xs text-gray-600 bg-emerald-50/60 border border-emerald-100 rounded-md p-3">
                <p className="font-medium text-gray-900 mb-2">Demo Credentials</p>
                <div className="space-y-1 font-mono text-gray-600">
                  <div>admin / admin123</div>
                  <div>bank_admin / password123</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sand dunes spanning the full page width, with drifting particles */}
      <div className="absolute bottom-0 left-0 w-full z-[5] pointer-events-none">
        <svg viewBox="0 0 1600 90" preserveAspectRatio="none" className="w-full h-[90px]">
          <path d="M0 40 Q400 5 800 30 T1600 20 V90 H0 Z" fill="#78350f" opacity="0.55" />
          <path d="M0 55 Q440 25 900 50 T1600 42 V90 H0 Z" fill="#92400e" opacity="0.6" />
          <path d="M0 70 Q500 50 1000 68 T1600 60 V90 H0 Z" fill="#b45309" opacity="0.5" />
        </svg>

        {/* Mosque skyline silhouette, sitting on the dunes */}
        <svg
          className="absolute bottom-6 left-0 w-full"
          viewBox="0 0 1600 120"
          preserveAspectRatio="none"
          fill="#000000"
          opacity="0.55"
        >
          <rect x="0" y="70" width="1600" height="50" />
          <rect x="90" y="40" width="16" height="80" />
          <circle cx="98" cy="36" r="7" />
          <rect x="1450" y="40" width="16" height="80" />
          <circle cx="1458" cy="36" r="7" />
          <path d="M600 70 C600 20 1000 20 1000 70 Z" />
          <rect x="770" y="10" width="10" height="60" />
          <circle cx="775" cy="8" r="5" />
        </svg>

        {/* Drifting sand particles */}
        <div className="absolute inset-0">
          {[
            { left: '5%', delay: '0s', dur: '7s' },
            { left: '15%', delay: '1.5s', dur: '9s' },
            { left: '28%', delay: '0.8s', dur: '8s' },
            { left: '40%', delay: '2.2s', dur: '10s' },
            { left: '52%', delay: '1s', dur: '7.5s' },
            { left: '63%', delay: '3s', dur: '9s' },
            { left: '74%', delay: '0.4s', dur: '8.5s' },
            { left: '85%', delay: '2.6s', dur: '9.5s' },
            { left: '95%', delay: '1.8s', dur: '7.8s' },
          ].map((p, i) => (
            <span
              key={i}
              className="hajj-sand-page"
              style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }}
            />
          ))}
        </div>
      </div>

      {/* Footer, centered on the sand across the full page width */}
      <div className="absolute bottom-3 left-0 w-full z-10 text-center pointer-events-none">
        <p className="text-xs font-medium text-emerald-950/70">© 2026 Gambia International Airlines</p>
      </div>

      <style jsx>{`
        .hajj-sand-page {
          position: absolute;
          bottom: 10px;
          width: 3px;
          height: 3px;
          border-radius: 9999px;
          background: #f2d98a;
          opacity: 0;
          animation-name: hajjSandDriftPage;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
        @keyframes hajjSandDriftPage {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.6; }
          100% { transform: translateY(-70px) translateX(10px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
