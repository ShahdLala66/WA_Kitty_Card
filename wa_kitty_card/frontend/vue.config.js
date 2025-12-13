const { GenerateSW } = require('workbox-webpack-plugin')

module.exports = {
  // Proxy is only used in development mode when running 'npm run serve'
  // Only proxy API calls to the backend; all other routes handled by Vue Router, actually not sure if thats what is needed ...
  devServer: {
    proxy: {
      '^/api': {
        target: process.env.VUE_APP_API_BASE_URL || 'http://localhost:9000',
        ws: true,
        changeOrigin: true,
        logLevel: 'debug',
        onProxyReq: function(proxyReq, req, res) {
          // Log proxy requests for debugging
          console.log('[Proxy]', req.method, req.url, '->', proxyReq.path);
        },
        onError: function(err, req, res) {
          console.error('[Proxy Error]', err.message);
          res.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          res.end('Proxy error: ' + err.message);
        }
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
