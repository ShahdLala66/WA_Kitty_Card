const { GenerateSW } = require('workbox-webpack-plugin')

module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: process.env.VUE_APP_API_BASE_URL || 'http://localhost:9000',
        ws: true,
        changeOrigin: true,
        logLevel: 'debug',
        onProxyReq: function(proxyReq, req, res) {
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
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      }),
    ],
  },
}
