/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    saveDraft: (data: unknown) => Promise<{ ok: boolean }>
    loadDraft: () => Promise<unknown | null>
    exportJson: (data: unknown) => Promise<{ ok: boolean; canceled?: boolean; path?: string }>
  }
}
