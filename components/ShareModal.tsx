'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ShareRole } from '@/lib/types'
import { Copy, Trash2, Eye, Edit, Lock, Loader2 } from 'lucide-react'

interface Share {
  id: string
  email?: string
  role: ShareRole
  shareToken?: string
  expiresAt?: string
}

interface ShareModalProps {
  pageId: string
  pageTitle: string
  onClose: () => void
}

export default function ShareModal({
  pageId,
  pageTitle,
  onClose,
}: ShareModalProps) {
  const [shares, setShares] = useState<Share[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<ShareRole>('viewer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shareToken, setShareToken] = useState('')
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (!email) {
      setError('Please enter an email address')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/pages/${pageId}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to share')
        return
      }

      const newShare = await response.json()
      setShares([...shares, newShare])
      setEmail('')
      setRole('viewer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateToken = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pages/${pageId}/shares/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'viewer' }),
      })

      if (!response.ok) throw new Error('Failed to generate token')

      const data = await response.json()
      setShareToken(data.shareToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToken = () => {
    const url = `${window.location.origin}/shared/${shareToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRemoveShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/shares/${shareId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove share')

      setShares(shares.filter((s) => s.id !== shareId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove share')
    }
  }

  const roleIcons: Record<ShareRole, React.ReactNode> = {
    viewer: <Eye className="h-4 w-4" />,
    editor: <Edit className="h-4 w-4" />,
    admin: <Lock className="h-4 w-4" />,
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Share Story</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {pageTitle}
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 mb-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Public Link Sharing */}
        <div className="space-y-3 mb-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold text-sm">Public Link</h3>
          {shareToken ? (
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/shared/${shareToken}`}
                readOnly
                className="text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToken}
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateToken}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Public Link'
              )}
            </Button>
          )}
        </div>

        {/* Individual Sharing */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm">Share with People</h3>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ShareRole)}
              disabled={loading}
              className="px-3 py-2 rounded-md border border-border text-sm"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <Button
              onClick={handleShare}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Share'
              )}
            </Button>
          </div>
        </div>

        {/* Shared List */}
        {shares.length > 0 && (
          <div className="space-y-2 mb-6">
            <h3 className="font-semibold text-sm">Shared With</h3>
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {roleIcons[share.role]}
                  <div className="text-sm">
                    <p className="font-medium">{share.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {share.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveShare(share.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
