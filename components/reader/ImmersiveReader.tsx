'use client'

import { useEffect, useRef, useState } from 'react'
import { useReaderStore } from '@/lib/stores/readerStore'
import { PaperTone } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Plus, 
  Minus, 
  X, 
  Highlighter,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface ImmersiveReaderProps {
  pageId: string
  pageTitle: string
  content: React.ReactNode
}

const paperToneColors: Record<PaperTone, { bg: string; text: string }> = {
  white: { bg: '#ffffff', text: '#000000' },
  cream: { bg: '#fffef0', text: '#2b2b2b' },
  beige: { bg: '#f5f1e8', text: '#3d3d3d' },
  gray: { bg: '#f0f0f0', text: '#1a1a1a' },
  dark: { bg: '#1a1a1a', text: '#e0e0e0' },
}

export default function ImmersiveReader({
  pageId,
  pageTitle,
  content,
}: ImmersiveReaderProps) {
  const {
    settings,
    updateFontSize,
    updateFontFamily,
    updatePaperTone,
    updateScrollPosition,
    updateProgress,
    highlights,
    toggleHighlight,
    saveSettings,
    loadSettings,
  } = useReaderStore()

  const [showSettings, setShowSettings] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSettings(pageId)
  }, [pageId, loadSettings])

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

      updateScrollPosition(scrollTop)
      updateProgress(progress)
      saveSettings(pageId)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pageId, updateScrollPosition, updateProgress, saveSettings])

  const toneColors = paperToneColors[settings.paperTone]
  const fontFamilies = {
    'serif': 'font-serif',
    'sans-serif': 'font-sans',
    'mono': 'font-mono',
  }

  return (
    <div
      style={{
        backgroundColor: toneColors.bg,
        color: toneColors.text,
      }}
      className="min-h-screen transition-colors duration-300"
    >
      {/* Top Navigation */}
      <div
        style={{
          backgroundColor: toneColors.bg,
          borderColor: toneColors.text + '20',
        }}
        className="sticky top-0 z-40 border-b backdrop-blur-sm"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-2 hover:opacity-70">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="flex-1 text-center font-semibold line-clamp-1 mx-4">
            {pageTitle}
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            style={{ color: toneColors.text }}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            backgroundColor: toneColors.text + '20',
            height: '2px',
          }}
          className="w-full"
        >
          <div
            style={{
              backgroundColor: toneColors.text,
              width: `${useReaderStore((state) => state.progressPercentage)}%`,
            }}
            className="h-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          style={{
            backgroundColor: toneColors.bg,
            borderColor: toneColors.text + '20',
          }}
          className="sticky top-[80px] z-30 border-b"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Font Size: {settings.fontSize}px
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFontSize(settings.fontSize - 2)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <input
                  type="range"
                  min="12"
                  max="28"
                  value={settings.fontSize}
                  onChange={(e) => updateFontSize(parseInt(e.target.value))}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFontSize(settings.fontSize + 2)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium mb-2">Font Family</label>
              <div className="flex gap-2">
                {(['serif', 'sans-serif', 'mono'] as const).map((family) => (
                  <Button
                    key={family}
                    variant={settings.fontFamily === family ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFontFamily(family)}
                    className={fontFamilies[family]}
                  >
                    {family === 'serif' ? 'Serif' : family === 'sans-serif' ? 'Sans' : 'Mono'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Paper Tone */}
            <div>
              <label className="block text-sm font-medium mb-2">Paper Tone</label>
              <div className="grid grid-cols-5 gap-2">
                {(['white', 'cream', 'beige', 'gray', 'dark'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => updatePaperTone(tone)}
                    style={{
                      backgroundColor: paperToneColors[tone].bg,
                      borderColor: toneColors.text,
                      borderWidth: settings.paperTone === tone ? '2px' : '1px',
                    }}
                    className="h-12 rounded-lg transition-all hover:scale-105"
                    title={tone}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        ref={contentRef}
        className={`max-w-3xl mx-auto px-4 sm:px-6 py-12 ${fontFamilies[settings.fontFamily]}`}
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: 1.8,
          letterSpacing: `${settings.letterSpacing}em`,
        }}
      >
        {content}
      </div>
    </div>
  )
}
