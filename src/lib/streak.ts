import { Log, StreakInfo } from './types'
import { todayBangkokISO } from './time'

export function computeStreak(logs: Log[]): StreakInfo {
  if (logs.length === 0) {
    return { count: 0, last_date: null }
  }

  // Sort logs by date descending
  const sortedLogs = logs
    .filter(log => log.ate)
    .sort((a, b) => b.date.localeCompare(a.date))

  if (sortedLogs.length === 0) {
    return { count: 0, last_date: null }
  }

  const today = todayBangkokISO()
  let streak = 0
  let currentDate = today

  // Check if we ate today or yesterday to start streak
  const latestLog = sortedLogs[0]
  if (latestLog.date !== today && latestLog.date !== getPreviousDate(today)) {
    return { count: 0, last_date: latestLog.date }
  }

  // Count consecutive days
  for (const log of sortedLogs) {
    if (log.date === currentDate) {
      streak++
      currentDate = getPreviousDate(currentDate)
    } else {
      break
    }
  }

  return { count: streak, last_date: sortedLogs[0].date }
}

export function getMissedInLastThreeDays(logs: Log[]): number {
  const today = todayBangkokISO()
  const threeDaysAgo = getDateDaysAgo(today, 3)
  
  const recentLogs = logs.filter(log => 
    log.date >= threeDaysAgo && log.date <= today
  )

  const missedDays = []
  for (let i = 0; i < 3; i++) {
    const date = getDateDaysAgo(today, i)
    const log = recentLogs.find(l => l.date === date)
    if (!log || !log.ate) {
      missedDays.push(date)
    }
  }

  return missedDays.length
}

function getPreviousDate(dateStr: string): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

function getDateDaysAgo(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}