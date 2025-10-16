'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'
import AuthGate from '@/components/AuthGate'
import { useToast, Toast } from '@/components/Toast'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [breakfastStart, setBreakfastStart] = useState('06:30')
  const [breakfastEnd, setBreakfastEnd] = useState('10:30')
  const [displayName, setDisplayName] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    loadProfile()
    checkNotificationPermission()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserId(user.id)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setBreakfastStart(data.breakfast_start)
      setBreakfastEnd(data.breakfast_end)
      setDisplayName(data.display_name || '')
    } else {
      // Create profile if it doesn't exist
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          breakfast_start: breakfastStart,
          breakfast_end: breakfastEnd,
        })
        .select()
        .single()

      setProfile(newProfile)
    }
  }

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        showToast('Notifications enabled!', 'success')
        scheduleBreakfastReminder()
      } else {
        showToast('Notifications denied', 'error')
      }
    }
  }

  const scheduleBreakfastReminder = () => {
    // Simple notification scheduling - in production, use service worker
    if ('Notification' in window && Notification.permission === 'granted') {
      const now = new Date()
      const [hours, minutes] = breakfastStart.split(':').map(Number)
      const reminderTime = new Date()
      reminderTime.setHours(hours, minutes, 0, 0)
      
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1)
      }
      
      const timeUntilReminder = reminderTime.getTime() - now.getTime()
      
      setTimeout(() => {
        new Notification('Breakfast Buddy', {
          body: 'Time for breakfast! 🍳',
          icon: '/icon-192x192.png',
        })
      }, timeUntilReminder)
    }
  }

  const saveSettings = async () => {
    if (!profile) return
    
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        breakfast_start: breakfastStart,
        breakfast_end: breakfastEnd,
      })
      .eq('id', profile.id)

    if (error) {
      showToast('Failed to save settings', 'error')
    } else {
      showToast('Settings saved!', 'success')
      loadProfile()
    }
    setLoading(false)
  }

  return (
    <AuthGate>
      <div>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">User ID (for device pairing)</label>
                <input
                  type="text"
                  value={userId}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Breakfast Window</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  value={breakfastStart}
                  onChange={(e) => setBreakfastStart(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="time"
                  value={breakfastEnd}
                  onChange={(e) => setBreakfastEnd(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Breakfast Reminders</div>
                  <div className="text-sm text-gray-600">
                    Status: {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                {notificationPermission !== 'granted' && (
                  <button
                    onClick={requestNotificationPermission}
                    className="btn btn-primary"
                  >
                    Enable
                  </button>
                )}
              </div>
              {notificationPermission === 'denied' && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  Notifications are blocked. Please enable them in your browser settings.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </AuthGate>
  )
}