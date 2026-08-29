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

      {/* Radial gold glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 38%, rgba(212,175,55,0.16), transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
        {/* Crescent + star */}
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="mb-8 text-amber-300/80">
          <path
            d="M27 8a14 14 0 1 0 0 28 11 11 0 1 1 0-28Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path d="M36 10l1.2 2.6L40 14l-2.8 1.4L36 18l-1.2-2.6L32 14l2.8-1.4L36 10Z" fill="currentColor" />
        </svg>

        {/* Kaaba illustration with Tawaf rings */}
        <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
          {/* Tawaf circumambulation rings */}
          <ellipse cx="110" cy="152" rx="95" ry="26" stroke="#d4af37" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 6" />
          <ellipse cx="110" cy="152" rx="72" ry="19" stroke="#d4af37" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />
          <ellipse cx="110" cy="152" rx="50" ry="13" stroke="#d4af37" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 6" />

          {/* Kaaba side face (shadow) */}
          <polygon points="150,60 168,48 168,140 150,150" fill="#000000" />
          {/* Kaaba top face */}
          <polygon points="70,60 88,48 168,48 150,60" fill="#1c1c1c" />
          {/* Kaaba front face */}
          <rect x="70" y="60" width="80" height="90" fill="#0a0a0a" />

          {/* Kiswah gold band */}
          <rect x="70" y="82" width="80" height="12" fill="#d4af37" />
          <rect x="70" y="82" width="80" height="2" fill="#f2d98a" />
          <rect x="70" y="92" width="80" height="2" fill="#a9822a" />

          {/* Gold door */}
          <rect x="102" y="108" width="18" height="32" rx="2" fill="#d4af37" />
          <rect x="102" y="108" width="18" height="32" rx="2" stroke="#a9822a" strokeWidth="1" />

          {/* Hajar al-Aswad marker */}
          <circle cx="74" cy="146" r="3.5" fill="#f2d98a" />
        </svg>

        {/* Talbiyah */}
        <p
          dir="rtl"
          className="mt-10 text-3xl text-amber-100/90 leading-relaxed"
          style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
        >
          لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
        </p>
        <p className="mt-2 text-sm text-emerald-200/60 italic tracking-wide">
          &ldquo;Here I am, O Allah, here I am&rdquo;
        </p>

        <div className="mt-10 h-px w-16 bg-amber-400/40" />

        <p className="mt-10 text-lg font-semibold text-white tracking-wide">GIA Hajj Operations</p>
        <p className="mt-1 text-sm text-emerald-200/50">Serving the Guests of Allah</p>
      </div>

      {/* Mosque skyline silhouette */}
      <svg
        className="absolute bottom-0 left-0 w-full"
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
    </div>
  );
}
