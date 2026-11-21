import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  portalSubtitle?: string;
  to?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  portalSubtitle = 'Credential Ledger',
  to = '/',
  className = '',
}) => {
  const iconSizeClasses =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';

  const textClasses =
    size === 'sm'
      ? 'text-base'
      : size === 'lg'
      ? 'text-2xl'
      : 'text-lg';

  const subClasses =
    size === 'sm'
      ? 'text-[8px] tracking-[0.18em]'
      : size === 'lg'
      ? 'text-[10px] tracking-[0.2em]'
      : 'text-[8.5px] tracking-[0.18em]';

  const content = (
    <div className={`flex items-center gap-2.5 group shrink-0 select-none ${className}`}>
      {/* Bespoke Geometric Cryptographic Brand Emblem */}
      <div className={`relative ${iconSizeClasses} rounded-xl bg-[#141A1B] border border-powder/50 flex items-center justify-center shadow-card group-hover:border-orange group-hover:shadow-orange-glow transition-all duration-300 overflow-hidden shrink-0`}>
        {/* Ambient Glow in Racing Orange */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-orange/20 via-transparent to-powder/20 opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Custom VeriDegree X Vector Icon */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Shield Outer Cryptographic Outline in Powder Blue */}
          <path
            d="M18 4L6 8.5V17.5C6 24.5 11.2 30.8 18 32.5C24.8 30.8 30 24.5 30 17.5V8.5L18 4Z"
            stroke="#A8C9C8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />

          {/* Dynamic Faceted "X" in Racing Orange */}
          <path
            d="M13 13L23 23"
            stroke="#F45B0B"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M23 13L13 23"
            stroke="#FFFFFF"
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* Central Cryptographic Anchor Node */}
          <circle cx="18" cy="18" r="2.2" fill="#F45B0B" />
          <circle cx="18" cy="18" r="1.1" fill="#FFFFFF" />

          {/* Top Verification Crest Star */}
          <path
            d="M18 8L18.8 10.2H21.2L19.3 11.6L20 13.8L18 12.4L16 13.8L16.7 11.6L14.8 10.2H17.2L18 8Z"
            fill="#F45B0B"
          />
        </svg>
      </div>

      {/* Brand Typographic Wordmark */}
      <div className="flex flex-col shrink-0 text-left">
        <div className={`font-sans font-black ${textClasses} tracking-tight text-charcoal whitespace-nowrap leading-none flex items-center gap-1`}>
          <span className="tracking-tight">VERIDEGREE</span>
          <span className="text-orange font-extrabold italic relative inline-block">
            X
            <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-orange animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-orange" />
          </span>
        </div>

        {showSubtitle && (
          <span className={`font-mono font-bold uppercase text-charcoal-muted whitespace-nowrap leading-tight mt-1 ${subClasses}`}>
            {portalSubtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} className="shrink-0 outline-none">
      {content}
    </Link>
  );
};

