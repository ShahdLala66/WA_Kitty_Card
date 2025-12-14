import { Workbox } from 'workbox-window'

export default function registerServiceWorker() {
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js')

    wb.addEventListener('waiting', () => {
      console.log('Service Worker update available')
    })

    wb.register().catch(err => {
      console.error('Service Worker registration failed:', err)
    })

    return wb
  }
  return null
}
