export default function HajjVisualPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden">
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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
        {/* Crescent + star */}
        <svg width="56" height="56" viewBox="0 0 44 44" fill="none" className="mb-6 text-amber-300/80 hajj-pulse-slow">
          <path d="M27 8a14 14 0 1 0 0 28 11 11 0 1 1 0-28Z" fill="currentColor" opacity="0.9" />
          <path d="M36 10l1.2 2.6L40 14l-2.8 1.4L36 18l-1.2-2.6L32 14l2.8-1.4L36 10Z" fill="currentColor" />
        </svg>

        {/* Safa, Kaaba + Tawaf rings, Marwa — all grounded on the same baseline */}
        <div className="relative flex items-end justify-center">
          {/* Safa (left hill) */}
          <svg width="89" height="114" viewBox="0 0 70 90" fill="none" className="relative -mr-5">
            <path d="M0 90 L8 55 Q35 20 62 55 L70 90 Z" fill="#57534e" opacity="0.8" />
            <path d="M8 55 Q35 20 62 55" stroke="#a8a29e" strokeWidth="1" opacity="0.4" fill="none" />
            <text
              x="35"
              y="80"
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#fde68a"
              stroke="#052e21"
              strokeWidth="0.6"
              paintOrder="stroke"
              fontFamily="Arial, sans-serif"
              letterSpacing="0.5"
            >
              SAFA
            </text>
          </svg>

          {/* Sa'i walking path between the hills */}
          <svg width="152" height="25" viewBox="0 0 120 20" className="absolute bottom-[22px] left-1/2 -translate-x-1/2 -z-10">
            <path d="M5 10 Q60 -4 115 10" stroke="#d4af37" strokeWidth="1" strokeDasharray="1 5" opacity="0.35" fill="none" />
            <circle r="2" fill="#f2d98a" opacity="0.8">
              <animateMotion dur="6s" repeatCount="indefinite" path="M5 10 Q60 -4 115 10" />
            </circle>
          </svg>

          {/* Kaaba illustration with Tawaf rings — viewBox cropped to the actual
              content bottom (178) so it grounds flush with the hills, no gap */}
          <svg width="280" height="229" viewBox="0 0 220 180" fill="none">
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
          <svg width="89" height="114" viewBox="0 0 70 90" fill="none" className="relative -ml-5">
            <path d="M0 90 L8 55 Q35 20 62 55 L70 90 Z" fill="#57534e" opacity="0.8" />
            <path d="M8 55 Q35 20 62 55" stroke="#a8a29e" strokeWidth="1" opacity="0.4" fill="none" />
            <text
              x="35"
              y="80"
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#fde68a"
              stroke="#052e21"
              strokeWidth="0.6"
              paintOrder="stroke"
              fontFamily="Arial, sans-serif"
              letterSpacing="0.5"
            >
              MARWA
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

      <style jsx>{`
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
      `}</style>
    </div>
  );
}
