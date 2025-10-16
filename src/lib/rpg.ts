export interface Stats {
  str: number
  sta: number
  def: number
  luck: number
  m: number
  xp_today: number
}

export interface FightResult {
  win: boolean
  xp_gain: number
  boss: string
  drop_name?: string
  drop_rarity?: string
}

export function computeStats(
  protein: number,
  carbs: number,
  fiber: number,
  variety: number,
  streak: number
): Stats {
  const str = Math.round(protein / 10)
  const sta = Math.round(carbs / 25)
  const def = Math.max(1, Math.round(fiber / 5))
  const luck = Math.max(0, Math.min(5, Math.floor(variety / 3)))
  const m = 1 + 0.1 * Math.floor(streak / 7)
  const xp_today = Math.round(30 * m)
  
  return { str, sta, def, luck, m, xp_today }
}

export function getWeekBoss(date: Date): string {
  const week = getWeekNumber(date)
  const bosses = ['Morning Fog', 'Decision Fatigue', 'Lecture Slump']
  return bosses[week % 3]
}

export function simulateFight(stats: Stats, boss: string): FightResult {
  const playerPower = stats.str + stats.sta + stats.def + stats.luck
  const bossPower = 15 + (getWeekNumber(new Date()) % 5)
  
  const win = playerPower >= bossPower
  const xp_gain = win ? stats.xp_today : Math.floor(stats.xp_today / 4)
  
  // Cosmetic drop simulation
  const roll = Math.floor(Math.random() * 100) + 1 + stats.luck * 5
  let drop_name: string | undefined
  let drop_rarity: string | undefined
  
  if (roll >= 95) {
    const rareDrops = ['Chula-Pink Trail', 'Hollow-Body Guitar']
    drop_name = rareDrops[Math.floor(Math.random() * rareDrops.length)]
    drop_rarity = 'rare'
  } else if (roll >= 70) {
    const commonDrops = ['Chef Hat', 'Protein Token', 'Bottle of Water']
    drop_name = commonDrops[Math.floor(Math.random() * commonDrops.length)]
    drop_rarity = 'common'
  }
  
  return { win, xp_gain, boss, drop_name, drop_rarity }
}

export function canLogYesterday(): boolean {
  const now = new Date()
  return now.getHours() < 12
}

export function getYesterday(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}