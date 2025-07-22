import React from 'react';
import { generateGradientAvatar, GradientAvatarProps } from '@/lib/avatar-generator';

/**
 * React component for displaying gradient avatars
 * Using div with background image instead of img to avoid Next.js optimization warnings
 */
export function GradientAvatar({
  identifier,
  displayName,
  size = 40,
  variant = 'linear',
  showInitials = true,
  className = '',
  alt,
  ...props
}: GradientAvatarProps & React.HTMLAttributes<HTMLDivElement>) {
  const avatarSrc = generateGradientAvatar(identifier, displayName, {
    size,
    variant,
    showInitials,
  });

  return (
    <div
      className={`rounded-full ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundImage: `url("${avatarSrc}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...props.style
      }}
      title={alt || `${displayName || identifier} avatar`}
      {...props}
    />
  );
}

/**
 * Alternative component that uses CSS background instead of SVG
 */
export function GradientAvatarDiv({
  identifier,
  displayName,
  size = 40,
  variant = 'linear',
  showInitials = true,
  className = '',
  ...props
}: GradientAvatarProps & React.HTMLAttributes<HTMLDivElement>) {
  const [color1, color2] = React.useMemo(() => {
    // Simple hash function for color generation
    const stringToHSL = (str: string, saturation = 70, lightness = 50): string => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
      }
      const hue = Math.abs(hash) % 360;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    return [
      stringToHSL(identifier + 'primary', 75, 55),
      stringToHSL(identifier + 'secondary', 70, 45)
    ];
  }, [identifier]);

  const initials = React.useMemo(() => {
    if (!showInitials) return '';
    if (displayName) {
      return displayName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    return identifier.substring(0, 2).toUpperCase();
  }, [displayName, identifier, showInitials]);

  const gradientStyle = React.useMemo(() => {
    switch (variant) {
      case 'radial':
        return `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`;
      case 'diagonal':
        return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
      default:
        return `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)`;
    }
  }, [color1, color2, variant]);

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{
        width: size,
        height: size,
        background: gradientStyle,
        fontSize: size * 0.4,
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        ...props.style
      }}
      {...props}
    >
      {showInitials && initials}
    </div>
  );
}
