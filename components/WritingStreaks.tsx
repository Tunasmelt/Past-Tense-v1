'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Flame, Target, BookOpen } from 'lucide-react'

interface Streak {
  currentStreak: number
  longestStreak: number
  lastWriteDate?: string
  totalWordsWritten: number
}

export default function WritingStreaks() {
  const { user } = useAuth()
  const [streak, setStreak] = useState<Streak | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/streaks', {
          headers: {
            'Authorization': `Bearer ${user.id}`,
          },
        })

        if (!response.ok) throw new Error('Failed to fetch streak')

        const data = await response.json()
        setStreak(data.streak)
      } catch (error) {
        console.error('Error fetching streak:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [user])

  if (!user || loading || !streak) return null

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-foreground">Writing Streak</h3>
        <Flame className="h-5 w-5 text-orange-500" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {streak.currentStreak}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Current
          </div>
        </div>

        {/* Longest Streak */}
        <div className="text-center border-l border-r border-orange-200 dark:border-orange-800">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {streak.longestStreak}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Longest
          </div>
        </div>

        {/* Words Written */}
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {(streak.totalWordsWritten / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Words
          </div>
        </div>
      </div>

      {streak.currentStreak > 0 && (
        <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/50 rounded text-sm text-orange-900 dark:text-orange-100">
          Keep going! Your {streak.currentStreak}-day streak is burning.
        </div>
      )}
    </Card>
  )
}
