import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'compact';
  variant?: 'light' | 'dark' | 'white' | 'badge';
  href?: string | null;
  className?: string;
  showBadge?: boolean;
  priority?: boolean;
  brandType?: 'public' | 'legal';
}

/**
 * Official Centralized IMAM E MAHDI FOUNDATION Logo Component
 * Single Source of Truth for Organization Logo Branding
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  href = '/',
  className = '',
  priority = false,
}) => {
  const isCompact = size === 'compact';

  // Dimension presets preserving original 1024x291 (3.518 : 1) aspect ratio
  const heightClasses = {
    sm: 'h-8 sm:h-9 w-auto',
    md: 'h-10 sm:h-11 md:h-12 w-auto',
    lg: 'h-12 sm:h-14 md:h-16 w-auto',
    xl: 'h-16 sm:h-20 md:h-24 w-auto',
    compact: 'h-9 w-9',
  };

  const pixelDimensions = {
    sm: { width: 140, height: 40 },
    md: { width: 180, height: 51 },
    lg: { width: 240, height: 68 },
    xl: { width: 340, height: 97 },
    compact: { width: 48, height: 48 },
  };

  const dims = pixelDimensions[size];

  // Container styling based on dark/white backgrounds
  const containerClasses =
    variant === 'white' || variant === 'badge'
      ? 'bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl shadow-sm inline-flex items-center justify-center border border-white/20'
      : 'inline-flex items-center';

  const LogoImage = isCompact ? (
    <div className={`relative ${heightClasses.compact} shrink-0`}>
      <Image
        src="/branding/imam-e-mahdi-mark.png"
        alt="IMAM E MAHDI FOUNDATION"
        width={dims.width}
        height={dims.height}
        className="object-contain w-full h-full drop-shadow-sm"
        priority={priority}
      />
    </div>
  ) : (
    <div className={`relative ${containerClasses} ${className}`}>
      <Image
        src="/branding/imam-e-mahdi-foundation-logo.png"
        alt="IMAM E MAHDI FOUNDATION"
        width={dims.width}
        height={dims.height}
        className={`${heightClasses[size]} object-contain`}
        priority={priority}
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center transition-transform hover:scale-[1.02] focus:outline-none shrink-0"
        aria-label="IMAM E MAHDI FOUNDATION"
      >
        {LogoImage}
      </Link>
    );
  }

  return LogoImage;
};

export default Logo;
