import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMissedInLastThreeDays, computeStreak } from '@/lib/streak'
import { todayBangkokISO, isWithinBreakfastWindow } from '@/lib/time'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  // Basic validation
  if (!uid || !token) {
    return NextResponse.json({ error: 'Missing uid or token' }, { status: 400 })
  }

  // Simple token validation (TODO: implement proper token scoping)
  if (token.length === 0) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const today = todayBangkokISO()
    
    // Get user's logs for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', uid)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const todayLog = logs?.find(log => log.date === today)
    const ateToday = todayLog?.ate || false
    
    const streak = computeStreak(logs || [])
    const missedInLastThree = getMissedInLastThreeDays(logs || [])
    
    // Get user's breakfast window
    const { data: profile } = await supabase
      .from('profiles')
      .select('breakfast_start, breakfast_end')
      .eq('id', uid)
      .single()

    const breakfastStart = profile?.breakfast_start || '06:30'
    const breakfastEnd = profile?.breakfast_end || '10:30'
    const isAfterWindow = !isWithinBreakfastWindow(breakfastStart, breakfastEnd)

    let emoji: 'happy' | 'neutral' | 'angry'
    let msg: string

    // Determine emoji and message based on rules
    if (ateToday && streak.count >= 3) {
      emoji = 'happy'
      msg = `Great job! ${streak.count} day streak! 🔥`
    } else if (ateToday && streak.count < 3) {
      emoji = 'neutral'
      msg = `Good! Keep building your streak (${streak.count} days)`
    } else if (missedInLastThree >= 2) {
      emoji = 'angry'
      msg = `You've missed ${missedInLastThree} of the last 3 days!`
    } else if (isAfterWindow && !ateToday) {
      emoji = 'angry'
      msg = `It's after ${breakfastEnd} and you haven't eaten!`
    } else {
      emoji = 'neutral'
      msg = 'Time for breakfast! 🍳'
    }

    const response = NextResponse.json({ emoji, msg })
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
    
    return response
    
  } catch (error) {
    console.error('Device status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}