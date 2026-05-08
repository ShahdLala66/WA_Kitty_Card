import { Workbox } from 'workbox-window'

export default function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js')

    wb.addEventListener('waiting', () => {
      wb.addEventListener('controlling', () => {
        window.location.reload()
      })

      wb.messageSkipWaiting()
    })

    wb.register()

    return wb
  }
  return null
}
