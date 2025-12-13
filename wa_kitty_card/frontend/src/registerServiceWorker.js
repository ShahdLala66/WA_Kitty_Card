import { Workbox } from 'workbox-window'

export default function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js')

    wb.addEventListener('waiting', () => {
      wb.addEventListener('controlling', () => {
        window.location.reload()
      })

      // Send a message to the waiting service worker, instructing it to activate.
      wb.messageSkipWaiting()
    })

    wb.register()

    return wb
  }
  return null
}
