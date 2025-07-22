import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Active Chat',
    short_name: 'ActiveChat',
    description: 'Secure, Anonymous, Serverless messaging for your peace of mind.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    dir: 'ltr',
    
    // Theme colors for different platforms
    background_color: '#0a0a0a',
    theme_color: '#3b82f6',
    
    // Categories for app stores
    categories: ['social', 'communication', 'productivity'],
    
    // Icons for various platforms and sizes
    icons: [
      // SVG icons for scalable support
      {
        src: '/ac_logo_dark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/ac_logo_light.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      
      // Fallback for platforms that need specific sizes
      // You can generate these from your SVGs using online tools if needed
      {
        src: '/ac_logo_dark.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/ac_logo_dark.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      
      // Maskable icon (for Android adaptive icons)
      {
        src: '/ac_logo_dark.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
      {
        src: '/ac_logo_dark.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
      
      // light icon for notification badges
      {
        src: '/ac_logo_light.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'monochrome'
      }
    ],
    
    // Screenshots for app stores (add these manually later)
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Chat interface on desktop'
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '360x800',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Chat interface on mobile'
      }
    ],
    
    // Protocol handlers for deep linking
    protocol_handlers: [
      {
        protocol: 'web+activechat',
        url: '/chat/%s'
      }
    ],

    // Shortcuts for quick actions (mobile app shortcuts)
    shortcuts: [
      {
        name: 'Create New Channel',
        short_name: 'Create',
        description: 'Start a new chat room with a custom secret',
        url: '/?action=create',
        icons: [
          {
            src: '/shortcut-create.svg',
            sizes: '96x96',
            type: 'image/svg+xml'
          }
        ]
      },
      {
        name: 'Join Recent Channel',
        short_name: 'Join',
        description: 'Rejoin a previously visited chat room',
        url: '/?action=join',
        icons: [
          {
            src: '/shortchut-join.svg',
            sizes: '96x96',
            type: 'image/svg+xml'
          }
        ]
      }
    ],
    
    // Prefer related applications
    prefer_related_applications: false,
  }
}