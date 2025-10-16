export interface Meal {
  id: string
  name: string
  kcal: number
  protein: number
  fat: number
  carb: number
  tags: string[]
  image_url?: string
}

export interface Log {
  id: string
  user_id: string
  date: string
  ate: boolean
  meal_id?: string
  kcal?: number
  protein?: number
  fat?: number
  carb?: number
  created_at: string
  meal?: Meal
}

export interface StreakInfo {
  count: number
  last_date: string | null
}

export interface Profile {
  id: string
  display_name?: string
  breakfast_start: string
  breakfast_end: string
  created_at: string
}