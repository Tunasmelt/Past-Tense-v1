'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Play, Pause, RotateCcw } from 'lucide-react'

interface FocusModeProps {
  pageId: string
  isActive: boolean
  onClose: () => void
}

export default function FocusMode({
  pageId,
  isActive,
  onClose,
}: FocusModeProps) {
  const { user } = useAuth()
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [totalDuration, setTotalDuration] = useState(25 * 60)
  const [wordsWritten, setWordsWritten] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      // Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus session complete!', {
          body: 'Great work! Time for a break.',
        })
      }
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const handleStart = () => {
    setIsRunning(true)
    if (user) {
      fetch('/api/writing-sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          action: 'start',
        }),
      })
    }
  }

  const handleEnd = async () => {
    setIsRunning(false)
    if (user) {
      const duration = Math.floor((totalDuration - timeLeft) / 60)
      await fetch('/api/writing-sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          action: 'end',
          wordsWritten,
          durationMinutes: duration,
        }),
      })

      // Update streak
      if (wordsWritten > 0) {
        await fetch('/api/streaks', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.id}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ wordsAdded: wordsWritten }),
        })
      }
    }

    onClose()
  }

  const handleReset = () => {
    setTimeLeft(totalDuration)
    setIsRunning(false)
    setWordsWritten(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100

  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Focus Mode</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Timer Circle */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${(progress / 100) * 376.99}`}
              strokeDashoffset="0"
              className="text-primary transition-all"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground font-mono">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Words Counter */}
        <div className="text-center mb-6">
          <div className="text-sm text-muted-foreground mb-2">Words Written</div>
          <input
            type="number"
            value={wordsWritten}
            onChange={(e) => setWordsWritten(parseInt(e.target.value) || 0)}
            className="w-full text-center text-3xl font-bold border-b-2 border-primary bg-transparent text-foreground focus:outline-none"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="flex-1 gap-2"
              disabled={timeLeft === 0}
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
          ) : (
            <Button
              onClick={() => setIsRunning(false)}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          <Button
            onClick={handleReset}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleEnd}
          className="w-full"
        >
          End Session
        </Button>
      </Card>
    </div>
  )
}
