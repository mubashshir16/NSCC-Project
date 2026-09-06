import React from 'react';

/**
 * LibNexus Branded Logo Component
 * Geometric Interlocking Book & Nexus Matrix Icon
 */
export default function LibNexusLogo({
  size = 34,
  showText = true,
  variant = 'dark', // 'dark' | 'light'
  subtitle = '',
  className = ''
}) {
  const isLight = variant === 'light';

  return (
    <div className={`libnexus-logo-container ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="libnexus-logo-mark"
      >
        <defs>
          {/* Deep Space Squircle Background */}
          <linearGradient id="ln-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Chamfer Top Rim Glow */}
          <linearGradient id="ln-rim" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
          </linearGradient>

          {/* Left Knowledge Wing (Cyan to Sapphire) */}
          <linearGradient id="ln-left-leaf" x1="8" y1="10" x2="20" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Right Matrix Wing (Indigo to Purple) */}
          <linearGradient id="ln-right-leaf" x1="20" y1="10" x2="32" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>

          {/* Nexus Interlocking Diagonal "N" Beam */}
          <linearGradient id="ln-diagonal" x1="10" y1="11" x2="30" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="35%" stopColor="#3b82f6" />
            <stop offset="70%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          {/* Center Nexus Core Glow */}
          <filter id="ln-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Base Squircle Badge with Top Bevel */}
        <rect width="40" height="40" rx="11" fill="url(#ln-bg)" />
        <rect x="0.5" y="0.5" width="39" height="39" rx="10.5" stroke="url(#ln-rim)" strokeWidth="1" />

        {/* 2. Left Book Page Face (Faceted perspective) */}
        <path
          d="M 20 15 L 10 10.5 L 10 24 L 20 28.5 Z"
          fill="url(#ln-left-leaf)"
          fillOpacity="0.85"
        />

        {/* 3. Right Book Page Face (Faceted perspective) */}
        <path
          d="M 20 15 L 30 10.5 L 30 24 L 20 28.5 Z"
          fill="url(#ln-right-leaf)"
          fillOpacity="0.85"
        />

        {/* 4. The Iconic Nexus "N" Crossover Ribbon */}
        <path
          d="M 10 10.5 L 14.5 10.5 L 29.5 24 L 25 24 Z"
          fill="url(#ln-diagonal)"
          filter="url(#ln-glow)"
        />

        {/* 5. Left Vertical Spine Highlight (Completing the N glyph) */}
        <line
          x1="10"
          y1="10.5"
          x2="10"
          y2="24"
          stroke="#67e8f9"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* 6. Right Vertical Spine Highlight (Completing the N glyph) */}
        <line
          x1="30"
          y1="10.5"
          x2="30"
          y2="24"
          stroke="#c084fc"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* 7. Top Page Arc Lines (Subtle Knowledge Plumes) */}
        <path
          d="M 12 8.5 C 15 9.5 17.5 11 20 13.5 C 22.5 11 25 9.5 28 8.5"
          stroke="#93c5fd"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        {/* 8. Center Glowing Nexus Core Diamond */}
        <polygon
          points="20,14.5 22.5,17 20,19.5 17.5,17"
          fill="#38bdf8"
          filter="url(#ln-glow)"
        />
        <circle cx="20" cy="17" r="1.2" fill="#ffffff" />
      </svg>

      {showText && (
        <div className="libnexus-text-group">
          <div className="libnexus-brand-heading">
            <span className={`libnexus-text-lib ${isLight ? 'text-light' : 'text-dark'}`}>Lib</span>
            <span className="libnexus-text-nexus">Nexus</span>
            <span className="libnexus-core-pill">SYSTEM</span>
          </div>
          {subtitle && <span className="libnexus-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
