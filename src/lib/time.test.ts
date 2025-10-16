import { describe, it, expect, vi } from 'vitest'
import { isWithinBreakfastWindow, todayBangkokISO, parseTimeToMinutes, minutesToTime } from './time'

describe('time utilities', () => {
  describe('isWithinBreakfastWindow', () => {
    it('should return true when time is within window', () => {
      const mockDate = new Date('2024-01-01T08:00:00+07:00') // 8:00 AM Bangkok
      expect(isWithinBreakfastWindow('06:30', '10:30', mockDate)).toBe(true)
    })

    it('should return false when time is before window', () => {
      const mockDate = new Date('2024-01-01T06:00:00+07:00') // 6:00 AM Bangkok
      expect(isWithinBreakfastWindow('06:30', '10:30', mockDate)).toBe(false)
    })

    it('should return false when time is after window', () => {
      const mockDate = new Date('2024-01-01T11:00:00+07:00') // 11:00 AM Bangkok
      expect(isWithinBreakfastWindow('06:30', '10:30', mockDate)).toBe(false)
    })

    it('should return true at exact start time', () => {
      const mockDate = new Date('2024-01-01T06:30:00+07:00')
      expect(isWithinBreakfastWindow('06:30', '10:30', mockDate)).toBe(true)
    })

    it('should return true at exact end time', () => {
      const mockDate = new Date('2024-01-01T10:30:00+07:00')
      expect(isWithinBreakfastWindow('06:30', '10:30', mockDate)).toBe(true)
    })
  })

  describe('parseTimeToMinutes', () => {
    it('should convert time string to minutes', () => {
      expect(parseTimeToMinutes('06:30')).toBe(390)
      expect(parseTimeToMinutes('10:30')).toBe(630)
      expect(parseTimeToMinutes('00:00')).toBe(0)
      expect(parseTimeToMinutes('23:59')).toBe(1439)
    })
  })

  describe('minutesToTime', () => {
    it('should convert minutes to time string', () => {
      expect(minutesToTime(390)).toBe('06:30')
      expect(minutesToTime(630)).toBe('10:30')
      expect(minutesToTime(0)).toBe('00:00')
      expect(minutesToTime(1439)).toBe('23:59')
    })
  })
})