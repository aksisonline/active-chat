/**
 * Generates unique gradient profile icons dynamically without storage
 * Uses deterministic color generation based on user identifier
 */

interface GradientAvatarOptions {
  size?: number;
  variant?: 'linear' | 'radial' | 'diagonal';
  showInitials?: boolean;
  fontSize?: number;
}

/**
 * Converts a string to HSL color using a hash function
 */
function stringToHSL(str: string, saturation = 70, lightness = 50): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generates two complementary colors from a string
 */
function generateGradientColors(identifier: string): [string, string] {
  // Generate two different colors by appending different suffixes
  const color1 = stringToHSL(identifier + 'primary', 75, 55);
  const color2 = stringToHSL(identifier + 'secondary', 70, 45);
  return [color1, color2];
}

/**
 * Gets user initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Generates a gradient avatar as a data URI SVG
 */
export function generateGradientAvatar(
  identifier: string,
  displayName?: string,
  options: GradientAvatarOptions = {}
): string {
  const {
    size = 128,
    variant = 'linear',
    showInitials = true,
    fontSize = size * 0.4
  } = options;

  const [color1, color2] = generateGradientColors(identifier);
  const initials = displayName ? getInitials(displayName) : identifier.substring(0, 2).toUpperCase();

  // Define gradient based on variant
  let gradientDef = '';
  switch (variant) {
    case 'radial':
      gradientDef = `
        <radialGradient id="grad-${identifier}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </radialGradient>
      `;
      break;
    case 'diagonal':
      gradientDef = `
        <linearGradient id="grad-${identifier}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      `;
      break;
    default: // linear
      gradientDef = `
        <linearGradient id="grad-${identifier}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      `;
  }

  const textElement = showInitials ? `
    <text
      x="50%"
      y="50%"
      dominant-baseline="middle"
      text-anchor="middle"
      fill="white"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="${fontSize}"
      font-weight="600"
      style="text-shadow: 0 1px 2px rgba(0,0,0,0.3);"
    >
      ${initials}
    </text>
  ` : '';

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${gradientDef}
      </defs>
      <circle
        cx="50%"
        cy="50%"
        r="50%"
        fill="url(#grad-${identifier})"
      />
      ${textElement}
    </svg>
  `;

  // Convert to base64 data URI
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generates a gradient background for elements
 */
export function generateGradientBackground(identifier: string, variant: 'linear' | 'radial' = 'linear'): string {
  const [color1, color2] = generateGradientColors(identifier);
  
  if (variant === 'radial') {
    return `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`;
  }
  
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}

/**
 * React component for gradient avatar
 */
export interface GradientAvatarProps {
  identifier: string;
  displayName?: string;
  size?: number;
  variant?: 'linear' | 'radial' | 'diagonal';
  showInitials?: boolean;
  className?: string;
  alt?: string;
}
