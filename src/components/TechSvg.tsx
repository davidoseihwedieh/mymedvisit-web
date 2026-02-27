export function EncryptionSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 720 340" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="e-bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0E7490" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="e-pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0a7ea4" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0a7ea4" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="e-tealBlue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0a7ea4" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="720" height="340" rx="20" fill="url(#e-bgGrad)" />

      {/* ========== PHONE / DEVICE ========== */}
      <g>
        <rect x="40" y="55" width="100" height="180" rx="16" fill="white" fillOpacity="0.92" stroke="#0a7ea4" strokeWidth="1.8" />
        {/* Screen area */}
        <rect x="50" y="72" width="80" height="130" rx="6" fill="#0a7ea4" fillOpacity="0.04" />
        {/* App header bar */}
        <rect x="55" y="78" width="70" height="10" rx="5" fill="#0a7ea4" fillOpacity="0.15" />
        {/* Content lines */}
        <rect x="55" y="96" width="55" height="5" rx="2.5" fill="#0d1b2a" fillOpacity="0.08" />
        <rect x="55" y="106" width="65" height="5" rx="2.5" fill="#0d1b2a" fillOpacity="0.06" />
        <rect x="55" y="116" width="45" height="5" rx="2.5" fill="#0d1b2a" fillOpacity="0.05" />
        {/* Lock icon */}
        <rect x="75" y="138" width="30" height="24" rx="5" fill="#0a7ea4" fillOpacity="0.12" stroke="#0a7ea4" strokeWidth="1.2" />
        <path d="M82 138 v-7 a8 8 0 0116 0 v7" fill="none" stroke="#0a7ea4" strokeWidth="1.5" />
        <circle cx="90" cy="150" r="3" fill="#0a7ea4" fillOpacity="0.4" />
        <path d="M90 153 v3" stroke="#0a7ea4" strokeWidth="1" />
        {/* Home bar */}
        <rect x="75" y="215" width="30" height="4" rx="2" fill="#0d1b2a" fillOpacity="0.1" />
        {/* Label */}
        <text x="90" y="256" textAnchor="middle" className="text-[10px] font-semibold" fill="#0E7490">On-device</text>
        <text x="90" y="270" textAnchor="middle" className="text-[10px] font-semibold" fill="#0E7490">encryption</text>
      </g>

      {/* ========== ARROW: Device → Cloud ========== */}
      <g>
        <path d="M145 145 L240 145" stroke="url(#e-pipeGrad)" strokeWidth="2.5" strokeDasharray="7 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.5s" repeatCount="indefinite" />
        </path>
        <rect x="165" y="130" width="55" height="20" rx="10" fill="white" fillOpacity="0.85" stroke="#0a7ea4" strokeWidth="0.8" />
        <text x="192" y="144" textAnchor="middle" className="text-[8px] font-bold" fill="#0E7490">AES-256</text>
      </g>

      {/* ========== SECURE CLOUD ========== */}
      <g>
        {/* Cloud shape */}
        <ellipse cx="330" cy="115" rx="65" ry="40" fill="white" fillOpacity="0.92" stroke="#0a7ea4" strokeWidth="1.8" />
        <ellipse cx="310" cy="108" rx="28" ry="20" fill="white" fillOpacity="0.5" />
        <ellipse cx="350" cy="108" rx="30" ry="22" fill="white" fillOpacity="0.5" />
        {/* Shield inside cloud */}
        <path d="M322 122 L330 114 L338 122 L338 134 C338 138 330 143 330 143 C330 143 322 138 322 134 Z" fill="#0a7ea4" fillOpacity="0.15" stroke="#0a7ea4" strokeWidth="1.2" />
        <path d="M326 130 L330 134 L336 127" fill="none" stroke="#0a7ea4" strokeWidth="1.2" strokeLinecap="round" />
        {/* Labels */}
        <text x="330" y="168" textAnchor="middle" className="text-[10px] font-semibold" fill="#0E7490">Zero-knowledge</text>
        <text x="330" y="182" textAnchor="middle" className="text-[10px] font-semibold" fill="#0E7490">processing</text>
      </g>

      {/* ========== AI BOX ========== */}
      <g>
        <rect x="260" y="200" width="140" height="60" rx="14" fill="white" fillOpacity="0.85" stroke="#1E40AF" strokeWidth="1.2" strokeDasharray="6 4" />
        {/* Brain icon */}
        <circle cx="300" cy="225" r="8" fill="#1E40AF" fillOpacity="0.08" stroke="#1E40AF" strokeWidth="0.8" />
        <path d="M296 225 h8 M300 221 v8" stroke="#1E40AF" strokeWidth="0.8" strokeOpacity="0.4" />
        <text x="340" y="224" textAnchor="middle" className="text-[10px] font-bold" fill="#1E40AF">AI Intelligence</text>
        <text x="340" y="240" textAnchor="middle" className="text-[8px]" fill="#0d1b2a" fillOpacity="0.4">Anonymized processing</text>
        {/* Connection from cloud to AI */}
        <path d="M330 183 v17" stroke="#0a7ea4" strokeWidth="1.2" strokeDasharray="4 3" />
      </g>

      {/* ========== ARROWS: Cloud → Recipients ========== */}
      <g>
        <path d="M395 110 L490 80" stroke="url(#e-pipeGrad)" strokeWidth="2" strokeDasharray="7 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M395 125 L490 155" stroke="url(#e-pipeGrad)" strokeWidth="2" strokeDasharray="7 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.7s" repeatCount="indefinite" />
        </path>
        <path d="M395 140 L490 230" stroke="url(#e-pipeGrad)" strokeWidth="2" strokeDasharray="7 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.9s" repeatCount="indefinite" />
        </path>
      </g>

      {/* ========== RECIPIENT 1: Family — torso ========== */}
      <g>
        <rect x="500" y="45" width="180" height="60" rx="14" fill="white" fillOpacity="0.92" stroke="#3B82F6" strokeWidth="1.5" />
        {/* Torso icon */}
        <circle cx="530" cy="68" r="8" fill="#3B82F6" fillOpacity="0.1" stroke="#3B82F6" strokeWidth="1" />
        <path d="M518 84 C518 78 524 74 530 74 C536 74 542 78 542 84" fill="#3B82F6" fillOpacity="0.06" stroke="#3B82F6" strokeWidth="0.8" />
        {/* Phone icon */}
        <rect x="540" y="64" width="5" height="8" rx="1" fill="none" stroke="#3B82F6" strokeWidth="0.6" />
        <text x="578" y="72" textAnchor="middle" className="text-[11px] font-semibold" fill="#0d1b2a" fillOpacity="0.75">Family</text>
        <text x="578" y="86" textAnchor="middle" className="text-[8px]" fill="#3B82F6" fillOpacity="0.6">Full summary</text>
      </g>

      {/* ========== RECIPIENT 2: Caregiver — torso + clipboard ========== */}
      <g>
        <rect x="500" y="120" width="180" height="60" rx="14" fill="white" fillOpacity="0.92" stroke="#0a7ea4" strokeWidth="1.5" />
        {/* Torso icon */}
        <circle cx="530" cy="143" r="8" fill="#0a7ea4" fillOpacity="0.1" stroke="#0a7ea4" strokeWidth="1" />
        <path d="M518 159 C518 153 524 149 530 149 C536 149 542 153 542 159" fill="#0a7ea4" fillOpacity="0.06" stroke="#0a7ea4" strokeWidth="0.8" />
        {/* Clipboard */}
        <rect x="540" y="139" width="6" height="8" rx="0.5" fill="none" stroke="#0a7ea4" strokeWidth="0.6" />
        <path d="M541 139 v-1.5 h4 v1.5" fill="none" stroke="#0a7ea4" strokeWidth="0.5" />
        <text x="578" y="147" textAnchor="middle" className="text-[11px] font-semibold" fill="#0d1b2a" fillOpacity="0.75">Caregiver</text>
        <text x="578" y="161" textAnchor="middle" className="text-[8px]" fill="#0a7ea4" fillOpacity="0.6">Meds only</text>
      </g>

      {/* ========== RECIPIENT 3: Doctor — torso + stethoscope ========== */}
      <g>
        <rect x="500" y="195" width="180" height="60" rx="14" fill="white" fillOpacity="0.92" stroke="#1E40AF" strokeWidth="1.5" />
        {/* Torso icon */}
        <circle cx="530" cy="218" r="8" fill="#1E40AF" fillOpacity="0.1" stroke="#1E40AF" strokeWidth="1" />
        <path d="M518 234 C518 228 524 224 530 224 C536 224 542 228 542 234" fill="#1E40AF" fillOpacity="0.06" stroke="#1E40AF" strokeWidth="0.8" />
        {/* Stethoscope hint */}
        <path d="M526 224 C525 228 527 230 530 230 C533 230 535 228 534 224" fill="none" stroke="#1E40AF" strokeWidth="0.7" strokeOpacity="0.4" />
        <circle cx="530" cy="231" r="1.5" fill="#1E40AF" fillOpacity="0.15" stroke="#1E40AF" strokeWidth="0.5" />
        <text x="578" y="222" textAnchor="middle" className="text-[11px] font-semibold" fill="#0d1b2a" fillOpacity="0.75">Doctor</text>
        <text x="578" y="236" textAnchor="middle" className="text-[8px]" fill="#1E40AF" fillOpacity="0.6">Vitals & trends</text>
      </g>

      {/* ========== BOTTOM LEGEND ========== */}
      <rect x="195" y="300" width="330" height="28" rx="14" fill="white" fillOpacity="0.5" />
      <circle cx="225" cy="314" r="5" fill="#0a7ea4" fillOpacity="0.3" stroke="#0a7ea4" strokeWidth="0.6" />
      <text x="237" y="318" className="text-[8px]" fill="#0d1b2a" fillOpacity="0.5">Encrypted in transit</text>
      <circle cx="360" cy="314" r="5" fill="#1E40AF" fillOpacity="0.3" stroke="#1E40AF" strokeWidth="0.6" />
      <text x="372" y="318" className="text-[8px]" fill="#0d1b2a" fillOpacity="0.5">Encrypted at rest</text>
      <circle cx="475" cy="314" r="5" fill="#3B82F6" fillOpacity="0.3" stroke="#3B82F6" strokeWidth="0.6" />
      <text x="487" y="318" className="text-[8px]" fill="#0d1b2a" fillOpacity="0.5">Granular access</text>
    </svg>
  )
}

