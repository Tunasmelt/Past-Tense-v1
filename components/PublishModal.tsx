'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { PageStatus } from '@/lib/types'
import { Calendar, Clock } from 'lucide-react'

interface PublishModalProps {
  pageId: string
  currentStatus: PageStatus
  currentTitle: string
  onClose: () => void
  onPublish: (status: PageStatus, scheduledTime?: Date) => Promise<void>
}

export default function PublishModal({
  pageId,
  currentStatus,
  currentTitle,
  onClose,
  onPublish,
}: PublishModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<PageStatus>(currentStatus)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const statusOptions: { status: PageStatus; label: string; description: string }[] = [
    {
      status: 'private',
      label: 'Private',
      description: 'Only you can see this story',
    },
    {
      status: 'draft',
      label: 'Draft',
      description: 'Share with select people for feedback',
    },
    {
      status: 'public',
      label: 'Public',
      description: 'Anyone can discover and read this story',
    },
  ]

  const handlePublish = async () => {
    setError('')
    setLoading(true)

    try {
      let scheduledTime: Date | undefined
      if (selectedStatus === 'public' && scheduleDate && scheduleTime) {
        scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`)
        if (scheduledTime < new Date()) {
          setError('Schedule time must be in the future')
          return
        }
      }

      await onPublish(selectedStatus, scheduledTime)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Publish Story</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {currentTitle}
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 mb-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {statusOptions.map((option) => (
            <button
              key={option.status}
              onClick={() => setSelectedStatus(option.status)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedStatus === option.status
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold text-sm">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </button>
          ))}
        </div>

        {selectedStatus === 'public' && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Schedule Publishing
            </div>
            <div className="text-xs text-muted-foreground">
              Leave blank to publish immediately
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="flex-1"
              />
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
