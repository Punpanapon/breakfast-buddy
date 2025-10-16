'use client'

interface Cosmetic {
  name: string
  rarity: 'common' | 'rare'
  acquired_at: string
}

interface CosmeticsListProps {
  cosmetics: Cosmetic[]
}

export default function CosmeticsList({ cosmetics }: CosmeticsListProps) {
  if (cosmetics.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No cosmetics collected yet. Fight bosses to earn drops!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {cosmetics.map((cosmetic, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg border text-center ${
            cosmetic.rarity === 'rare'
              ? 'bg-purple-50 border-purple-200 text-purple-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="font-medium text-sm">{cosmetic.name}</div>
          <div className="text-xs opacity-75 capitalize">{cosmetic.rarity}</div>
        </div>
      ))}
    </div>
  )
}