export function AmbientSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 720 440" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="a-bodyGlow" cx="50%" cy="45%" r="40%">
          <stop offset="0%" stopColor="#0a7ea4" stopOpacity="0.05" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="a-tealBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a7ea4" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="a-streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0a7ea4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <rect width="720" height="440" rx="20" fill="url(#a-bodyGlow)" />

      {/* ========== CENTER: MANNEQUIN FIGURE ========== */}
      <g>
        {/* Head — hollow outline */}
        <circle cx="300" cy="72" r="28" fill="white" fillOpacity="0.4" stroke="#0a7ea4" strokeWidth="1.8" />
        {/* Face hint — eyes, subtle */}
        <circle cx="290" cy="68" r="2" fill="#0a7ea4" fillOpacity="0.15" />
        <circle cx="310" cy="68" r="2" fill="#0a7ea4" fillOpacity="0.15" />
        <path d="M292 80 C296 85 304 85 308 80" fill="none" stroke="#0a7ea4" strokeWidth="0.8" strokeOpacity="0.15" />

        {/* Neck */}
        <path d="M290 100 L290 112 M310 100 L310 112" stroke="#0a7ea4" strokeWidth="1.5" />

        {/* Shoulders + upper torso — hollow outline */}
        <path d="M228 160 C228 130 260 115 300 115 C340 115 372 130 372 160" fill="white" fillOpacity="0.3" stroke="#0a7ea4" strokeWidth="1.8" strokeLinecap="round" />

        {/* Chest area — hollow with dashed midline */}
        <path d="M248 160 L248 240 C248 260 275 275 300 275 C325 275 352 260 352 240 L352 160" fill="white" fillOpacity="0.2" stroke="#0a7ea4" strokeWidth="1.5" />
        <path d="M300 160 v100" stroke="#0a7ea4" strokeWidth="0.5" strokeDasharray="4 4" strokeOpacity="0.15" />

        {/* ===== LEFT ARM with Apple Watch ===== */}
        {/* Upper arm */}
        <path d="M228 160 C218 175 215 195 218 220" stroke="#0a7ea4" strokeWidth="1.5" fill="none" />
        {/* Forearm */}
        <path d="M218 220 C220 240 225 260 230 280" stroke="#0a7ea4" strokeWidth="1.5" fill="none" />
        {/* Hand outline */}
        <path d="M230 280 C228 288 232 296 238 296 C240 296 242 294 242 290" stroke="#0a7ea4" strokeWidth="1.2" fill="white" fillOpacity="0.3" />

        {/* APPLE WATCH on left wrist */}
        <rect x="210" y="262" width="24" height="30" rx="6" fill="white" fillOpacity="0.9" stroke="#0a7ea4" strokeWidth="2" />
        {/* Watch screen */}
        <rect x="214" y="267" width="16" height="20" rx="3" fill="#0a7ea4" fillOpacity="0.06" />
        {/* Heart rate icon on screen */}
        <path d="M219 274 l2 -3 l2 5 l2 -4 l2 3" stroke="#0a7ea4" strokeWidth="1" strokeLinecap="round" fill="none" />
        <text x="222" y="285" textAnchor="middle" className="text-[5px]" fill="#0a7ea4" fillOpacity="0.6">72</text>
        {/* Watch bands */}
        <rect x="216" y="255" width="12" height="7" rx="2" fill="#0a7ea4" fillOpacity="0.08" stroke="#0a7ea4" strokeWidth="0.5" />
        <rect x="216" y="292" width="12" height="7" rx="2" fill="#0a7ea4" fillOpacity="0.08" stroke="#0a7ea4" strokeWidth="0.5" />
        {/* Signal waves from watch */}
        <path d="M198 277 C194 272 194 266 198 261" stroke="#0a7ea4" strokeWidth="0.8" strokeOpacity="0.3" fill="none" />
        <path d="M192 280 C186 273 186 263 192 256" stroke="#0a7ea4" strokeWidth="0.6" strokeOpacity="0.2" fill="none" />

        {/* ===== RIGHT ARM with Oura Ring ===== */}
        {/* Upper arm */}
        <path d="M372 160 C382 175 385 195 382 220" stroke="#0a7ea4" strokeWidth="1.5" fill="none" />
        {/* Forearm */}
        <path d="M382 220 C380 240 375 260 370 280" stroke="#0a7ea4" strokeWidth="1.5" fill="none" />
        {/* Hand outline */}
        <path d="M370 280 C372 288 368 296 362 296 C360 296 358 294 358 290" stroke="#0a7ea4" strokeWidth="1.2" fill="white" fillOpacity="0.3" />
        {/* Fingers hint */}
        <path d="M362 296 L358 306 M364 295 L362 308 M367 293 L366 306 M370 290 L370 304" stroke="#0a7ea4" strokeWidth="0.8" strokeOpacity="0.4" fill="none" strokeLinecap="round" />

        {/* OURA RING on right ring finger */}
        <ellipse cx="366" cy="300" rx="5" ry="4" fill="none" stroke="#1E40AF" strokeWidth="2.5" />
        <ellipse cx="366" cy="300" rx="5" ry="4" fill="none" stroke="#3B82F6" strokeWidth="0.5" strokeOpacity="0.4" />
        {/* Signal waves from ring */}
        <path d="M380 296 C384 292 384 286 380 282" stroke="#1E40AF" strokeWidth="0.8" strokeOpacity="0.3" fill="none" />
        <path d="M386 299 C392 293 392 283 386 277" stroke="#1E40AF" strokeWidth="0.6" strokeOpacity="0.2" fill="none" />

        {/* ===== CGM PATCH on upper arm ===== */}
        <circle cx="380" cy="180" r="8" fill="white" fillOpacity="0.8" stroke="#0E7490" strokeWidth="1.5" />
        <circle cx="380" cy="180" r="3" fill="#0E7490" fillOpacity="0.2" />
        <text x="380" y="198" textAnchor="middle" className="text-[6px]" fill="#0E7490" fillOpacity="0.5">CGM</text>
        {/* Signal from CGM */}
        <path d="M389 176 C393 172 393 168 389 164" stroke="#0E7490" strokeWidth="0.7" strokeOpacity="0.3" fill="none" />

        {/* Heartbeat line across chest */}
        <path d="M265 185 h10 l3 -8 l4 16 l4 -16 l3 8 h10" stroke="#0a7ea4" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" fill="none">
          <animate attributeName="stroke-opacity" values="0.15;0.35;0.15" dur="1.5s" repeatCount="indefinite" />
        </path>
      </g>

      {/* ========== DATA STREAMS from wearables to APP ========== */}

      {/* Stream from Apple Watch (left) → App panel */}
      <path d="M192 268 C140 250 120 220 100 180 C85 150 85 120 108 95" stroke="#0a7ea4" strokeWidth="1.2" strokeDasharray="5 4" strokeOpacity="0.35">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="2s" repeatCount="indefinite" />
      </path>

      {/* Stream from Oura Ring (right) → App panel */}
      <path d="M392 288 C430 270 460 240 520 220 C560 205 590 180 612 155" stroke="#1E40AF" strokeWidth="1.2" strokeDasharray="5 4" strokeOpacity="0.35">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="2.2s" repeatCount="indefinite" />
      </path>

      {/* Stream from CGM → App panel */}
      <path d="M389 172 C420 140 470 110 530 90 C570 78 600 72 620 72" stroke="#0E7490" strokeWidth="1.2" strokeDasharray="5 4" strokeOpacity="0.35">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="2.4s" repeatCount="indefinite" />
      </path>

      {/* ========== TOP-LEFT: Apple Health data card ========== */}
      <g>
        <rect x="30" y="35" width="150" height="80" rx="16" fill="white" fillOpacity="0.9" stroke="#0a7ea4" strokeWidth="1.5" />
        {/* Apple Health icon hint */}
        <rect x="45" y="50" width="24" height="24" rx="6" fill="#0a7ea4" fillOpacity="0.08" />
        <path d="M53 56 l2 -3 l2 5 l3 -7 l2 5 l2 -3" stroke="#0a7ea4" strokeWidth="1" strokeLinecap="round" fill="none" />
        <text x="78" y="60" className="text-[10px] font-semibold" fill="#0d1b2a" fillOpacity="0.75">HealthKit</text>
        <text x="78" y="73" className="text-[7px]" fill="#0d1b2a" fillOpacity="0.4">Heart rate &bull; Steps</text>
        {/* Mini data bars */}
        <rect x="45" y="88" width="40" height="4" rx="2" fill="#0a7ea4" fillOpacity="0.12" />
        <rect x="45" y="88" width="28" height="4" rx="2" fill="#0a7ea4" fillOpacity="0.3" />
        <rect x="95" y="88" width="40" height="4" rx="2" fill="#0a7ea4" fillOpacity="0.12" />
        <rect x="95" y="88" width="32" height="4" rx="2" fill="#0a7ea4" fillOpacity="0.3" />
        <text x="45" y="104" className="text-[6px]" fill="#0a7ea4" fillOpacity="0.5">72 bpm</text>
        <text x="95" y="104" className="text-[6px]" fill="#0a7ea4" fillOpacity="0.5">8,420 steps</text>
      </g>

      {/* ========== TOP-RIGHT: App / Phone receiving data ========== */}
      <g>
        <rect x="590" y="35" width="100" height="160" rx="16" fill="white" fillOpacity="0.92" stroke="url(#a-tealBlue)" strokeWidth="2" />
        {/* Status bar */}
        <rect x="602" y="48" width="76" height="8" rx="4" fill="#1E40AF" fillOpacity="0.08" />
        <text x="640" y="55" textAnchor="middle" className="text-[5px] font-bold" fill="#1E40AF" fillOpacity="0.5">MyMedVisit</text>
        {/* Health dashboard cards */}
        <rect x="600" y="64" width="80" height="22" rx="6" fill="#0a7ea4" fillOpacity="0.06" />
        <text x="608" y="74" className="text-[5px] font-semibold" fill="#0a7ea4">Heart Rate</text>
        <text x="662" y="80" textAnchor="end" className="text-[8px] font-bold" fill="#0a7ea4">72</text>

        <rect x="600" y="90" width="80" height="22" rx="6" fill="#1E40AF" fillOpacity="0.04" />
        <text x="608" y="100" className="text-[5px] font-semibold" fill="#1E40AF">Glucose</text>
        <text x="662" y="106" textAnchor="end" className="text-[8px] font-bold" fill="#1E40AF">98</text>

        <rect x="600" y="116" width="80" height="22" rx="6" fill="#0E7490" fillOpacity="0.05" />
        <text x="608" y="126" className="text-[5px] font-semibold" fill="#0E7490">Sleep Score</text>
        <text x="662" y="132" textAnchor="end" className="text-[8px] font-bold" fill="#0E7490">87</text>

        <rect x="600" y="142" width="80" height="22" rx="6" fill="#3B82F6" fillOpacity="0.04" />
        <text x="608" y="152" className="text-[5px] font-semibold" fill="#3B82F6">SpO2</text>
        <text x="662" y="158" textAnchor="end" className="text-[8px] font-bold" fill="#3B82F6">98%</text>

        {/* Home bar */}
        <rect x="625" y="176" width="30" height="4" rx="2" fill="#0d1b2a" fillOpacity="0.1" />
      </g>

      {/* ========== BOTTOM-LEFT: Sleep data card ========== */}
      <g>
        <rect x="30" y="330" width="150" height="80" rx="16" fill="white" fillOpacity="0.9" stroke="#1E40AF" strokeWidth="1.5" />
        <rect x="45" y="345" width="24" height="24" rx="6" fill="#1E40AF" fillOpacity="0.08" />
        {/* Moon icon */}
        <path d="M53 352 a7 7 0 108 8 a9 9 0 01-8 -8" fill="#1E40AF" fillOpacity="0.12" stroke="#1E40AF" strokeWidth="0.8" />
        <text x="78" y="355" className="text-[10px] font-semibold" fill="#0d1b2a" fillOpacity="0.75">Sleep Data</text>
        <text x="78" y="368" className="text-[7px]" fill="#0d1b2a" fillOpacity="0.4">Stages &bull; HRV &bull; Quality</text>
        {/* Sleep stage bars */}
        <g>
          <rect x="45" y="383" width="120" height="14" rx="3" fill="#1E40AF" fillOpacity="0.04" />
          <rect x="45" y="383" width="20" height="14" rx="3" fill="#1E40AF" fillOpacity="0.08" />
          <rect x="65" y="383" width="35" height="14" rx="0" fill="#1E40AF" fillOpacity="0.15" />
          <rect x="100" y="383" width="25" height="14" rx="0" fill="#3B82F6" fillOpacity="0.12" />
          <rect x="125" y="383" width="40" height="14" rx="3" fill="#1E40AF" fillOpacity="0.06" />
          <text x="55" y="393" textAnchor="middle" className="text-[5px]" fill="#1E40AF" fillOpacity="0.5">Awake</text>
          <text x="82" y="393" textAnchor="middle" className="text-[5px]" fill="#1E40AF" fillOpacity="0.6">Light</text>
          <text x="112" y="393" textAnchor="middle" className="text-[5px]" fill="#3B82F6" fillOpacity="0.6">Deep</text>
          <text x="145" y="393" textAnchor="middle" className="text-[5px]" fill="#1E40AF" fillOpacity="0.5">REM</text>
        </g>
      </g>

      {/* ========== BOTTOM-RIGHT: Wearable sensors card ========== */}
      <g>
        <rect x="540" y="250" width="150" height="80" rx="16" fill="white" fillOpacity="0.9" stroke="#0E7490" strokeWidth="1.5" />
        <rect x="555" y="265" width="24" height="24" rx="6" fill="#0E7490" fillOpacity="0.08" />
        {/* Activity ring icon */}
        <circle cx="567" cy="277" r="8" fill="none" stroke="#0E7490" strokeWidth="2" strokeOpacity="0.2" />
        <circle cx="567" cy="277" r="8" fill="none" stroke="#0E7490" strokeWidth="2" strokeDasharray="16 40" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 567 277" to="360 567 277" dur="4s" repeatCount="indefinite" />
        </circle>
        <text x="588" y="275" className="text-[10px] font-semibold" fill="#0d1b2a" fillOpacity="0.75">Wearables</text>
        <text x="588" y="288" className="text-[7px]" fill="#0d1b2a" fillOpacity="0.4">SpO2 &bull; Temp &bull; Activity</text>
        {/* Mini metrics */}
        <text x="555" y="315" className="text-[7px] font-semibold" fill="#0E7490">98% SpO2</text>
        <text x="620" y="315" className="text-[7px] font-semibold" fill="#0E7490">36.6°C</text>
      </g>

      {/* Stream from sleep data */}
      <path d="M180 370 C230 360 260 340 280 310" stroke="#1E40AF" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.25">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2.6s" repeatCount="indefinite" />
      </path>

      {/* Stream from wearables */}
      <path d="M540 290 C500 300 440 310 400 300" stroke="#0E7490" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.25">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2.8s" repeatCount="indefinite" />
      </path>

      {/* ========== CENTER LABEL ========== */}
      <text x="300" y="330" textAnchor="middle" className="text-[11px] font-bold" fill="#1E40AF">Ambient Intelligence</text>
      <text x="300" y="346" textAnchor="middle" className="text-[8px]" fill="#0d1b2a" fillOpacity="0.4">Continuous background data collection</text>

      {/* Subtle pulse rings around mannequin */}
      {[80, 110, 140].map((r, i) => (
        <ellipse key={r} cx="300" cy="190" rx={r} ry={r * 0.7} fill="none" stroke="#0a7ea4" strokeWidth="0.6" strokeOpacity={0.08 - i * 0.02}>
          <animate attributeName="rx" values={`${r - 3};${r + 3};${r - 3}`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="ry" values={`${r * 0.7 - 2};${r * 0.7 + 2};${r * 0.7 - 2}`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
    </svg>
  )
}
