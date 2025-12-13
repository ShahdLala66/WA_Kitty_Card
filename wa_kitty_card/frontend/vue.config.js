const { GenerateSW } = require('workbox-webpack-plugin')

module.exports = {
  devServer: {
    proxy: {
      '^/': {
        target: 'http://localhost:9000',
        ws: true,
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    plugins: [
            new GenerateSW({
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // API: relativ, funktioniert lokal und auf einer späteren Domain
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // JS/CSS/Fonts: schnell laden, aber bei Änderungen frisch
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'font',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
          {
            // Bilder: Cache-first mit Ablauf
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Tage
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      }),
    ],
  },
}
