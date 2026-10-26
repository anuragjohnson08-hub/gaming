import React from 'react';
import { ArtworkVariant } from '../types/nexus';

interface ArtworkRendererProps {
  variant: ArtworkVariant;
  className?: string;
}

export const ArtworkRenderer: React.FC<ArtworkRendererProps> = ({
  variant,
  className = '',
}) => {
  switch (variant) {
    case 'gpu-rtx-5070':
    case 'gpu-rtx-4070s': {
      const is5070 = variant === 'gpu-rtx-5070';
      const accent = is5070 ? '#584CE8' : '#266D75';
      const label = is5070 ? 'GEFORCE RTX 5070' : 'GEFORCE RTX 4070 SUPER';
      const arch = is5070 ? 'BLACKWELL · 12GB GDDR7' : 'ADA LOVELACE · 12GB GDDR6X';
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#CCF4F8] via-[#E5F2FC] to-[#D6D0FA] flex items-center justify-center select-none ${className}`}
        >
          {/* Studio pastel ambient lighting */}
          <div
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-2xl opacity-45 pointer-events-none"
            style={{ background: is5070 ? '#B7B0F7' : '#A4EAF0' }}
          />
          <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/70 blur-2xl pointer-events-none" />

          {/* Precision GPU studio illustration */}
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label={label}
          >
            <defs>
              <linearGradient id={`shroud-${variant}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="52%" stopColor="#E4E1FC" />
                <stop offset="100%" stopColor="#C8C2F6" />
              </linearGradient>
              <linearGradient id={`rim-${variant}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
                <stop offset="50%" stopColor="#266D75" stopOpacity="0.75" />
                <stop offset="100%" stopColor={accent} stopOpacity="0.35" />
              </linearGradient>
            </defs>

            {/* Subtle technical background grid */}
            <g stroke="rgba(49, 42, 117, 0.06)" strokeWidth="1">
              <line x1="0" y1="75" x2="400" y2="75" />
              <line x1="0" y1="150" x2="400" y2="150" />
              <line x1="0" y1="225" x2="400" y2="225" />
              <line x1="100" y1="0" x2="100" y2="300" />
              <line x1="200" y1="0" x2="200" y2="300" />
              <line x1="300" y1="0" x2="300" y2="300" />
            </g>

            {/* Floating 3D Pastel Sphere & Pyramid Accents */}
            <circle cx="342" cy="70" r="28" fill="#FFFFFF" fillOpacity="0.65" />
            <polygon
              points="52,66 82,42 94,78"
              fill="#D4CEFA"
              stroke="#FFFFFF"
              strokeWidth="1"
            />

            {/* PCIe Gold Finger Contacts */}
            <rect x="95" y="218" width="130" height="8" rx="2" fill="#584CE8" opacity="0.55" />

            {/* GPU Backplate / Chassis */}
            <rect
              x="46"
              y="88"
              width="308"
              height="132"
              rx="14"
              fill={`url(#shroud-${variant})`}
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            {/* Exposed Heatsink Fins */}
            {Array.from({ length: 28 }).map((_, idx) => (
              <line
                key={idx}
                x1={58 + idx * 10.4}
                y1="94"
                x2={58 + idx * 10.4}
                y2="214"
                stroke="rgba(49, 42, 117, 0.10)"
                strokeWidth="2"
              />
            ))}

            {/* Founders Edition Hourglass / X-Frame Bezel */}
            <path
              d="M 52 94 L 185 94 L 215 214 L 52 214 Z"
              fill="#FFFFFF"
              fillOpacity="0.72"
              stroke={`url(#rim-${variant})`}
              strokeWidth="1.5"
            />
            <path
              d="M 205 94 L 348 94 L 348 214 L 175 214 Z"
              fill="#EAE7FD"
              fillOpacity="0.72"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />

            {/* Left Axial Fan */}
            <g transform="translate(122, 154)">
              <circle r="46" fill="#312A75" fillOpacity="0.92" stroke="#FFFFFF" strokeWidth="2" />
              {Array.from({ length: 9 }).map((_, i) => (
                <path
                  key={i}
                  d="M 0 0 Q 18 -24 38 -18 Q 24 -4 0 0"
                  fill="#6559F5"
                  fillOpacity="0.6"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="0.8"
                  transform={`rotate(${i * 40})`}
                />
              ))}
              <circle r="14" fill="#FFFFFF" stroke={accent} strokeWidth="2" />
              <circle r="4" fill={accent} />
            </g>

            {/* Right Axial Fan */}
            <g transform="translate(278, 154)">
              <circle r="46" fill="#312A75" fillOpacity="0.92" stroke="#FFFFFF" strokeWidth="2" />
              {Array.from({ length: 9 }).map((_, i) => (
                <path
                  key={i}
                  d="M 0 0 Q 18 -24 38 -18 Q 24 -4 0 0"
                  fill="#266D75"
                  fillOpacity="0.55"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="0.8"
                  transform={`rotate(${i * 40 + 20})`}
                />
              ))}
              <circle r="14" fill="#FFFFFF" stroke="#266D75" strokeWidth="2" />
              <circle r="4" fill="#266D75" />
            </g>

            {/* Top Illuminated Edge Bar */}
            <rect x="64" y="88" width="120" height="3.5" rx="1.5" fill={`url(#rim-${variant})`} />

            {/* Subtle Technical Caption */}
            <text
              x="54"
              y="72"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              {label}
            </text>
            <text
              x="54"
              y="252"
              fill="#4A5578"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
              letterSpacing="1.2"
            >
              {arch}
            </text>
          </svg>
        </div>
      );
    }

    case 'gpu-rx-9070xt':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#D6F5F8] via-[#E6E4FC] to-[#CFC9F8] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Radeon RX 9070 XT 16GB"
          >
            <circle cx="65" cy="70" r="32" fill="#FFFFFF" fillOpacity="0.65" />
            <rect
              x="36"
              y="90"
              width="328"
              height="128"
              rx="14"
              fill="rgba(255,255,255,0.78)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            {/* Triple Axial Fans for RX 9070 XT */}
            {[94, 200, 306].map((cx, idx) => (
              <g key={cx} transform={`translate(${cx}, 154)`}>
                <circle r="42" fill="#312A75" fillOpacity="0.9" stroke="#FFFFFF" strokeWidth="1.8" />
                {Array.from({ length: 9 }).map((_, b) => (
                  <path
                    key={b}
                    d="M 0 0 Q 15 -20 33 -14 Q 20 -3 0 0"
                    fill="#584CE8"
                    fillOpacity="0.58"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="0.7"
                    transform={`rotate(${b * 40 + idx * 15})`}
                  />
                ))}
                <circle r="12" fill="#FFFFFF" stroke="#584CE8" strokeWidth="1.8" />
              </g>
            ))}
            <rect x="48" y="90" width="304" height="3.5" rx="1.5" fill="#584CE8" opacity="0.85" />
            <text
              x="44"
              y="72"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.5"
            >
              RADEON RX 9070 XT · 16GB
            </text>
            <text
              x="44"
              y="248"
              fill="#4A5578"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
              letterSpacing="1.2"
            >
              RDNA 4 ARCHITECTURE · 64 CU · 640 GB/S
            </text>
          </svg>
        </div>
      );

    case 'cpu-ryzen-9800x3d':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#CAF2F6] via-[#E5F2FC] to-[#D4CEFA] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="AMD Ryzen 7 9800X3D Processor"
          >
            {/* Motherboard Socket Frame */}
            <rect
              x="110"
              y="62"
              width="180"
              height="180"
              rx="18"
              fill="rgba(255,255,255,0.72)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            {/* SMD Contacts around perimeter */}
            {Array.from({ length: 8 }).map((_, i) => (
              <React.Fragment key={i}>
                <rect x={132 + i * 18} y="72" width="10" height="5" rx="1.5" fill="#584CE8" opacity="0.55" />
                <rect x={132 + i * 18} y="227" width="10" height="5" rx="1.5" fill="#584CE8" opacity="0.55" />
                <rect x="120" y={88 + i * 16} width="5" height="10" rx="1.5" fill="#266D75" opacity="0.55" />
                <rect x="275" y={88 + i * 16} width="5" height="10" rx="1.5" fill="#266D75" opacity="0.55" />
              </React.Fragment>
            ))}
            {/* AM5 Heat Spreader */}
            <rect
              x="136"
              y="88"
              width="128"
              height="128"
              rx="14"
              fill="#EAE7FC"
              stroke="#584CE8"
              strokeOpacity="0.65"
              strokeWidth="2"
            />
            {/* Internal 3D V-Cache Die Cutaway Visualization */}
            <rect
              x="156"
              y="108"
              width="88"
              height="52"
              rx="6"
              fill="#312A75"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <rect
              x="166"
              y="168"
              width="68"
              height="28"
              rx="5"
              fill="#584CE8"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Die Core Grid */}
            {Array.from({ length: 8 }).map((_, idx) => (
              <rect
                key={idx}
                x={162 + (idx % 4) * 19}
                y={114 + Math.floor(idx / 4) * 20}
                width="15"
                height="15"
                rx="2"
                fill="#BCEFF3"
                fillOpacity="0.85"
              />
            ))}
            <text
              x="200"
              y="186"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
            >
              96MB 3D V-CACHE
            </text>
            <text
              x="200"
              y="46"
              textAnchor="middle"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              AMD RYZEN 7 9800X3D · AM5
            </text>
          </svg>
        </div>
      );

    case 'laptop-zephyrus-g16':
    case 'laptop-lenovo-loq': {
      const isOled = variant === 'laptop-zephyrus-g16';
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#C8F3F7] via-[#E4F0FB] to-[#D4CDFA] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label={isOled ? 'ROG Zephyrus G16 OLED Laptop' : 'Lenovo LOQ 15 Gaming Laptop'}
          >
            {/* Laptop Lid / Screen */}
            <rect
              x="86"
              y="56"
              width="228"
              height="142"
              rx="10"
              fill="rgba(255,255,255,0.88)"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* Screen Wallpaper Graphic */}
            <defs>
              <linearGradient id={`screen-${variant}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={isOled ? '#584CE8' : '#266D75'} />
                <stop offset="55%" stopColor="#857BF0" />
                <stop offset="100%" stopColor="#BCEFF3" />
              </linearGradient>
            </defs>
            <rect x="94" y="64" width="212" height="124" rx="6" fill={`url(#screen-${variant})`} />
            {/* Mountain / Telemetry Wave on Display */}
            <path
              d="M 94 162 L 138 124 L 178 148 L 228 102 L 268 136 L 306 112 L 306 188 L 94 188 Z"
              fill="#FFFFFF"
              fillOpacity="0.35"
            />
            <circle cx="255" cy="96" r="16" fill="#FFFFFF" fillOpacity="0.65" />
            <text
              x="106"
              y="84"
              fill="#FFFFFF"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
            >
              {isOled ? '240HZ ROG NEBULA OLED' : '144HZ G-SYNC · 115W RTX 4060'}
            </text>

            {/* Laptop Base / Keyboard Deck */}
            <path
              d="M 54 202 L 346 202 L 366 226 L 34 226 Z"
              fill="#EAE7FC"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <rect x="172" y="218" width="56" height="4" rx="2" fill="#584CE8" opacity="0.8" />
            <text
              x="200"
              y="258"
              textAnchor="middle"
              fill="#312A75"
              fontSize="9.5"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.4"
            >
              {isOled ? 'CNC ALUMINUM · 1.85 KG' : 'BEST VALUE UNDER INR 80,000'}
            </text>
          </svg>
        </div>
      );
    }

    case 'monitor-aw2725df':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#CCF4F8] via-[#E5F2FC] to-[#D4CEFA] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Alienware 27 360Hz QD-OLED Monitor"
          >
            {/* Ultrathin OLED Bezel */}
            <rect
              x="66"
              y="48"
              width="268"
              height="154"
              rx="10"
              fill="rgba(255,255,255,0.88)"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <rect x="74" y="56" width="252" height="138" rx="6" fill="#312A75" />
            {/* QD-OLED Spectrum Curve */}
            <path
              d="M 74 155 Q 140 75 200 130 T 326 95 L 326 194 L 74 194 Z"
              fill="#584CE8"
              fillOpacity="0.55"
            />
            <path
              d="M 74 170 Q 150 110 220 150 T 326 120"
              fill="none"
              stroke="#BCEFF3"
              strokeWidth="2.5"
            />
            <text
              x="200"
              y="112"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="14"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="2"
            >
              360Hz · 0.03ms
            </text>
            <text
              x="200"
              y="130"
              textAnchor="middle"
              fill="#BCEFF3"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
              letterSpacing="1.5"
            >
              QD-OLED TRUEBLACK HDR
            </text>
            {/* Stand Neck & Hexagonal Base */}
            <rect x="190" y="202" width="20" height="36" fill="#D5D0F9" />
            <path
              d="M 136 244 L 264 244 L 246 234 L 154 234 Z"
              fill="#FFFFFF"
              stroke="#584CE8"
              strokeOpacity="0.4"
            />
          </svg>
        </div>
      );

    case 'peripheral-viper-v3':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#CCF4F8] via-[#E6F1FC] to-[#D6D0FA] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Razer Viper V3 Pro 54g Wireless Mouse"
          >
            {/* 8KHz Wireless Telemetry Rings */}
            <circle
              cx="200"
              cy="150"
              r="92"
              fill="none"
              stroke="#584CE8"
              strokeOpacity="0.32"
              strokeDasharray="4 6"
            />
            <circle
              cx="200"
              cy="150"
              r="70"
              fill="rgba(255,255,255,0.45)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Symmetrical Esports Mouse Silhouette */}
            <path
              d="M 164 88 C 164 60, 236 60, 236 88 L 242 152 C 244 202, 230 228, 200 228 C 170 228, 156 202, 158 152 Z"
              fill="#FFFFFF"
              stroke="#584CE8"
              strokeOpacity="0.55"
              strokeWidth="2"
            />
            {/* Split Mouse Buttons & Scroll Wheel */}
            <line x1="200" y1="68" x2="200" y2="128" stroke="rgba(49,42,117,0.22)" strokeWidth="1.5" />
            <path d="M 162 128 Q 200 136 238 128" fill="none" stroke="rgba(49,42,117,0.20)" strokeWidth="1.2" />
            <rect
              x="194"
              y="84"
              width="12"
              height="28"
              rx="6"
              fill="#584CE8"
            />
            <text
              x="200"
              y="260"
              textAnchor="middle"
              fill="#312A75"
              fontSize="9.5"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.5"
            >
              54G ULTRALIGHT · 8,000 HZ WIRELESS
            </text>
          </svg>
        </div>
      );

    case 'game-cyberpunk':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#BCEFF3] via-[#DFDCFA] to-[#C6BFF7] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Cyberpunk 2077 Pastel Glass Metropolis Artwork"
          >
            {/* Pastel 3D Sun & Orbs */}
            <circle cx="280" cy="96" r="64" fill="#FFFFFF" fillOpacity="0.72" />
            <circle cx="120" cy="120" r="54" fill="#A5ECF2" fillOpacity="0.6" />

            {/* Frosted Glass Megastructures Skyline */}
            <rect x="28" y="74" width="52" height="152" rx="6" fill="rgba(255,255,255,0.65)" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="92" y="48" width="68" height="178" rx="8" fill="rgba(88,76,232,0.22)" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="174" y="82" width="56" height="144" rx="6" fill="rgba(255,255,255,0.75)" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="242" y="40" width="76" height="186" rx="8" fill="rgba(49,42,117,0.82)" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="330" y="86" width="48" height="140" rx="6" fill="rgba(255,255,255,0.65)" stroke="#FFFFFF" />

            {/* Vertical Architectural Light Strips */}
            <line x1="114" y1="60" x2="114" y2="210" stroke="#584CE8" strokeWidth="2.5" />
            <line x1="266" y1="54" x2="266" y2="212" stroke="#BCEFF3" strokeWidth="2.5" />
            <line x1="292" y1="70" x2="292" y2="195" stroke="#D5D0F9" strokeWidth="2" />

            {/* Reflection Plane */}
            <rect x="0" y="226" width="400" height="74" fill="rgba(255,255,255,0.55)" />
            <line x1="0" y1="226" x2="400" y2="226" stroke="#FFFFFF" strokeWidth="2" />

            <text
              x="24"
              y="276"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              PATH TRACING OVERDRIVE · REDENGINE 4
            </text>
          </svg>
        </div>
      );

    case 'game-wukong':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#CAF3F7] via-[#E5E2FC] to-[#CCC5F8] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Black Myth Wukong Ancient Temple Environment"
          >
            {/* Pastel Moon & Mountain Mist */}
            <circle cx="290" cy="82" r="44" fill="#FFFFFF" fillOpacity="0.82" />
            <path
              d="M 0 225 L 95 118 L 185 188 L 285 102 L 400 192 L 400 300 L 0 300 Z"
              fill="rgba(255,255,255,0.55)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Pagoda Roof Silhouette */}
            <path
              d="M 145 145 Q 200 118 255 145 L 240 154 L 160 154 Z"
              fill="#312A75"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <path
              d="M 130 175 Q 200 148 270 175 L 252 186 L 148 186 Z"
              fill="#584CE8"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <rect x="168" y="186" width="64" height="44" rx="4" fill="rgba(49,42,117,0.85)" />
            <line x1="200" y1="88" x2="200" y2="230" stroke="#266D75" strokeWidth="3" />
            <text
              x="24"
              y="276"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              UNREAL ENGINE 5 · NANITE & LUMEN GI
            </text>
          </svg>
        </div>
      );

    case 'game-forza':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#BCEFF3] via-[#E4F2FC] to-[#D4CEFA] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Forza Horizon 5 High-Speed Horizon Artwork"
          >
            {/* Horizon Perspective Speed Lines */}
            <line x1="200" y1="115" x2="20" y2="250" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="200" y1="115" x2="380" y2="250" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="200" y1="115" x2="110" y2="250" stroke="#584CE8" strokeOpacity="0.35" strokeWidth="1.5" />
            <line x1="200" y1="115" x2="290" y2="250" stroke="#584CE8" strokeOpacity="0.35" strokeWidth="1.5" />
            <circle cx="200" cy="105" r="38" fill="#FFFFFF" fillOpacity="0.75" />
            {/* Aerodynamic Supercar Silhouette */}
            <path
              d="M 105 182 L 152 146 L 248 146 L 295 182 L 285 206 L 115 206 Z"
              fill="#312A75"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <rect x="118" y="178" width="38" height="6" rx="3" fill="#BCEFF3" />
            <rect x="244" y="178" width="38" height="6" rx="3" fill="#BCEFF3" />
            <text
              x="24"
              y="276"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              FORZATECH ENGINE · 4K EXTREME SCALING
            </text>
          </svg>
        </div>
      );

    case 'game-alan-wake-2':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#C6EFF4] via-[#DFDCFA] to-[#C8C0F7] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Alan Wake 2 Northlight Path Tracing Artwork"
          >
            {/* Volumetric Flashlight Cone & Pines */}
            <polygon
              points="76,164 360,44 360,250"
              fill="#FFFFFF"
              fillOpacity="0.65"
            />
            <polygon
              points="76,164 330,90 330,224"
              fill="#BCEFF3"
              fillOpacity="0.55"
            />
            {[60, 125, 195, 265, 330].map((x, idx) => (
              <g key={x} opacity={0.6 + idx * 0.08}>
                <polygon
                  points={`${x},58 ${x - 26},198 ${x + 26},198`}
                  fill={idx % 2 === 0 ? '#312A75' : '#584CE8'}
                  fillOpacity="0.78"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
                <rect x={x - 4} y="198" width="8" height="36" fill="#312A75" />
              </g>
            ))}
            <circle cx="76" cy="164" r="9" fill="#584CE8" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="76" cy="164" r="22" fill="#FFFFFF" fillOpacity="0.6" />
            <text
              x="24"
              y="276"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              NORTHLIGHT ENGINE · MESH SHADERS & PATH TRACING
            </text>
          </svg>
        </div>
      );

    case 'game-cs2':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#C4F1F6] via-[#E5F2FC] to-[#D6D0FA] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Counter-Strike 2 Source 2 Frame-Time Telemetry Artwork"
          >
            {/* Sub-tick Telemetry Reticle */}
            <circle
              cx="200"
              cy="138"
              r="68"
              fill="rgba(255,255,255,0.6)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <circle
              cx="200"
              cy="138"
              r="42"
              fill="rgba(88,76,232,0.16)"
              stroke="#584CE8"
              strokeWidth="1.8"
              strokeDasharray="6 4"
            />
            <line x1="112" y1="138" x2="288" y2="138" stroke="#312A75" strokeOpacity="0.45" strokeWidth="1.5" />
            <line x1="200" y1="50" x2="200" y2="226" stroke="#312A75" strokeOpacity="0.45" strokeWidth="1.5" />
            {/* Frame-Time Histogram Bars */}
            {Array.from({ length: 16 }).map((_, i) => {
              const h = 16 + ((i * 11) % 34);
              return (
                <rect
                  key={i}
                  x={96 + i * 13}
                  y={242 - h}
                  width="8"
                  height={h}
                  rx="2"
                  fill={i % 3 === 0 ? '#266D75' : '#584CE8'}
                  fillOpacity="0.82"
                />
              );
            })}
            <text
              x="24"
              y="276"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              SOURCE 2 ENGINE · 360HZ+ SUB-TICK & REFLEX LAB
            </text>
          </svg>
        </div>
      );

    case 'game-elden-ring':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#CCF3F7] via-[#E4E1FC] to-[#CBC4F7] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Elden Ring Shadow of the Erdtree Great Rune Geometry"
          >
            {/* Interlocking Pastel/Indigo Rune Arcs */}
            <circle
              cx="200"
              cy="132"
              r="56"
              fill="rgba(255,255,255,0.52)"
              stroke="#584CE8"
              strokeWidth="2.5"
            />
            <circle
              cx="174"
              cy="148"
              r="46"
              fill="none"
              stroke="#266D75"
              strokeWidth="1.8"
              strokeOpacity="0.7"
            />
            <circle
              cx="226"
              cy="148"
              r="46"
              fill="none"
              stroke="#266D75"
              strokeWidth="1.8"
              strokeOpacity="0.7"
            />
            <line x1="200" y1="46" x2="200" y2="232" stroke="#312A75" strokeWidth="2.5" />
            <path
              d="M 132 96 Q 200 132 268 96"
              fill="none"
              stroke="#584CE8"
              strokeWidth="2.5"
            />
            <text
              x="24"
              y="276"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              FROMSOFTWARE ENGINE · FRAME-PACING & RT SHADOWS
            </text>
          </svg>
        </div>
      );

    case 'game-rdr2':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#C7F2F6] via-[#E5E3FC] to-[#CDC6F8] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Red Dead Redemption 2 Frontier Horizon Vulkan Benchmark"
          >
            <circle cx="200" cy="112" r="54" fill="#FFFFFF" fillOpacity="0.82" />
            {/* Western Mesa Silhouettes */}
            <path
              d="M 0 218 L 62 150 L 118 150 L 154 200 L 238 132 L 304 132 L 348 194 L 400 176 L 400 300 L 0 300 Z"
              fill="rgba(88, 76, 232, 0.28)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <line x1="0" y1="218" x2="400" y2="218" stroke="#FFFFFF" strokeWidth="2" />
            <text
              x="24"
              y="276"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              RAGE ENGINE · VULKAN VS DX12 RASTER & VOLUMETRICS
            </text>
          </svg>
        </div>
      );

    case 'game-starfield':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#C2F0F5] via-[#E3F0FC] to-[#D2CBFA] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Starfield Orbital Astrolabe Benchmark Artwork"
          >
            <circle cx="200" cy="136" r="80" fill="rgba(255,255,255,0.4)" stroke="#FFFFFF" strokeWidth="1.8" strokeDasharray="4 5" />
            <circle cx="200" cy="136" r="52" fill="rgba(255,255,255,0.55)" stroke="#266D75" strokeOpacity="0.65" strokeWidth="1.8" />
            <circle cx="200" cy="136" r="24" fill="#584CE8" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="252" cy="136" r="7" fill="#266D75" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="164" cy="98" r="6" fill="#312A75" stroke="#FFFFFF" strokeWidth="1.5" />
            <text
              x="24"
              y="276"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              CREATION ENGINE 2 · CPU CROWD & GPU SCALING
            </text>
          </svg>
        </div>
      );

    case 'game-gtav-rt':
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#C4F1F6] via-[#E4E1FC] to-[#CBC4F7] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="GTA V Enhanced PC Ray Tracing Benchmark Artwork"
          >
            {/* Coastal Highway & Sunset Ray-Traced Reflections */}
            <circle cx="290" cy="92" r="48" fill="#FFFFFF" fillOpacity="0.82" />
            <path
              d="M 38 228 L 168 128 L 232 128 L 362 228 Z"
              fill="rgba(88, 76, 232, 0.25)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <line x1="200" y1="128" x2="200" y2="228" stroke="#312A75" strokeWidth="2.5" strokeDasharray="8 6" />
            <text
              x="24"
              y="276"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              RAGE RT ENHANCED · RAY-TRACED GI & LOW-SPEC SCALING
            </text>
          </svg>
        </div>
      );

    case 'game-civ7':
    default:
      return (
        <div
          className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#C7F2F6] via-[#E5F2FC] to-[#D4CEFA] flex items-center justify-center select-none ${className}`}
        >
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full object-cover"
            role="img"
            aria-label="Civilization VII Hexagonal Strategy Grid Artwork"
          >
            {/* Hexagonal Strategy Topology */}
            {[
              { x: 200, y: 120, active: true },
              { x: 142, y: 152, active: false },
              { x: 258, y: 152, active: true },
              { x: 200, y: 184, active: false },
              { x: 142, y: 88, active: false },
              { x: 258, y: 88, active: false },
            ].map((hex, i) => (
              <polygon
                key={i}
                points={`${hex.x},${hex.y - 32} ${hex.x + 28},${hex.y - 16} ${hex.x + 28},${hex.y + 16} ${hex.x},${hex.y + 32} ${hex.x - 28},${hex.y + 16} ${hex.x - 28},${hex.y - 16}`}
                fill={hex.active ? 'rgba(88, 76, 232, 0.28)' : 'rgba(255, 255, 255, 0.72)'}
                stroke={hex.active ? '#584CE8' : '#FFFFFF'}
                strokeWidth="2"
              />
            ))}
            <text
              x="24"
              y="276"
              fill="#312A75"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              letterSpacing="1.6"
            >
              AI TURN-TIME & MULTI-CORE CPU BENCHMARK
            </text>
          </svg>
        </div>
      );
  }
};
