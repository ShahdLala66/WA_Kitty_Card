import { Workbox } from 'workbox-window'

export default function registerServiceWorker() {
  // Only register service worker in production OR when testing built files
  if ('serviceWorker' in navigator && (process.env.NODE_ENV === 'production' || window.location.hostname === 'localhost')) {
    const wb = new Workbox('/service-worker.js')

    wb.addEventListener('waiting', () => {
      console.log('A new service worker is waiting')
      wb.addEventListener('controlling', () => {
        window.location.reload()
      })

      // Send a message to the waiting service worker, instructing it to activate.
      wb.messageSkipWaiting()
    })

    wb.register().catch(err => {
      console.error('Service worker registration failed:', err)
    })

    return wb
  }
  return null
}
