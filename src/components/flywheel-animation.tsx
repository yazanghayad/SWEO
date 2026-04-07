export function FlywheelAnimation({ className }: { className?: string }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 960 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="fw-glow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* All tracks centered at (480, 256) */}
          <path id="fw-t1" d="M 295,78 L 665,78 A 178,178 0 0,1 665,434 L 295,434 A 178,178 0 0,1 295,78 Z" />
          <path id="fw-t2" d="M 302,118 L 658,118 A 138,138 0 0,1 658,394 L 302,394 A 138,138 0 0,1 302,118 Z" />
          <path id="fw-t4" d="M 285,218 L 675,218 A 38,38 0 0,1 675,294 L 285,294 A 38,38 0 0,1 285,218 Z" />
        </defs>

        {/* Track 1 - outer dashed */}
        <use href="#fw-t1" stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="8 6" fill="none" />
        {/* Track 2 */}
        <use href="#fw-t2" stroke="rgba(255,255,255,0.14)" strokeWidth="1" fill="none" />
        {/* Track 3 */}
        {/* <use href="#fw-t3" stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none" /> */}
        {/* Track 4 - innermost */}
        <use href="#fw-t4" stroke="rgba(255,255,255,0.16)" strokeWidth="1" fill="none" />

        {/* Center dashed circle */}
        <circle cx="480" cy="256" r="52" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4 4" fill="none" />

        {/* Animated dot on track 4 */}
        <circle r="3.5" fill="rgba(200,190,175,0.7)" filter="url(#fw-glow)">
          <animateMotion dur="20s" repeatCount="indefinite">
            <mpath href="#fw-t4" />
          </animateMotion>
        </circle>

        {/* Second dot on track 2 */}
        <circle r="2.5" fill="rgba(200,190,175,0.4)" filter="url(#fw-glow)">
          <animateMotion dur="28s" repeatCount="indefinite" begin="-7s">
            <mpath href="#fw-t2" />
          </animateMotion>
        </circle>

        {/* TRAIN - top center */}
        <g>
          <rect x="446" y="65" width="68" height="27" rx="13.5" fill="rgba(100,85,70,0.55)" />
          <text x="480" y="83" textAnchor="middle" fill="rgba(255,255,255,0.78)" style={{ fontSize: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.14em', fontWeight: 500 }}>TRAIN</text>
        </g>

        {/* TEST - right center */}
        <g>
          <rect x="817" y="243" width="52" height="27" rx="13.5" fill="rgba(100,85,70,0.45)" />
          <text x="843" y="261" textAnchor="middle" fill="rgba(255,255,255,0.72)" style={{ fontSize: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.14em', fontWeight: 500 }}>TEST</text>
        </g>

        {/* DEPLOY - bottom center */}
        <g>
          <rect x="441" y="421" width="78" height="27" rx="13.5" fill="rgba(100,85,70,0.55)" />
          <text x="480" y="439" textAnchor="middle" fill="rgba(255,255,255,0.78)" style={{ fontSize: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.14em', fontWeight: 500 }}>DEPLOY</text>
        </g>

        {/* ANALYZE - left center */}
        <g>
          <rect x="75" y="243" width="84" height="27" rx="13.5" fill="rgba(100,85,70,0.45)" />
          <text x="117" y="261" textAnchor="middle" fill="rgba(255,255,255,0.72)" style={{ fontSize: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.14em', fontWeight: 500 }}>ANALYZE</text>
        </g>
      </svg>
    </div>
  );
}
