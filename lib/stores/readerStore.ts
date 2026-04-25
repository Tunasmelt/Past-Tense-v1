import { create } from 'zustand'
import { PaperTone } from '@/lib/types'

interface ReaderSettings {
  fontSize: number
  fontFamily: 'serif' | 'sans-serif' | 'mono'
  paperTone: PaperTone
  lineHeight: number
  letterSpacing: number
}

interface ReaderState {
  settings: ReaderSettings
  scrollPosition: number
  progressPercentage: number
  highlights: Set<string>
  
  // Settings
  updateFontSize: (size: number) => void
  updateFontFamily: (family: 'serif' | 'sans-serif' | 'mono') => void
  updatePaperTone: (tone: PaperTone) => void
  updateLineHeight: (height: number) => void
  updateLetterSpacing: (spacing: number) => void
  
  // Progress
  updateScrollPosition: (position: number) => void
  updateProgress: (percentage: number) => void
  
  // Highlights
  toggleHighlight: (elementId: string) => void
  clearHighlights: () => void
  
  // Persist
  saveSettings: (pageId: string) => Promise<void>
  loadSettings: (pageId: string) => Promise<void>
}

const defaultSettings: ReaderSettings = {
  fontSize: 16,
  fontFamily: 'serif',
  paperTone: 'white',
  lineHeight: 1.6,
  letterSpacing: 0,
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  settings: defaultSettings,
  scrollPosition: 0,
  progressPercentage: 0,
  highlights: new Set(),

  updateFontSize: (size) =>
    set((state) => ({
      settings: { ...state.settings, fontSize: Math.max(12, Math.min(28, size)) },
    })),

  updateFontFamily: (family) =>
    set((state) => ({
      settings: { ...state.settings, fontFamily: family },
    })),

  updatePaperTone: (tone) =>
    set((state) => ({
      settings: { ...state.settings, paperTone: tone },
    })),

  updateLineHeight: (height) =>
    set((state) => ({
      settings: { ...state.settings, lineHeight: height },
    })),

  updateLetterSpacing: (spacing) =>
    set((state) => ({
      settings: { ...state.settings, letterSpacing: spacing },
    })),

  updateScrollPosition: (position) => set({ scrollPosition: position }),

  updateProgress: (percentage) => set({ progressPercentage: percentage }),

  toggleHighlight: (elementId) =>
    set((state) => {
      const newHighlights = new Set(state.highlights)
      if (newHighlights.has(elementId)) {
        newHighlights.delete(elementId)
      } else {
        newHighlights.add(elementId)
      }
      return { highlights: newHighlights }
    }),

  clearHighlights: () => set({ highlights: new Set() }),

  saveSettings: async (pageId: string) => {
    const state = get()
    try {
      await fetch(`/api/pages/${pageId}/reading-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fontSize: state.settings.fontSize,
          fontFamily: state.settings.fontFamily,
          paperTone: state.settings.paperTone,
          scrollPosition: state.scrollPosition,
          progressPercentage: state.progressPercentage,
        }),
      })
    } catch (error) {
      console.error('Failed to save reader settings:', error)
    }
  },

  loadSettings: async (pageId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/reading-progress`)
      if (response.ok) {
        const data = await response.json()
        set({
          settings: {
            ...defaultSettings,
            fontSize: data.font_size || defaultSettings.fontSize,
            fontFamily: data.font_family || defaultSettings.fontFamily,
            paperTone: data.paper_tone || defaultSettings.paperTone,
          },
          scrollPosition: data.scroll_position || 0,
          progressPercentage: data.progress_percentage || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load reader settings:', error)
    }
  },
}))
