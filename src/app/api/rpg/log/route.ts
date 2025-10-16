import { NextRequest, NextResponse } from 'next/server'
import { supabaseClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { day, protein_g, carbs_g, fiber_g, water_ml, variety_score } = body

    const { data, error } = await supabaseClient.rpc('log_breakfast_and_fight', {
      p_day: day,
      p_protein: protein_g,
      p_carbs: carbs_g,
      p_fiber: fiber_g,
      p_water: water_ml,
      p_variety: variety_score
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}