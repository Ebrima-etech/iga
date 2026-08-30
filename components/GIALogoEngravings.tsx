export default function GIALogoEngravings() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="giaLogos" width="800" height="600" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#d4af37" strokeWidth="1.2" opacity="0.08">
            {/* GIA Logo 1 - Top Left */}
            <g transform="translate(100,80)">
              <rect x="-15" y="-15" width="30" height="30" rx="2" />
              <text x="0" y="8" fontSize="14" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#d4af37" textAnchor="middle">
                GIA
              </text>
            </g>

            {/* GIA Logo 2 - Top Right */}
            <g transform="translate(700,100) rotate(15)">
              <rect x="-12" y="-12" width="24" height="24" rx="2" />
              <text x="0" y="6" fontSize="12" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="1" stroke="none" fill="#d4af37" textAnchor="middle">
                GIA
              </text>
            </g>

            {/* GIA Logo 3 - Center */}
            <g transform="translate(400,300) rotate(-10)">
              <rect x="-18" y="-18" width="36" height="36" rx="3" />
              <text x="0" y="10" fontSize="16" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="2" stroke="none" fill="#d4af37" textAnchor="middle">
                GIA
              </text>
            </g>

            {/* GIA Logo 4 - Bottom Left */}
            <g transform="translate(150,480) rotate(8)">
              <rect x="-14" y="-14" width="28" height="28" rx="2" />
              <text x="0" y="7" fontSize="13" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#d4af37" textAnchor="middle">
                GIA
              </text>
            </g>

            {/* GIA Logo 5 - Bottom Right */}
            <g transform="translate(650,520) rotate(-12)">
              <rect x="-16" y="-16" width="32" height="32" rx="2.5" />
              <text x="0" y="9" fontSize="15" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="1.8" stroke="none" fill="#d4af37" textAnchor="middle">
                GIA
              </text>
            </g>

            {/* GIA Decorative Border Pattern - Top */}
            <line x1="50" y1="30" x2="750" y2="30" strokeDasharray="8 4" strokeWidth="0.8" opacity="0.06" />

            {/* GIA Decorative Border Pattern - Bottom */}
            <line x1="50" y1="570" x2="750" y2="570" strokeDasharray="8 4" strokeWidth="0.8" opacity="0.06" />

            {/* Small accent circles */}
            <circle cx="80" cy="180" r="6" opacity="0.05" />
            <circle cx="720" cy="250" r="5" opacity="0.05" />
            <circle cx="120" cy="420" r="7" opacity="0.05" />
            <circle cx="680" cy="380" r="6" opacity="0.05" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#giaLogos)" />
    </svg>
  );
}
