import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz'

const BANGKOK_TZ = 'Asia/Bangkok'

export function nowInBangkok(): Date {
  return utcToZonedTime(new Date(), BANGKOK_TZ)
}

export function todayBangkokISO(): string {
  return format(nowInBangkok(), 'yyyy-MM-dd')
}

export function isWithinBreakfastWindow(
  startHHmm: string,
  endHHmm: string,
  nowTZ: Date = nowInBangkok()
): boolean {
  const currentTime = format(nowTZ, 'HH:mm')
  return currentTime >= startHHmm && currentTime <= endHHmm
}

export function localDateFromUTC(utc: string): string {
  const utcDate = new Date(utc)
  const bangkokDate = utcToZonedTime(utcDate, BANGKOK_TZ)
  return format(bangkokDate, 'yyyy-MM-dd')
}

export function formatTime(time: string): string {
  return time
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}