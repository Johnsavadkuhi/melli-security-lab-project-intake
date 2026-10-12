import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveDraft: (data: unknown) => ipcRenderer.invoke('draft:save', data),
  loadDraft: () => ipcRenderer.invoke('draft:load'),
  exportJson: (data: unknown) => ipcRenderer.invoke('export:json', data)
})
