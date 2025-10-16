import { describe, it, expect } from 'vitest'
import { computeStats, getWeekBoss, simulateFight } from './rpg'

describe('RPG utilities', () => {
  describe('computeStats', () => {
    it('should calculate stats correctly', () => {
      const stats = computeStats(30, 75, 15, 12, 14)
      
      expect(stats.str).toBe(3) // 30/10 = 3
      expect(stats.sta).toBe(3) // 75/25 = 3
      expect(stats.def).toBe(3) // 15/5 = 3
      expect(stats.luck).toBe(4) // floor(12/3) = 4
      expect(stats.m).toBe(1.2) // 1 + 0.1 * floor(14/7) = 1.2
      expect(stats.xp_today).toBe(36) // 30 * 1.2 = 36
    })

    it('should enforce minimum def of 1', () => {
      const stats = computeStats(10, 25, 2, 6, 0)
      expect(stats.def).toBe(1)
    })

    it('should clamp luck between 0 and 5', () => {
      const stats1 = computeStats(10, 25, 5, 0, 0)
      expect(stats1.luck).toBe(0)
      
      const stats2 = computeStats(10, 25, 5, 18, 0)
      expect(stats2.luck).toBe(5)
    })
  })

  describe('getWeekBoss', () => {
    it('should return consistent boss for same week', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-07')
      
      const boss1 = getWeekBoss(date1)
      const boss2 = getWeekBoss(date2)
      
      expect(boss1).toBe(boss2)
      expect(['Morning Fog', 'Decision Fatigue', 'Lecture Slump']).toContain(boss1)
    })
  })

  describe('simulateFight', () => {
    it('should return fight result with correct structure', () => {
      const stats = { str: 3, sta: 3, def: 3, luck: 2, m: 1.2, xp_today: 36 }
      const result = simulateFight(stats, 'Morning Fog')
      
      expect(result).toHaveProperty('win')
      expect(result).toHaveProperty('xp_gain')
      expect(result).toHaveProperty('boss', 'Morning Fog')
      expect(typeof result.win).toBe('boolean')
      expect(typeof result.xp_gain).toBe('number')
    })

    it('should award reduced XP on loss', () => {
      const weakStats = { str: 0, sta: 0, def: 1, luck: 0, m: 1, xp_today: 30 }
      const result = simulateFight(weakStats, 'Morning Fog')
      
      if (!result.win) {
        expect(result.xp_gain).toBe(7) // floor(30/4) = 7
      }
    })
  })
})