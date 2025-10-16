'use client'

interface RpgMetersProps {
  playerHp: number
  playerMaxHp: number
  bossHp: number
  bossMaxHp: number
  playerName?: string
  bossName?: string
}

export default function RpgMeters({
  playerHp,
  playerMaxHp,
  bossHp,
  bossMaxHp,
  playerName = 'You',
  bossName = 'Boss'
}: RpgMetersProps) {
  const playerPercent = Math.max(0, (playerHp / playerMaxHp) * 100)
  const bossPercent = Math.max(0, (bossHp / bossMaxHp) * 100)

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{playerName}</span>
          <span>{playerHp}/{playerMaxHp}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${playerPercent}%` }}
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{bossName}</span>
          <span>{bossHp}/{bossMaxHp}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-red-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${bossPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}