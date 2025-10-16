'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabaseClient'
import { computeStats, simulateFight, getWeekBoss, canLogYesterday, getYesterday, getToday } from '@/lib/rpg'
import RpgMeters from '@/components/RpgMeters'
import CosmeticsList from '@/components/CosmeticsList'
import AuthGate from '@/components/AuthGate'

interface RpgState {
  streak: number
  xp: number
  level: number
  freeze_used_month: string | null
}

interface BattleState {
  isActive: boolean
  playerHp: number
  bossHp: number
  result?: {
    win: boolean
    xp_gain: number
    drop_name?: string
    drop_rarity?: string
  }
}

export default function GamePage() {
  const [formData, setFormData] = useState({
    day: getToday(),
    protein_g: 25,
    carbs_g: 50,
    fiber_g: 10,
    water_ml: 500,
    variety_score: 9
  })
  const [rpgState, setRpgState] = useState<RpgState>({ streak: 0, xp: 0, level: 1, freeze_used_month: null })
  const [cosmetics, setCosmetics] = useState<any[]>([])
  const [battleState, setBattleState] = useState<BattleState>({ isActive: false, playerHp: 100, bossHp: 100 })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
    loadRpgData()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabaseClient.auth.getUser()
    setUser(user)
  }

  const loadRpgData = async () => {
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) return

    const { data: state } = await supabaseClient
      .from('rpg_state')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (state) {
      setRpgState(state)
    }

    const { data: cosmeticData } = await supabaseClient
      .from('cosmetics')
      .select('*')
      .eq('user_id', user.id)
      .order('acquired_at', { ascending: false })

    setCosmetics(cosmeticData || [])
  }

  const handleLogAndFight = async () => {
    setLoading(true)
    
    if (user) {
      // Use Supabase RPC
      const { data, error } = await supabaseClient.rpc('log_breakfast_and_fight', {
        p_day: formData.day,
        p_protein: formData.protein_g,
        p_carbs: formData.carbs_g,
        p_fiber: formData.fiber_g,
        p_water: formData.water_ml,
        p_variety: formData.variety_score
      })

      if (error) {
        console.error('RPC error:', error)
        setLoading(false)
        return
      }

      const result = data[0]
      
      // Animate battle
      await animateBattle(result.win)
      
      // Update state
      setRpgState(prev => ({
        ...prev,
        streak: result.new_streak,
        xp: prev.xp + result.xp_gain,
        level: Math.floor((prev.xp + result.xp_gain) / 100) + 1
      }))

      setBattleState(prev => ({
        ...prev,
        result: {
          win: result.win,
          xp_gain: result.xp_gain,
          drop_name: result.drop_name,
          drop_rarity: result.drop_rarity
        }
      }))

      loadRpgData() // Refresh cosmetics
    } else {
      // Local fallback
      const stats = computeStats(
        formData.protein_g,
        formData.carbs_g,
        formData.fiber_g,
        formData.variety_score,
        rpgState.streak
      )
      
      const boss = getWeekBoss(new Date(formData.day))
      const result = simulateFight(stats, boss)
      
      await animateBattle(result.win)
      
      // Update local state
      const newStreak = rpgState.streak + 1
      const newXp = rpgState.xp + result.xp_gain
      const newLevel = Math.floor(newXp / 100) + 1
      
      setRpgState({ ...rpgState, streak: newStreak, xp: newXp, level: newLevel, freeze_used_month: null })
      setBattleState(prev => ({ ...prev, result }))
      
      // Store in localStorage
      localStorage.setItem('rpg_state', JSON.stringify({ streak: newStreak, xp: newXp, level: newLevel }))
    }
    
    setLoading(false)
  }

  const animateBattle = (playerWins: boolean): Promise<void> => {
    return new Promise((resolve) => {
      setBattleState({ isActive: true, playerHp: 100, bossHp: 100 })
      
      let frame = 0
      const animate = () => {
        frame++
        const progress = frame / 300 // 5 seconds at 60fps
        
        if (progress >= 1) {
          setBattleState(prev => ({
            ...prev,
            isActive: false,
            playerHp: playerWins ? 20 : 0,
            bossHp: playerWins ? 0 : 20
          }))
          resolve()
          return
        }
        
        // Simulate battle damage over time
        const playerDamage = playerWins ? 20 : 100
        const bossDamage = playerWins ? 100 : 20
        
        setBattleState(prev => ({
          ...prev,
          playerHp: Math.max(0, 100 - (playerDamage * progress)),
          bossHp: Math.max(0, 100 - (bossDamage * progress))
        }))
        
        requestAnimationFrame(animate)
      }
      
      requestAnimationFrame(animate)
    })
  }

  const handleShare = async () => {
    const text = `🍳 Breakfast RPG - Level ${rpgState.level}, ${rpgState.streak} day streak, ${rpgState.xp} XP! Join me at Breakfast Buddy!`
    
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  const stats = computeStats(
    formData.protein_g,
    formData.carbs_g,
    formData.fiber_g,
    formData.variety_score,
    rpgState.streak
  )

  const boss = getWeekBoss(new Date(formData.day))

  return (
    <AuthGate>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🍳 Breakfast RPG</h1>
          <div className="flex justify-center gap-4 text-sm">
            <span>Level {rpgState.level}</span>
            <span>{rpgState.streak} day streak</span>
            <span>{rpgState.xp} XP</span>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Log Breakfast & Fight</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={formData.day}
                onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                max={canLogYesterday() ? getToday() : getYesterday()}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Protein (g)</label>
              <input
                type="number"
                value={formData.protein_g}
                onChange={(e) => setFormData(prev => ({ ...prev, protein_g: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Carbs (g)</label>
              <input
                type="number"
                value={formData.carbs_g}
                onChange={(e) => setFormData(prev => ({ ...prev, carbs_g: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fiber (g)</label>
              <input
                type="number"
                value={formData.fiber_g}
                onChange={(e) => setFormData(prev => ({ ...prev, fiber_g: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Water (ml)</label>
              <input
                type="number"
                value={formData.water_ml}
                onChange={(e) => setFormData(prev => ({ ...prev, water_ml: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Variety (0-15)</label>
              <input
                type="number"
                min="0"
                max="15"
                value={formData.variety_score}
                onChange={(e) => setFormData(prev => ({ ...prev, variety_score: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-2">Your Stats vs {boss}</div>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>STR: {stats.str}</div>
              <div>STA: {stats.sta}</div>
              <div>DEF: {stats.def}</div>
              <div>LUCK: {stats.luck}</div>
            </div>
            <div className="text-center text-sm mt-2">
              Multiplier: {stats.m.toFixed(1)}x | Potential XP: {stats.xp_today}
            </div>
          </div>

          <button
            onClick={handleLogAndFight}
            disabled={loading || battleState.isActive}
            className="btn btn-primary w-full mb-4"
          >
            {loading || battleState.isActive ? 'Fighting...' : 'Log & Fight Boss!'}
          </button>

          {(battleState.isActive || battleState.result) && (
            <div className="space-y-4">
              <RpgMeters
                playerHp={battleState.playerHp}
                playerMaxHp={100}
                bossHp={battleState.bossHp}
                bossMaxHp={100}
                bossName={boss}
              />
              
              {battleState.result && (
                <div className={`p-4 rounded-lg ${battleState.result.win ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="font-bold">
                    {battleState.result.win ? '🎉 Victory!' : '💀 Defeat!'}
                  </div>
                  <div>XP Gained: {battleState.result.xp_gain}</div>
                  {battleState.result.drop_name && (
                    <div className="text-sm">
                      🎁 Dropped: {battleState.result.drop_name} ({battleState.result.drop_rarity})
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Cosmetics Collection</h2>
            <button onClick={handleShare} className="btn btn-secondary text-sm">
              Share Progress
            </button>
          </div>
          <CosmeticsList cosmetics={cosmetics} />
        </div>
      </div>
    </AuthGate>
  )
}