import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Active Chat',
    short_name: 'Active Chat',
    description: 'Secure, Anonymous, Serverless messaging for your peace of mind.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/ac_logo_dark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}