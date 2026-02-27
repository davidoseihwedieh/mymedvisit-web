export function SharingSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 720 420" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="s-glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0a7ea4" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#0a7ea4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s-glow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="s-lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0a7ea4" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0a7ea4" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="s-tealBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0E7490" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="s-blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Soft background glows */}
      <ellipse cx="360" cy="210" rx="320" ry="180" fill="url(#s-glow1)" />
      <ellipse cx="530" cy="160" rx="140" ry="100" fill="url(#s-glow2)" />

      {/* ========== CONNECTION LINES (behind everything) ========== */}
      {/* Patient to AI Hub */}
      <path d="M 175 200 C 220 200 250 200 305 200" stroke="url(#s-lineGrad)" strokeWidth="2.5" strokeDasharray="8 5">
        <animate attributeName="stroke-dashoffset" from="0" to="-26" dur="2s" repeatCount="indefinite" />
      </path>
      {/* AI Hub to Daughter */}
      <path d="M 415 185 C 460 170 490 125 540 110" stroke="url(#s-lineGrad)" strokeWidth="2" strokeDasharray="7 4">
        <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="2s" repeatCount="indefinite" />
      </path>
      {/* AI Hub to Caregiver */}
      <path d="M 415 200 C 460 200 490 200 540 200" stroke="url(#s-lineGrad)" strokeWidth="2" strokeDasharray="7 4">
        <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="2.2s" repeatCount="indefinite" />
      </path>
      {/* AI Hub to Doctor */}
      <path d="M 415 215 C 460 230 490 275 540 290" stroke="url(#s-lineGrad)" strokeWidth="2" strokeDasharray="7 4">
        <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="2.4s" repeatCount="indefinite" />
      </path>

      {/* ========== PATIENT — torso with microphone ========== */}
      <g>
        {/* Circle background */}
        <circle cx="120" cy="200" r="56" fill="white" fillOpacity="0.92" stroke="#0a7ea4" strokeWidth="2" />
        {/* Head */}
        <circle cx="120" cy="175" r="14" fill="#0a7ea4" fillOpacity="0.12" stroke="#0a7ea4" strokeWidth="1.2" />
        {/* Torso / shoulders */}
        <path d="M92 218 C92 204 108 196 120 196 C132 196 148 204 148 218" fill="#0a7ea4" fillOpacity="0.08" stroke="#0a7ea4" strokeWidth="1.2" strokeLinecap="round" />
        {/* Arms hint */}
        <path d="M92 218 L85 232" stroke="#0a7ea4" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round" />
        <path d="M148 218 L155 232" stroke="#0a7ea4" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round" />
        {/* Microphone near mouth */}
        <rect x="138" y="166" width="8" height="12" rx="4" fill="#0a7ea4" fillOpacity="0.4" stroke="#0a7ea4" strokeWidth="0.8" />
        <path d="M142 178 v4" stroke="#0a7ea4" strokeWidth="0.8" />
        {/* Pulse rings around mic */}
        <circle cx="142" cy="172" r="14" fill="none" stroke="#0a7ea4" strokeWidth="0.5" strokeOpacity="0.2">
          <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Labels */}
        <text x="120" y="268" textAnchor="middle" className="text-[12px] font-semibold" fill="#0d1b2a" fillOpacity="0.75">Patient</text>
        <text x="120" y="283" textAnchor="middle" className="text-[9px]" fill="#0a7ea4" fillOpacity="0.7">Voice capture</text>
      </g>

      {/* ========== AI ENGINE — center hub ========== */}
      <g>
        {/* Outer glow ring */}
        <circle cx="360" cy="200" r="58" fill="url(#s-blueGrad)" stroke="#1E40AF" strokeWidth="2" strokeOpacity="0.3" />
        {/* Inner ring */}
        <circle cx="360" cy="200" r="42" fill="white" fillOpacity="0.95" stroke="#0a7ea4" strokeWidth="1.5">
          <animateTransform attributeName="transform" type="rotate" from="0 360 200" to="360 360 200" dur="30s" repeatCount="indefinite" />
        </circle>
        {/* Brain network icon */}
        <circle cx="350" cy="190" r="4" fill="#0a7ea4" fillOpacity="0.25" stroke="#0a7ea4" strokeWidth="1" />
        <circle cx="370" cy="190" r="4" fill="#1E40AF" fillOpacity="0.25" stroke="#1E40AF" strokeWidth="1" />
        <circle cx="360" cy="205" r="4" fill="#0a7ea4" fillOpacity="0.25" stroke="#0a7ea4" strokeWidth="1" />
        <circle cx="345" cy="205" r="3" fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" strokeWidth="0.8" />
        <circle cx="375" cy="205" r="3" fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" strokeWidth="0.8" />
        {/* Neural connections */}
        <path d="M350 190 L370 190 M350 190 L360 205 M370 190 L360 205 M345 205 L360 205 L375 205" stroke="#0a7ea4" strokeWidth="0.8" strokeOpacity="0.4" />
        {/* Labels */}
        <text x="360" y="232" textAnchor="middle" className="text-[11px] font-bold" fill="#1E40AF">AI Engine</text>
        <text x="360" y="246" textAnchor="middle" className="text-[8px]" fill="#0d1b2a" fillOpacity="0.4">Summarize &bull; Encrypt</text>
      </g>

      {/* Flow labels */}
      <g>
        <rect x="215" y="182" width="70" height="20" rx="10" fill="#0a7ea4" fillOpacity="0.08" />
        <text x="250" y="196" textAnchor="middle" className="text-[8px] font-semibold" fill="#0E7490">Voice data</text>
      </g>
      <g>
        <rect x="440" y="182" width="65" height="20" rx="10" fill="#1E40AF" fillOpacity="0.06" />
        <text x="472" y="196" textAnchor="middle" className="text-[8px] font-semibold" fill="#1E40AF">Summary</text>
      </g>

      {/* Shield / E2E encryption badge */}
      <g>
        <path d="M353 148 L360 140 L367 148 L367 160 C367 164 360 169 360 169 C360 169 353 164 353 160 Z" fill="#0a7ea4" fillOpacity="0.1" stroke="#0a7ea4" strokeWidth="1.2" />
        <path d="M357 156 L360 159 L365 153" fill="none" stroke="#0a7ea4" strokeWidth="1.2" strokeLinecap="round" />
        <text x="360" y="135" textAnchor="middle" className="text-[8px] font-medium" fill="#0E7490" fillOpacity="0.7">E2E Encrypted</text>
      </g>

      {/* ========== DAUGHTER — female torso with phone ========== */}
      <g>
        <circle cx="590" cy="110" r="44" fill="white" fillOpacity="0.92" stroke="#3B82F6" strokeWidth="1.8" />
        {/* Head — slightly smaller, female hint with longer neck */}
        <circle cx="590" cy="88" r="11" fill="#3B82F6" fillOpacity="0.1" stroke="#3B82F6" strokeWidth="1" />
        {/* Hair hint */}
        <path d="M580 84 C580 78 600 78 600 84" fill="#3B82F6" fillOpacity="0.06" stroke="none" />
        {/* Torso */}
        <path d="M566 128 C566 116 578 108 590 108 C602 108 614 116 614 128" fill="#3B82F6" fillOpacity="0.06" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round" />
        {/* Phone icon in hand */}
        <rect x="605" y="112" width="7" height="12" rx="1.5" fill="none" stroke="#3B82F6" strokeWidth="0.8" />
        <circle cx="608.5" cy="121" r="0.8" fill="#3B82F6" />
        {/* Labels */}
        <text x="590" y="166" textAnchor="middle" className="text-[12px] font-semibold" fill="#0d1b2a" fillOpacity="0.75">Daughter</text>
        <text x="590" y="180" textAnchor="middle" className="text-[9px]" fill="#3B82F6" fillOpacity="0.7">Full summary</text>
      </g>

      {/* ========== CAREGIVER — torso with clipboard ========== */}
      <g>
        <circle cx="590" cy="200" r="44" fill="white" fillOpacity="0.92" stroke="#0a7ea4" strokeWidth="1.8" />
        {/* Head */}
        <circle cx="590" cy="178" r="11" fill="#0a7ea4" fillOpacity="0.1" stroke="#0a7ea4" strokeWidth="1" />
        {/* Torso */}
        <path d="M566 218 C566 206 578 198 590 198 C602 198 614 206 614 218" fill="#0a7ea4" fillOpacity="0.06" stroke="#0a7ea4" strokeWidth="1" strokeLinecap="round" />
        {/* Clipboard icon */}
        <rect x="604" y="198" width="9" height="12" rx="1" fill="none" stroke="#0a7ea4" strokeWidth="0.8" />
        <path d="M606 198 v-2 h5 v2" fill="none" stroke="#0a7ea4" strokeWidth="0.8" />
        <path d="M606 202 h5 M606 205 h3.5" stroke="#0a7ea4" strokeWidth="0.5" strokeOpacity="0.5" />
        {/* Labels */}
        <text x="590" y="256" textAnchor="middle" className="text-[12px] font-semibold" fill="#0d1b2a" fillOpacity="0.75">Caregiver</text>
        <text x="590" y="270" textAnchor="middle" className="text-[9px]" fill="#0a7ea4" fillOpacity="0.7">Medications only</text>
      </g>

      {/* ========== DOCTOR — torso with stethoscope ========== */}
      <g>
        <circle cx="590" cy="290" r="44" fill="white" fillOpacity="0.92" stroke="#1E40AF" strokeWidth="1.8" />
        {/* Head */}
        <circle cx="590" cy="268" r="11" fill="#1E40AF" fillOpacity="0.1" stroke="#1E40AF" strokeWidth="1" />
        {/* Torso — broader shoulders for doctor */}
        <path d="M564 308 C564 296 576 288 590 288 C604 288 616 296 616 308" fill="#1E40AF" fillOpacity="0.06" stroke="#1E40AF" strokeWidth="1" strokeLinecap="round" />
        {/* Stethoscope */}
        <path d="M580 288 C578 296 582 302 590 302 C598 302 602 296 600 288" fill="none" stroke="#1E40AF" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="590" cy="303" r="2.5" fill="#1E40AF" fillOpacity="0.15" stroke="#1E40AF" strokeWidth="0.8" />
        {/* Labels */}
        <text x="590" y="346" textAnchor="middle" className="text-[12px] font-semibold" fill="#0d1b2a" fillOpacity="0.75">Doctor</text>
        <text x="590" y="360" textAnchor="middle" className="text-[9px]" fill="#1E40AF" fillOpacity="0.7">Vitals & trends</text>
      </g>

      {/* Bottom caption bar */}
      <rect x="220" y="388" width="280" height="24" rx="12" fill="white" fillOpacity="0.5" />
      <circle cx="250" cy="400" r="4" fill="#0a7ea4" fillOpacity="0.4" />
      <text x="260" y="403" className="text-[8px]" fill="#0d1b2a" fillOpacity="0.5">Voice → Summary</text>
      <circle cx="370" cy="400" r="4" fill="#1E40AF" fillOpacity="0.4" />
      <text x="380" y="403" className="text-[8px]" fill="#0d1b2a" fillOpacity="0.5">Granular access control</text>
    </svg>
  )
}
