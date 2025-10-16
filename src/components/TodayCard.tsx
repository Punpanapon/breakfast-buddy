'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Meal, Log } from '@/lib/types'
import { todayBangkokISO, isWithinBreakfastWindow } from '@/lib/time'
import { useToast, Toast } from './Toast'
import MealCard from './MealCard'

interface TodayCardProps {
  breakfastStart: string
  breakfastEnd: string
}

export default function TodayCard({ breakfastStart, breakfastEnd }: TodayCardProps) {
  const [todayLog, setTodayLog] = useState<Log | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [showMealModal, setShowMealModal] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const today = todayBangkokISO()
  const isInWindow = isWithinBreakfastWindow(breakfastStart, breakfastEnd)

  useEffect(() => {
    loadTodayLog()
    loadMeals()
  }, [])

  const loadTodayLog = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('logs')
      .select('*, meal:meals(*)')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    setTodayLog(data)
  }

  const loadMeals = async () => {
    const { data } = await supabase
      .from('meals')
      .select('*')
      .order('protein', { ascending: false })

    setMeals(data || [])
  }

  const handleEat = () => {
    setShowMealModal(true)
  }

  const handleSkip = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('logs')
      .upsert({
        user_id: user.id,
        date: today,
        ate: false,
      })

    if (error) {
      showToast('Failed to log skip', 'error')
    } else {
      showToast('Breakfast skipped', 'success')
      loadTodayLog()
    }
    setLoading(false)
  }

  const confirmEat = async () => {
    if (!selectedMeal) return
    
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('logs')
      .upsert({
        user_id: user.id,
        date: today,
        ate: true,
        meal_id: selectedMeal.id,
        kcal: selectedMeal.kcal,
        protein: selectedMeal.protein,
        fat: selectedMeal.fat,
        carb: selectedMeal.carb,
      })

    if (error) {
      showToast('Failed to log meal', 'error')
    } else {
      showToast('Meal logged!', 'success')
      loadTodayLog()
      setShowMealModal(false)
      setSelectedMeal(null)
    }
    setLoading(false)
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Today - {today}</h2>
      
      {!isInWindow && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Breakfast window: {breakfastStart} - {breakfastEnd}
        </div>
      )}

      {todayLog ? (
        <div className="text-center">
          {todayLog.ate ? (
            <div>
              <div className="text-6xl mb-2">✅</div>
              <p className="text-lg font-medium text-green-600">You ate breakfast!</p>
              {todayLog.meal && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="font-medium">{todayLog.meal.name}</p>
                  <p className="text-sm text-gray-600">
                    {todayLog.kcal} kcal • {todayLog.protein}g protein
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-2">❌</div>
              <p className="text-lg font-medium text-red-600">You skipped breakfast</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🍳</div>
          <p className="text-lg mb-6">Ready for breakfast?</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleEat}
              disabled={loading}
              className="btn btn-primary"
            >
              Eat
            </button>
            <button
              onClick={handleSkip}
              disabled={loading}
              className="btn btn-secondary"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {showMealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Choose your meal</h3>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {meals.slice(0, 10).map((meal) => (
                <div
                  key={meal.id}
                  className={`border rounded-lg ${
                    selectedMeal?.id === meal.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <MealCard
                    meal={meal}
                    onClick={() => setSelectedMeal(meal)}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmEat}
                disabled={!selectedMeal || loading}
                className="btn btn-primary flex-1"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowMealModal(false)
                  setSelectedMeal(null)
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  )
}