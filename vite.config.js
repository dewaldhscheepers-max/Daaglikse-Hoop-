import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    // Boutyd, sodat ons op die skerm kan sien watter weergawe loop
    __BOU__: JSON.stringify(
      new Date().toLocaleString('af-ZA', { timeZone: 'Africa/Johannesburg',
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    ),
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Daaglikse Hoop',
        short_name: 'Daaglikse Hoop',
        description: 'Jou daaglikse woord van hoop',
        theme_color: '#C97D3A',
        background_color: '#FAF7F2',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        prefer_related_applications: false,
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['books/**'],
        rollupFormat: 'iife',
      }
    })
  ]
})
