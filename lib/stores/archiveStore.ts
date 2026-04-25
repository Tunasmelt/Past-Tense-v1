import { create } from 'zustand'

export interface ArchivedPage {
  id: string
  pageId: string
  scheduledFor: string
  surfacedAt?: string
  dismissed: boolean
}

interface ArchiveStoreState {
  resurfaces: ArchivedPage[]
  setResurfaces: (resurfaces: ArchivedPage[]) => void
  addResurface: (resurface: ArchivedPage) => void
  dismissResurface: (pageId: string) => void
  markSurfaced: (pageId: string) => void
}

export const useArchiveStore = create<ArchiveStoreState>((set) => ({
  resurfaces: [],
  setResurfaces: (resurfaces) => set({ resurfaces }),
  addResurface: (resurface) =>
    set((state) => ({
      resurfaces: [...state.resurfaces, resurface],
    })),
  dismissResurface: (pageId) =>
    set((state) => ({
      resurfaces: state.resurfaces.map((r) =>
        r.pageId === pageId ? { ...r, dismissed: true } : r
      ),
    })),
  markSurfaced: (pageId) =>
    set((state) => ({
      resurfaces: state.resurfaces.map((r) =>
        r.pageId === pageId
          ? { ...r, surfacedAt: new Date().toISOString() }
          : r
      ),
    })),
}))
