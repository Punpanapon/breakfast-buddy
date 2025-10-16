import AuthGate from '@/components/AuthGate'
import TodayCard from '@/components/TodayCard'

export default function HomePage() {
  const breakfastStart = process.env.NEXT_PUBLIC_DEFAULT_BREAKFAST_START || '06:30'
  const breakfastEnd = process.env.NEXT_PUBLIC_DEFAULT_BREAKFAST_END || '10:30'

  return (
    <AuthGate>
      <TodayCard breakfastStart={breakfastStart} breakfastEnd={breakfastEnd} />
    </AuthGate>
  )
}