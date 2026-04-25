import { create } from 'zustand'
import { LayoutMode } from '@/lib/types'

export interface CanvasElement {
  id: string
  type: 'image' | 'text' | 'shape'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  content?: string | { url: string }
  style?: Record<string, string>
}

export interface CanvasPage {
  id: string
  title: string
  layoutMode: LayoutMode
  backgroundColor: string
  elements: CanvasElement[]
  fontSize: number
  fontFamily: string
}

interface CanvasStore {
  currentPage: CanvasPage | null
  selectedElementId: string | null
  
  // Page actions
  initializePage: (page: CanvasPage) => void
  updatePageTitle: (title: string) => void
  setLayoutMode: (mode: LayoutMode) => void
  setBackgroundColor: (color: string) => void
  
  // Element actions
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  deleteElement: (id: string) => void
  selectElement: (id: string | null) => void
  duplicateElement: (id: string) => void
  
  // Batch actions
  getElements: () => CanvasElement[]
  getSelectedElement: () => CanvasElement | undefined
  
  // History/Undo
  undo: () => void
  redo: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const initialPageState: CanvasPage = {
  id: generateId(),
  title: 'Untitled',
  layoutMode: 'portrait',
  backgroundColor: '#ffffff',
  elements: [],
  fontSize: 16,
  fontFamily: 'serif',
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  currentPage: initialPageState,
  selectedElementId: null,

  initializePage: (page) => set({ currentPage: page }),

  updatePageTitle: (title) =>
    set((state) => ({
      currentPage: state.currentPage ? { ...state.currentPage, title } : null,
    })),

  setLayoutMode: (mode) =>
    set((state) => ({
      currentPage: state.currentPage ? { ...state.currentPage, layoutMode: mode } : null,
    })),

  setBackgroundColor: (color) =>
    set((state) => ({
      currentPage: state.currentPage ? { ...state.currentPage, backgroundColor: color } : null,
    })),

  addElement: (element) =>
    set((state) => ({
      currentPage: state.currentPage
        ? {
            ...state.currentPage,
            elements: [...state.currentPage.elements, element],
          }
        : null,
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      currentPage: state.currentPage
        ? {
            ...state.currentPage,
            elements: state.currentPage.elements.map((el) =>
              el.id === id ? { ...el, ...updates } : el
            ),
          }
        : null,
    })),

  deleteElement: (id) =>
    set((state) => ({
      currentPage: state.currentPage
        ? {
            ...state.currentPage,
            elements: state.currentPage.elements.filter((el) => el.id !== id),
          }
        : null,
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    })),

  selectElement: (id) => set({ selectedElementId: id }),

  duplicateElement: (id) => {
    const state = get()
    const element = state.currentPage?.elements.find((el) => el.id === id)
    if (element) {
      const newElement = {
        ...element,
        id: generateId(),
        x: element.x + 20,
        y: element.y + 20,
      }
      set((state) => ({
        currentPage: state.currentPage
          ? {
              ...state.currentPage,
              elements: [...state.currentPage.elements, newElement],
            }
          : null,
      }))
    }
  },

  getElements: () => get().currentPage?.elements || [],
  getSelectedElement: () => {
    const state = get()
    return state.currentPage?.elements.find((el) => el.id === state.selectedElementId)
  },

  undo: () => {
    // Implement with history stack
  },
  redo: () => {
    // Implement with history stack
  },
}))
