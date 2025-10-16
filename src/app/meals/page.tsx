'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Meal } from '@/lib/types'
import AuthGate from '@/components/AuthGate'
import MealCard from '@/components/MealCard'

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([])
  const [search, setSearch] = useState('')
  const [minProtein, setMinProtein] = useState(20)

  useEffect(() => {
    loadMeals()
  }, [])

  useEffect(() => {
    filterMeals()
  }, [meals, search, minProtein])

  const loadMeals = async () => {
    const { data } = await supabase
      .from('meals')
      .select('*')
      .order('protein', { ascending: false })

    setMeals(data || [])
  }

  const filterMeals = () => {
    let filtered = meals.filter(meal => meal.protein >= minProtein)
    
    if (search) {
      filtered = filtered.filter(meal =>
        meal.name.toLowerCase().includes(search.toLowerCase()) ||
        meal.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }
    
    setFilteredMeals(filtered)
  }

  return (
    <AuthGate>
      <div>
        <h1 className="text-3xl font-bold mb-6">Breakfast Meals</h1>
        
        <div className="card mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search meals or tags..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Protein (g)</label>
              <input
                type="number"
                value={minProtein}
                onChange={(e) => setMinProtein(Number(e.target.value))}
                className="w-24 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>

        {filteredMeals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No meals found matching your criteria.
          </div>
        )}
      </div>
    </AuthGate>
  )
}