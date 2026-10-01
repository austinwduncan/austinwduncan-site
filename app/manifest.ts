import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Austin W. Duncan',
    short_name: 'AWDuncan',
    description: 'Pastor, teacher, and theologian, sermons, biblical teaching, scholarly articles, and cultural commentary.',
    start_url: '/',
    display: 'standalone',
    background_color: '#262D31',
    theme_color: '#262D31',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  }
}
