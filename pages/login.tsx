import { useState } from 'react';
import { useRouter } from 'next/router';
import { login, isGIAUser, getMe } from '@/lib/auth';
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
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [doorsSwing, setDoorsSwing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);

      // Check if user is GIA staff/admin
      const user = await getMe();
      const isGIA = await isGIAUser(user.id);

      if (!isGIA) {
        // Bank staff trying to access GIA dashboard - show wrong credentials
        setError('Invalid credentials. Please check your username and password.');
        toast.error('Invalid credentials');
        return;
      }

      setDoorsOpen(true);
      // double rAF so the browser paints the closed doors before the
      // transition class is applied — otherwise it can jump straight
      // to the open state instead of animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDoorsSwing(true));
      });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
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
      {/* One shared background layer spanning the full page — pattern and glow are
          computed once here so there's no seam where the two columns meet */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="girihPage" width="56" height="56" patternUnits="userSpaceOnUse">
            <g stroke="#d4af37" strokeWidth="1" fill="none">
              <rect x="8" y="8" width="40" height="40" transform="rotate(45 28 28)" />
              <rect x="8" y="8" width="40" height="40" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#girihPage)" />
      </svg>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 28% 34%, rgba(212,175,55,0.14), transparent 55%)' }}
      />

      {/* Hajj term engravings, spanning the entire page */}
      <HajjTermsBackground />

      {/* Cinematic vignette — sits under the foreground scene/card since it
          shares the same auto stacking order and comes first in the DOM,
          so it only ever darkens empty background, never the content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.35) 100%)' }}
      />

      {/* Airplane, now flying across the entire page */}
      <div className="absolute top-[9%] left-0 w-full pointer-events-none hajj-plane-track">
        <svg width="128" height="74" viewBox="0 0 110 64" fill="none" className="text-amber-200/95">
          <defs>
            <clipPath id="tailFlagClip">
              <path d="M10 34 L26 8 L33 8 L26 34 Z" />
            </clipPath>
          </defs>
          <path d="M10 34 L26 50 L33 50 Z" fill="currentColor" opacity="0.85" />
          <g clipPath="url(#tailFlagClip)">
            <rect x="5" y="8" width="35" height="8" fill="#CE1126" />
            <rect x="5" y="16" width="35" height="1" fill="#ffffff" />
            <rect x="5" y="17" width="35" height="8" fill="#0C1C8C" />
            <rect x="5" y="25" width="35" height="1" fill="#ffffff" />
            <rect x="5" y="26" width="35" height="8" fill="#3A7728" />
          </g>
          <path d="M41 34 L64 4 L71 4 L55 34 Z" fill="currentColor" />
          <path d="M41 34 L64 60 L71 60 L55 34 Z" fill="currentColor" opacity="0.85" />
          <rect x="17" y="27" width="82" height="14" rx="7" fill="currentColor" />
          <path d="M99 27 L110 34 L99 41 Z" fill="currentColor" />
          <text
            x="58"
            y="36"
            fontSize="14"
            fontWeight="800"
            fill="#052e21"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            letterSpacing="1"
          >
            GIA
          </text>
        </svg>
        <svg width="175" height="6" viewBox="0 0 150 5" className="text-amber-100/25 -mt-1 -ml-28">
          <line x1="0" y1="2.5" x2="145" y2="2.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
        </svg>
      </div>

      <HajjVisualPanel />

      <div className="relative flex-1 flex flex-col overflow-hidden">
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
      <div className="absolute bottom-3 left-0 w-full z-20 text-center pointer-events-none">
        <p className="text-xs font-medium text-white">© 2026 Gambia International Airlines</p>
      </div>

      {/* Door-opening transition on successful login */}
      {doorsOpen && (
        <div className="fixed inset-0 z-[100] door-stage">
          {/* what the doors reveal — matches the dashboard's own light theme
              so the eventual page navigation lands without a visual jump */}
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-2xl door-logo-pulse">
                G
              </div>
              <p className="text-gray-500 text-sm font-medium">Loading your dashboard…</p>
            </div>
          </div>

          {/* light beam growing at the seam as the doors separate */}
          <div className={`door-beam absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 ${doorsSwing ? 'door-beam-swing' : ''}`} />

          {/* static hinge posts — anchored to the outer frame, never move,
              so the doors read as rotating AROUND them rather than just
              shrinking away */}
          <div className="door-hinge door-hinge-left absolute inset-y-0 left-0" />
          <div className="door-hinge door-hinge-right absolute inset-y-0 right-0" />

          {/* left door — built as a real box (front face + a side edge folded
              90deg to show thickness), not a single flat rotating plane */}
          <div className={`door-panel door-left absolute inset-y-0 left-0 w-1/2 ${doorsSwing ? 'door-left-swing' : ''}`}>
            <div className="door-face absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-950 to-black">
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(circle at 100% 50%, rgba(212,175,55,0.18), transparent 60%)' }}
              />
              <div className={`door-shade absolute inset-0 ${doorsSwing ? 'door-shade-on' : ''}`} style={{ background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.6))' }} />
            </div>
            <div className="door-edge door-edge-right absolute inset-y-0 right-0">
              <div className="door-edge-highlight absolute inset-y-0 left-0" />
            </div>
          </div>

          {/* right door */}
          <div className={`door-panel door-right absolute inset-y-0 right-0 w-1/2 ${doorsSwing ? 'door-right-swing' : ''}`}>
            <div className="door-face absolute inset-0 bg-gradient-to-bl from-emerald-950 via-emerald-950 to-black">
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(circle at 0% 50%, rgba(212,175,55,0.18), transparent 60%)' }}
              />
              <div className={`door-shade absolute inset-0 ${doorsSwing ? 'door-shade-on' : ''}`} style={{ background: 'linear-gradient(to left, transparent 60%, rgba(0,0,0,0.6))' }} />
            </div>
            <div className="door-edge door-edge-left absolute inset-y-0 left-0">
              <div className="door-edge-highlight absolute inset-y-0 right-0" />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hajj-plane-track {
          animation: hajjFlyPage 26s ease-in-out infinite;
        }
        @keyframes hajjFlyPage {
          0% { transform: translate(-10%, 100%) rotateZ(0deg) rotateY(-8deg) rotateX(5deg); opacity: 0; }
          5% { opacity: 0.3; }
          12% { opacity: 1; transform: translate(20%, 60%) rotateZ(-2deg) rotateY(-9deg) rotateX(6deg); }
          25% { transform: translate(85%, 10%) rotateZ(-10deg) rotateY(-11deg) rotateX(8deg); }
          40% { transform: translate(150%, -120px) rotateZ(-16deg) rotateY(-13deg) rotateX(10deg); }
          60% { transform: translate(220%, -240px) rotateZ(-22deg) rotateY(-15deg) rotateX(12deg); }
          80% { transform: translate(290%, -340px) rotateZ(-28deg) rotateY(-17deg) rotateX(14deg); }
          90% { opacity: 1; }
          100% { transform: translate(340%, -400px) rotateZ(-30deg) rotateY(-18deg) rotateX(15deg); opacity: 0; }
        }

        .door-stage {
          perspective: 900px;
          perspective-origin: 50% 50%;
        }

        /* .door-panel is the rigid box GROUP — it holds a front face plus a
           side-edge face folded 90deg to form real thickness, and the two
           move together as one solid object when the group rotates open */
        .door-panel {
          transition: transform 1.35s cubic-bezier(0.65, 0, 0.35, 1);
          transform-style: preserve-3d;
          will-change: transform;
        }
        .door-left {
          transform-origin: 0% 50%;
          transform: rotateY(0deg);
        }
        .door-right {
          transform-origin: 100% 50%;
          transform: rotateY(0deg);
        }
        .door-left-swing { transform: rotateY(-89deg); }
        .door-right-swing { transform: rotateY(89deg); }

        .door-face {
          backface-visibility: hidden;
          box-shadow: 0 0 90px rgba(0, 0, 0, 0.65);
        }

        /* the side-edge face: a strip as wide as the door's "thickness",
           folded a rigid 90deg around the boundary it shares with the
           front face. It never transitions on its own — only the parent
           .door-panel's rotation moves it, exactly like a real hinged
           panel with the edge rigidly attached */
        .door-edge {
          width: 28px;
        }
        .door-edge-right {
          transform-origin: 100% 50%;
          transform: rotateY(-90deg);
          background: linear-gradient(to left, #050807, #000);
        }
        .door-edge-left {
          transform-origin: 0% 50%;
          transform: rotateY(90deg);
          background: linear-gradient(to right, #050807, #000);
        }

        /* bright seam where the edge meets the front face — the corner of
           a real door catches light here, and it's what visibly sweeps
           through the arc as the door swings, since it's rigidly part of
           the rotating box rather than a flat overlay */
        .door-edge-highlight {
          width: 3px;
          background: linear-gradient(to bottom, transparent, rgba(255, 223, 120, 0.9), transparent);
          box-shadow: 0 0 24px 4px rgba(212, 175, 55, 0.7);
        }

        /* darkens the front face as it turns away, like it's rotating out
           of the light — a cheap but effective extra depth cue */
        .door-shade {
          opacity: 0;
          transition: opacity 1.35s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .door-shade-on {
          opacity: 1;
        }

        /* fixed frame posts at the outer edges — these never move, so the
           doors visibly rotate around them like real hinges */
        .door-hinge {
          width: 10px;
          z-index: 2;
          background: linear-gradient(to bottom, #d4af37, #7a5f18, #d4af37);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
        }
        .door-hinge-left { left: 0; }
        .door-hinge-right { right: 0; }

        .door-beam {
          background: linear-gradient(to bottom, transparent, rgba(255, 223, 120, 0.95), transparent);
          box-shadow: 0 0 60px 16px rgba(212, 175, 55, 0.55);
          opacity: 0;
          transition: opacity 0.5s ease 0.5s;
          z-index: 1;
        }
        .door-beam-swing {
          opacity: 1;
        }

        .door-logo-pulse {
          animation: doorLogoPulse 1s ease-in-out infinite;
        }
        @keyframes doorLogoPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
