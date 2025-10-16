import { describe, it, expect, vi } from 'vitest'
import { computeStreak, getMissedInLastThreeDays } from './streak'
import { Log } from './types'

// Mock todayBangkokISO
vi.mock('./time', () => ({
  todayBangkokISO: () => '2024-01-05'
}))

describe('streak utilities', () => {
  describe('computeStreak', () => {
    it('should return 0 streak for empty logs', () => {
      const result = computeStreak([])
      expect(result).toEqual({ count: 0, last_date: null })
    })

    it('should return 0 streak when no meals eaten', () => {
      const logs: Log[] = [
        { id: '1', user_id: 'user1', date: '2024-01-05', ate: false, created_at: '2024-01-05T10:00:00Z' },
        { id: '2', user_id: 'user1', date: '2024-01-04', ate: false, created_at: '2024-01-04T10:00:00Z' }
      ]
      const result = computeStreak(logs)
      expect(result.count).toBe(0)
    })

    it('should compute streak correctly for consecutive days', () => {
      const logs: Log[] = [
        { id: '1', user_id: 'user1', date: '2024-01-05', ate: true, created_at: '2024-01-05T10:00:00Z' },
        { id: '2', user_id: 'user1', date: '2024-01-04', ate: true, created_at: '2024-01-04T10:00:00Z' },
        { id: '3', user_id: 'user1', date: '2024-01-03', ate: true, created_at: '2024-01-03T10:00:00Z' }
      ]
      const result = computeStreak(logs)
      expect(result.count).toBe(3)
      expect(result.last_date).toBe('2024-01-05')
    })

    it('should break streak on missed day', () => {
      const logs: Log[] = [
        { id: '1', user_id: 'user1', date: '2024-01-05', ate: true, created_at: '2024-01-05T10:00:00Z' },
        { id: '2', user_id: 'user1', date: '2024-01-04', ate: true, created_at: '2024-01-04T10:00:00Z' },
        { id: '3', user_id: 'user1', date: '2024-01-02', ate: true, created_at: '2024-01-02T10:00:00Z' }
      ]
      const result = computeStreak(logs)
      expect(result.count).toBe(2) // Only counts consecutive days from today
    })

    it('should handle yesterday as valid streak start', () => {
      const logs: Log[] = [
        { id: '1', user_id: 'user1', date: '2024-01-04', ate: true, created_at: '2024-01-04T10:00:00Z' },
        { id: '2', user_id: 'user1', date: '2024-01-03', ate: true, created_at: '2024-01-03T10:00:00Z' }
      ]
      const result = computeStreak(logs)
      expect(result.count).toBe(2)
    })
  })

  describe('getMissedInLastThreeDays', () => {
    it('should count missed days correctly', () => {
      const logs: Log[] = [
        { id: '1', user_id: 'user1', date: '2024-01-05', ate: true, created_at: '2024-01-05T10:00:00Z' },
        { id: '2', user_id: 'user1', date: '2024-01-04', ate: false, created_at: '2024-01-04T10:00:00Z' },
        { id: '3', user_id: 'user1', date: '2024-01-03', ate: false, created_at: '2024-01-03T10:00:00Z' }
      ]
      const result = getMissedInLastThreeDays(logs)
      expect(result).toBe(2) // Missed 2 of last 3 days
    })

    it('should count days with no logs as missed', () => {
      const logs: Log[] = [
        { id: '1', user_id: 'user1', date: '2024-01-05', ate: true, created_at: '2024-01-05T10:00:00Z' }
      ]
      const result = getMissedInLastThreeDays(logs)
      expect(result).toBe(2) // Missing logs for 2 days = missed
    })

    it('should return 0 when all days eaten', () => {
      const logs: Log[] = [
        { id: '1', user_id: 'user1', date: '2024-01-05', ate: true, created_at: '2024-01-05T10:00:00Z' },
        { id: '2', user_id: 'user1', date: '2024-01-04', ate: true, created_at: '2024-01-04T10:00:00Z' },
        { id: '3', user_id: 'user1', date: '2024-01-03', ate: true, created_at: '2024-01-03T10:00:00Z' }
      ]
      const result = getMissedInLastThreeDays(logs)
      expect(result).toBe(0)
    })
  })
})