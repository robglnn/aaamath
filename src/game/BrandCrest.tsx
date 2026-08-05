/** Winged-shield crest matching Fortnite-ref HUD diegesis (gold + cyan). */
export function BrandCrest({ className = '', size = 56 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="ar-crest-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe6a0" />
          <stop offset="55%" stopColor="#f0a830" />
          <stop offset="100%" stopColor="#b8731a" />
        </linearGradient>
        <linearGradient id="ar-crest-cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9ff5ea" />
          <stop offset="100%" stopColor="#3dd6c6" />
        </linearGradient>
        <filter id="ar-crest-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ar-crest-wing-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.2" result="wg" />
          <feMerge>
            <feMergeNode in="wg" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Left wing — loop 30: stronger wing juice */}
      <path
        d="M28 22c-7-2-14 1-18 7-1.2 1.8 0.4 3.4 2.2 2.8 4.5-1.5 8.2-1.2 11.4 0.6 1.2-3.4 2.8-7 4.4-10.4z"
        fill="url(#ar-crest-gold)"
        opacity="0.98"
        filter="url(#ar-crest-wing-glow)"
      />
      {/* Right wing */}
      <path
        d="M36 22c7-2 14 1 18 7 1.2 1.8-0.4 3.4-2.2 2.8-4.5-1.5-8.2-1.2-11.4 0.6-1.2-3.4-2.8-7-4.4-10.4z"
        fill="url(#ar-crest-gold)"
        opacity="0.98"
        filter="url(#ar-crest-wing-glow)"
      />
      {/* Shield body */}
      <path
        d="M32 12c6 2.5 12 3.2 16 3.5v14.5c0 9.2-6.4 16.8-16 21.5-9.6-4.7-16-12.3-16-21.5V15.5c4-0.3 10-1 16-3.5z"
        fill="#0b1a24"
        stroke="url(#ar-crest-gold)"
        strokeWidth="2.2"
        filter="url(#ar-crest-glow)"
      />
      {/* Inner gem */}
      <circle cx="32" cy="30" r="7.5" fill="url(#ar-crest-cyan)" opacity="0.98" filter="url(#ar-crest-glow)" />
      <circle cx="32" cy="30" r="3.2" fill="#e8fffb" opacity="0.92" />
      {/* Chevron + gem highlight for diegetic rank read */}
      <path d="M26 40l6 4 6-4" fill="none" stroke="url(#ar-crest-gold)" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M32 18c3 1.2 6 1.6 8 1.7v7.2c0 4.6-3.2 8.4-8 10.8-4.8-2.4-8-6.2-8-10.8v-7.2c2-0.1 5-0.5 8-1.7z"
        fill="none"
        stroke="#9ff5ea"
        strokeWidth="0.9"
        opacity="0.55"
      />
    </svg>
  )
}
