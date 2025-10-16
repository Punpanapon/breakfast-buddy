'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Log } from '@/lib/types'
import AuthGate from '@/components/AuthGate'

export default function HistoryPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { data } = await supabase
      .from('logs')
      .select('*, meal:meals(*)')
      .eq('user_id', user.id)
      .gte('date', fourteenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    setLogs(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <AuthGate>
        <div className="text-center py-8">Loading...</div>
      </AuthGate>
    )
  }

  return (
    <AuthGate>
      <div>
        <h1 className="text-3xl font-bold mb-6">History (Last 14 Days)</h1>
        
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No breakfast logs yet. Start logging your meals!
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {log.ate ? '✅' : '❌'}
                    </div>
                    <div>
                      <div className="font-medium">{log.date}</div>
                      {log.ate && log.meal ? (
                        <div className="text-sm text-gray-600">
                          {log.meal.name}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          Skipped breakfast
                        </div>
                      )}
                    </div>
                  </div>
                  {log.ate && log.kcal && (
                    <div className="text-right text-sm">
                      <div>{log.kcal} kcal</div>
                      <div className="text-gray-600">
                        {log.protein}g protein
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGate>
  )
}