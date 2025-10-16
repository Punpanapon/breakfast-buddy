'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Log, StreakInfo } from '@/lib/types'
import { computeStreak } from '@/lib/streak'
import AuthGate from '@/components/AuthGate'

export default function StreakPage() {
  const [streak, setStreak] = useState<StreakInfo>({ count: 0, last_date: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStreak()
  }, [])

  const loadStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    const logs = data || []
    const streakInfo = computeStreak(logs)
    setStreak(streakInfo)
    setLoading(false)
  }

  const getBadges = (count: number) => {
    const badges = []
    if (count >= 3) badges.push({ name: '3-Day Streak', emoji: '🔥', achieved: true })
    else badges.push({ name: '3-Day Streak', emoji: '🔥', achieved: false })
    
    if (count >= 7) badges.push({ name: '7-Day Streak', emoji: '⭐', achieved: true })
    else badges.push({ name: '7-Day Streak', emoji: '⭐', achieved: false })
    
    if (count >= 14) badges.push({ name: '14-Day Streak', emoji: '🏆', achieved: true })
    else badges.push({ name: '14-Day Streak', emoji: '🏆', achieved: false })
    
    return badges
  }

  if (loading) {
    return (
      <AuthGate>
        <div className="text-center py-8">Loading...</div>
      </AuthGate>
    )
  }

  const badges = getBadges(streak.count)

  return (
    <AuthGate>
      <div>
        <h1 className="text-3xl font-bold mb-6">Streak & Badges</h1>
        
        <div className="card mb-6 text-center">
          <div className="text-6xl mb-4">🔥</div>
          <div className="text-4xl font-bold text-orange-600 mb-2">
            {streak.count}
          </div>
          <div className="text-lg text-gray-600">
            Day{streak.count !== 1 ? 's' : ''} Streak
          </div>
          {streak.last_date && (
            <div className="text-sm text-gray-500 mt-2">
              Last logged: {streak.last_date}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Badges</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={`p-4 rounded-lg border text-center ${
                  badge.achieved
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`text-3xl mb-2 ${badge.achieved ? '' : 'grayscale'}`}>
                  {badge.emoji}
                </div>
                <div className={`font-medium ${
                  badge.achieved ? 'text-green-800' : 'text-gray-500'
                }`}>
                  {badge.name}
                </div>
                <div className={`text-sm ${
                  badge.achieved ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {badge.achieved ? 'Achieved!' : 'Not yet achieved'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGate>
  )
}