'use client'

import { useState, useEffect } from 'react'

export default function NotificationDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    updateDiagnostics()
  }, [])

  const updateDiagnostics = () => {
    const diag = {
      isSecureContext: window.isSecureContext,
      hasNotification: 'Notification' in window,
      notificationPermission: 'Notification' in window ? Notification.permission : 'N/A',
      hasServiceWorker: 'serviceWorker' in navigator,
      hasVibrate: 'vibrate' in navigator,
      hasAudioContext: !!(window.AudioContext || (window as any).webkitAudioContext),
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
    }
    setDiagnostics(diag)
  }

  const playBeep = (durationMs = 300, freq = 880) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioCtx()
      
      // Resume context for iOS
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + durationMs / 1000)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + durationMs / 1000)
    } catch (error) {
      console.warn('Audio beep failed:', error)
    }
  }

  const vibrate = (pattern = [100, 50, 200]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  const sendTestNotification = async () => {
    setLoading(true)
    setResult('')
    updateDiagnostics()

    try {
      // Check secure context
      if (!window.isSecureContext) {
        setResult('❌ Notifications require HTTPS (or localhost). Open the live Amplify URL.')
        return
      }

      // Check notification support
      if (!('Notification' in window)) {
        vibrate([120, 60, 240])
        playBeep(300, 880)
        setResult('⚠️ Your browser doesn\'t support web notifications, but vibration + sound worked.')
        return
      }

      // Request permission if needed
      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
        updateDiagnostics()
      }

      if (permission !== 'granted') {
        setResult('❌ Notification permission denied. Please allow notifications and try again.')
        return
      }

      // Try Service Worker registration
      let registration: ServiceWorkerRegistration | undefined
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js')
          await reg.update()
          registration = await navigator.serviceWorker.ready
        } catch (error) {
          console.warn('SW registration failed:', error)
        }
      }

      // Send notification via Service Worker if available
      if (registration && typeof registration.showNotification === 'function') {
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
        
        vibrate([100, 50, 200])
        playBeep(300, 880)
        
        setResult('✅ Service Worker notification sent! Check for system toast, vibration, and beep.')
      } 
      // Fallback to basic Notification API
      else if (window.Notification && permission === 'granted') {
        new Notification('Breakfast Buddy', {
          body: 'Time for breakfast! This is a test notification.',
          icon: '/icons/icon-192.png'
        })
        
        vibrate([100, 50, 200])
        playBeep(300, 880)
        
        setResult('✅ Basic notification sent! Check for system toast, vibration, and beep.')
      }
      // Final fallback
      else {
        vibrate([100, 50, 200])
        playBeep(300, 880)
        setResult('⚠️ Notifications not supported here. We played a beep and vibrated as fallback.')
      }

    } catch (error) {
      console.error('Notification test failed:', error)
      setResult('❌ Test failed: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={sendTestNotification}
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Testing...' : 'Send test breakfast notification'}
      </button>

      {result && (
        <div className={`p-3 rounded-lg text-sm ${
          result.includes('✅') ? 'bg-green-100 text-green-700' :
          result.includes('⚠️') ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {result}
        </div>
      )}

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm font-medium mb-2">Diagnostics</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>Secure Context: {diagnostics.isSecureContext ? '✅' : '❌'}</div>
          <div>Notifications: {diagnostics.hasNotification ? '✅' : '❌'}</div>
          <div>Permission: {diagnostics.notificationPermission}</div>
          <div>Service Worker: {diagnostics.hasServiceWorker ? '✅' : '❌'}</div>
          <div>Vibration: {diagnostics.hasVibrate ? '✅' : '❌'}</div>
          <div>Audio: {diagnostics.hasAudioContext ? '✅' : '❌'}</div>
          <div className="col-span-2">Mode: {diagnostics.displayMode}</div>
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <div><strong>Windows 11:</strong> If permission granted but no toast, check Windows Notifications & Focus Assist settings.</div>
        <div><strong>iOS Safari:</strong> Install app to Home Screen for better support. iOS web push works for installed PWAs on iOS 16.4+.</div>
      </div>
    </div>
  )
}