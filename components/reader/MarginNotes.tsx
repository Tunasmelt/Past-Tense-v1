'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X } from 'lucide-react'

interface MarginNote {
  id: string
  content: string
  isPublic: boolean
  position: number
  users?: {
    displayName?: string
    avatarUrl?: string
  }
}

interface MarginNotesProps {
  pageId: string
  position: number
  notes: MarginNote[]
  onAddNote: (content: string, isPublic: boolean) => Promise<void>
}

export default function MarginNotes({
  pageId,
  position,
  notes,
  onAddNote,
}: MarginNotesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await onAddNote(content, isPublic)
      setContent('')
      setIsPublic(false)
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        title="Margin notes"
      >
        <MessageCircle className="h-4 w-4" />
        {notes.length > 0 && (
          <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
            {notes.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-8 right-0 z-50 bg-background border border-border rounded-lg shadow-lg p-4 w-72 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">Notes</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Existing notes */}
          {notes.length > 0 && (
            <div className="mb-4 space-y-3 pb-4 border-b border-border">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="text-sm bg-muted p-2 rounded border border-border"
                >
                  <p className="text-foreground">{note.content}</p>
                  {note.users?.displayName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      — {note.users.displayName}
                      {note.isPublic && ' (public)'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add new note */}
          <div className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a note..."
              className="w-full h-20 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              Share publicly
            </label>

            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="w-full"
              size="sm"
            >
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
