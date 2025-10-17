'use client'

import { useState } from 'react'

export default function NotificationTestButton() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn('Audio beep failed:', error)
    }
  }

  const sendTestNotification = async () => {
    setLoading(true)
    setStatus('')

    try {
      // Request notification permission
      if (!('Notification' in window)) {
        setStatus('Notifications not supported in this browser')
        return
      }

      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }

      if (permission !== 'granted') {
        setStatus('Notification permission denied')
        return
      }

      // Ensure Service Worker is registered
      if (!('serviceWorker' in navigator)) {
        setStatus('Service Worker not supported')
        return
      }

      let registration: ServiceWorkerRegistration
      try {
        registration = await navigator.serviceWorker.ready
      } catch {
        registration = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready
      }

      // Send notification
      await registration.showNotification('Breakfast Buddy', {
        body: 'Time for breakfast! This is a test notification.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [100, 50, 200],
        tag: 'bb-test',
        renotify: true,
        requireInteraction: true,
        actions: [{ action: 'open', title: 'Open app' }]
      })

      // Trigger vibration
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 200])
      }

      // Play beep
      playBeep()

      setStatus('✅ Test notification sent successfully!')
    } catch (error) {
      console.warn('Notification test failed:', error)
      setStatus('❌ Failed to send notification: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={sendTestNotification}
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Sending...' : 'Send test breakfast notification'}
      </button>
      {status && (
        <div className={`text-sm p-2 rounded ${
          status.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {status}
        </div>
      )}
    </div>
  )
}