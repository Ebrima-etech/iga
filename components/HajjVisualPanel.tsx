export default function HajjVisualPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-950 to-black">
      {/* Geometric Islamic star pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="girih" width="56" height="56" patternUnits="userSpaceOnUse">
            <g stroke="#d4af37" strokeWidth="1" fill="none">
              <rect x="8" y="8" width="40" height="40" transform="rotate(45 28 28)" />
              <rect x="8" y="8" width="40" height="40" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#girih)" />
      </svg>

      {/* Radial gold glow, gently breathing */}
      <div className="absolute inset-0 hajj-glow" />

      {/* Twinkling stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: '8%', left: '12%', delay: '0s', size: 3 },
          { top: '14%', left: '78%', delay: '0.6s', size: 2 },
          { top: '22%', left: '30%', delay: '1.2s', size: 2 },
          { top: '10%', left: '55%', delay: '1.8s', size: 3 },
          { top: '28%', left: '88%', delay: '0.3s', size: 2 },
          { top: '18%', left: '8%', delay: '2.2s', size: 2 },
          { top: '6%', left: '40%', delay: '1.5s', size: 2 },
        ].map((s, i) => (
          <span
            key={i}
            className="hajj-star"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
          />
        ))}
      </div>

      {/* Airplane flying across the sky */}
      <div className="absolute top-[10%] left-0 w-full pointer-events-none hajj-plane-track">
        <svg width="30" height="18" viewBox="0 0 30 18" fill="none" className="text-amber-200/70">
          <path
            d="M2 11 L14 9.5 L19 2 L21.5 2 L19 9.5 L27 9 L29 10.5 L19.5 11.5 L17 17 L14.5 17 L15.5 11.8 L4 12.5 Z"
            fill="currentColor"
          />
        </svg>
        <svg width="60" height="4" viewBox="0 0 60 4" className="text-amber-100/20 -mt-1 -ml-8">
          <line x1="0" y1="2" x2="55" y2="2" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
        {/* Crescent + star */}
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="mb-6 text-amber-300/80 hajj-pulse-slow">
          <path d="M27 8a14 14 0 1 0 0 28 11 11 0 1 1 0-28Z" fill="currentColor" opacity="0.9" />
          <path d="M36 10l1.2 2.6L40 14l-2.8 1.4L36 18l-1.2-2.6L32 14l2.8-1.4L36 10Z" fill="currentColor" />
        </svg>

        {/* Safa, Kaaba + Tawaf rings, Marwa */}
        <div className="relative flex items-end justify-center">
          {/* Safa (left hill) */}
          <svg width="70" height="90" viewBox="0 0 70 90" fill="none" className="relative -mr-4 mb-1">
            <path d="M0 90 L8 55 Q35 20 62 55 L70 90 Z" fill="#57534e" opacity="0.75" />
            <path d="M8 55 Q35 20 62 55" stroke="#a8a29e" strokeWidth="1" opacity="0.4" fill="none" />
            <text x="35" y="82" textAnchor="middle" fontSize="8" fill="#d6d3d1" opacity="0.7" fontFamily="sans-serif">
              Safa
            </text>
          </svg>

          {/* Sa'i walking path between the hills */}
          <svg width="120" height="20" viewBox="0 0 120 20" className="absolute bottom-[18px] left-1/2 -translate-x-1/2 -z-10">
            <path d="M5 10 Q60 -4 115 10" stroke="#d4af37" strokeWidth="1" strokeDasharray="1 5" opacity="0.35" fill="none" />
            <circle r="2" fill="#f2d98a" opacity="0.8">
              <animateMotion dur="6s" repeatCount="indefinite" path="M5 10 Q60 -4 115 10" />
            </circle>
          </svg>

          {/* Kaaba illustration with Tawaf rings */}
          <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
            <ellipse cx="110" cy="152" rx="95" ry="26" stroke="#d4af37" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 6" className="hajj-ring" />
            <ellipse cx="110" cy="152" rx="72" ry="19" stroke="#d4af37" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" className="hajj-ring hajj-ring-delay1" />
            <ellipse cx="110" cy="152" rx="50" ry="13" stroke="#d4af37" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 6" className="hajj-ring hajj-ring-delay2" />

            <polygon points="150,60 168,48 168,140 150,150" fill="#000000" />
            <polygon points="70,60 88,48 168,48 150,60" fill="#1c1c1c" />
            <rect x="70" y="60" width="80" height="90" fill="#0a0a0a" />

            <rect x="70" y="82" width="80" height="12" fill="#d4af37" className="hajj-band" />
            <rect x="70" y="82" width="80" height="2" fill="#f2d98a" />
            <rect x="70" y="92" width="80" height="2" fill="#a9822a" />

            <rect x="102" y="108" width="18" height="32" rx="2" fill="#d4af37" />
            <rect x="102" y="108" width="18" height="32" rx="2" stroke="#a9822a" strokeWidth="1" />

            <circle cx="74" cy="146" r="3.5" fill="#f2d98a" />
          </svg>

          {/* Marwa (right hill) */}
          <svg width="70" height="90" viewBox="0 0 70 90" fill="none" className="relative -ml-4 mb-1">
            <path d="M0 90 L8 55 Q35 20 62 55 L70 90 Z" fill="#57534e" opacity="0.75" />
            <path d="M8 55 Q35 20 62 55" stroke="#a8a29e" strokeWidth="1" opacity="0.4" fill="none" />
            <text x="35" y="82" textAnchor="middle" fontSize="8" fill="#d6d3d1" opacity="0.7" fontFamily="sans-serif">
              Marwa
            </text>
          </svg>
        </div>

        {/* Talbiyah */}
        <p
          dir="rtl"
          className="mt-8 text-3xl text-amber-100/90 leading-relaxed"
          style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
        >
          لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
        </p>
        <p className="mt-2 text-sm text-emerald-200/60 italic tracking-wide">
          &ldquo;Here I am, O Allah, here I am&rdquo;
        </p>

        <div className="mt-8 h-px w-16 bg-amber-400/40" />

        <p className="mt-8 text-lg font-semibold text-white tracking-wide">GIA Hajj Operations</p>
        <p className="mt-1 text-sm text-emerald-200/50">Serving the Guests of Allah</p>
      </div>

      {/* Sand dunes with drifting particles */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 800 90" preserveAspectRatio="none" className="w-full h-[90px]">
          <path d="M0 40 Q200 5 400 30 T800 20 V90 H0 Z" fill="#78350f" opacity="0.55" />
          <path d="M0 55 Q220 25 450 50 T800 42 V90 H0 Z" fill="#92400e" opacity="0.6" />
          <path d="M0 70 Q250 50 500 68 T800 60 V90 H0 Z" fill="#b45309" opacity="0.5" />
        </svg>

        {/* Mosque skyline silhouette, sitting on the dunes */}
        <svg
          className="absolute bottom-6 left-0 w-full"
          viewBox="0 0 800 120"
          preserveAspectRatio="none"
          fill="#000000"
          opacity="0.55"
        >
          <rect x="0" y="70" width="800" height="50" />
          <rect x="60" y="40" width="16" height="80" />
          <circle cx="68" cy="36" r="7" />
          <rect x="700" y="40" width="16" height="80" />
          <circle cx="708" cy="36" r="7" />
          <path d="M300 70 C300 20 500 20 500 70 Z" />
          <rect x="380" y="10" width="10" height="60" />
          <circle cx="385" cy="8" r="5" />
        </svg>

        {/* Drifting sand particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { left: '10%', delay: '0s', dur: '7s' },
            { left: '25%', delay: '1.5s', dur: '9s' },
            { left: '45%', delay: '0.8s', dur: '8s' },
            { left: '65%', delay: '2.2s', dur: '10s' },
            { left: '80%', delay: '1s', dur: '7.5s' },
            { left: '92%', delay: '3s', dur: '9s' },
          ].map((p, i) => (
            <span
              key={i}
              className="hajj-sand"
              style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .hajj-glow {
          background: radial-gradient(circle at 50% 38%, rgba(212, 175, 55, 0.16), transparent 60%);
          animation: hajjGlowPulse 6s ease-in-out infinite;
        }
        @keyframes hajjGlowPulse {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }

        .hajj-star {
          position: absolute;
          border-radius: 9999px;
          background: #f2d98a;
          animation: hajjTwinkle 3.5s ease-in-out infinite;
        }
        @keyframes hajjTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }

        .hajj-plane-track {
          animation: hajjFly 22s linear infinite;
        }
        @keyframes hajjFly {
          0% { transform: translate(-10%, 0); opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { transform: translate(340%, -6px); opacity: 0; }
        }

        .hajj-pulse-slow {
          animation: hajjPulseSlow 4s ease-in-out infinite;
        }
        @keyframes hajjPulseSlow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .hajj-ring {
          transform-origin: center;
          animation: hajjRingPulse 4s ease-in-out infinite;
        }
        .hajj-ring-delay1 { animation-delay: 0.6s; }
        .hajj-ring-delay2 { animation-delay: 1.2s; }
        @keyframes hajjRingPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .hajj-band {
          animation: hajjBandShimmer 5s ease-in-out infinite;
        }
        @keyframes hajjBandShimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.25); }
        }

        .hajj-sand {
          position: absolute;
          bottom: 10px;
          width: 3px;
          height: 3px;
          border-radius: 9999px;
          background: #f2d98a;
          opacity: 0;
          animation-name: hajjSandDrift;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
        @keyframes hajjSandDrift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.6; }
          100% { transform: translateY(-70px) translateX(10px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
