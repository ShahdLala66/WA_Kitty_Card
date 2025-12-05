module.exports = {
  devServer: {
    proxy: {
      '^/': {
        target: 'http://localhost:9000',
        ws: true,
        changeOrigin: true
      }
    }
  }
}
