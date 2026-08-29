export default function HajjTermsBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="hajjTerms" width="620" height="460" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#022c22" strokeWidth="1.4" opacity="0.09">
            {/* TAWAF — circular arrow */}
            <g transform="translate(40,50) rotate(-6)">
              <circle cx="0" cy="0" r="11" />
              <path d="M9 -6 L11 0 L15 -2" fill="none" />
              <text x="-20" y="26" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                TAWAF
              </text>
            </g>

            {/* SA'I — footprints */}
            <g transform="translate(230,30) rotate(8)">
              <ellipse cx="-4" cy="0" rx="3.2" ry="5.5" />
              <ellipse cx="5" cy="10" rx="3.2" ry="5.5" />
              <text x="-24" y="34" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                SA&apos;I
              </text>
            </g>

            {/* IHRAM — draped cloth */}
            <g transform="translate(420,55) rotate(-4)">
              <path d="M-8 -8 Q0 -14 8 -8 L6 10 Q0 14 -6 10 Z" />
              <text x="-22" y="30" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                IHRAM
              </text>
            </g>

            {/* ZAMZAM — droplet */}
            <g transform="translate(90,180) rotate(5)">
              <path d="M0 -12 C6 -3 9 2 9 7 A9 9 0 1 1 -9 7 C-9 2 -6 -3 0 -12 Z" />
              <text x="-26" y="26" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                ZAMZAM
              </text>
            </g>

            {/* ARAFAT — mount of mercy */}
            <g transform="translate(320,170) rotate(-7)">
              <path d="M-14 8 L-4 -10 L4 2 L9 -6 L16 8 Z" />
              <circle cx="0" cy="-16" r="2.4" />
              <text x="-24" y="26" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                ARAFAT
              </text>
            </g>

            {/* MINA — tents */}
            <g transform="translate(510,190) rotate(6)">
              <path d="M-10 8 L0 -10 L10 8 Z" />
              <path d="M-4 8 L0 -2 L4 8" />
              <text x="-20" y="26" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                MINA
              </text>
            </g>

            {/* JAMARAT — pebbles */}
            <g transform="translate(160,300) rotate(-5)">
              <circle cx="-8" cy="2" r="3.4" />
              <circle cx="2" cy="-4" r="3.4" />
              <circle cx="9" cy="4" r="3.4" />
              <text x="-28" y="24" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                JAMARAT
              </text>
            </g>

            {/* TALBIYAH — crescent */}
            <g transform="translate(390,300) rotate(7)">
              <path d="M6 -10a10 10 0 1 0 0 20 8 8 0 1 1 0-20Z" />
              <text x="-26" y="26" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                TALBIYAH
              </text>
            </g>

            {/* KAABA — small cube */}
            <g transform="translate(550,60) rotate(4)">
              <rect x="-8" y="-8" width="16" height="16" />
              <rect x="-8" y="-2" width="16" height="3" fill="#022c22" stroke="none" />
              <text x="-22" y="22" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                KAABA
              </text>
            </g>

            {/* MUZDALIFAH — star */}
            <g transform="translate(30,400) rotate(-8)">
              <path d="M0 -9 L2.2 -2.5 L9 -2 L3.5 2 L5.5 9 L0 4.8 L-5.5 9 L-3.5 2 L-9 -2 L-2.2 -2.5 Z" />
              <text x="-40" y="24" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                MUZDALIFAH
              </text>
            </g>

            {/* UMRAH — text with small circle motif */}
            <g transform="translate(240,410) rotate(5)">
              <circle cx="0" cy="0" r="9" />
              <circle cx="0" cy="0" r="4" />
              <text x="-22" y="26" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1.5" stroke="none" fill="#022c22">
                UMRAH
              </text>
            </g>

            {/* HAJJ — larger signature term */}
            <g transform="translate(470,420) rotate(-3)">
              <text x="-22" y="4" fontSize="16" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="2" stroke="none" fill="#022c22">
                HAJJ
              </text>
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hajjTerms)" />
    </svg>
  );
}
