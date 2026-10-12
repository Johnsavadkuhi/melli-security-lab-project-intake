const draftKey = 'melli-project-intake-draft'

export async function saveDraft(data: unknown) {
  if (window.electronAPI) {
    const result = await window.electronAPI.saveDraft(data)
    if (!result.ok) throw new Error(result.error || 'draft-save-failed')
  } else {
    window.localStorage.setItem(draftKey, JSON.stringify(data))
  }
}

export async function loadDraft(): Promise<unknown | null> {
  if (window.electronAPI) return window.electronAPI.loadDraft()
  const saved = window.localStorage.getItem(draftKey)
  return saved ? JSON.parse(saved) : null
}

export function downloadJson(data: unknown, submissionId: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${submissionId.replace(/[^a-zA-Z0-9._-]/g, '-') || 'project-passport'}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Leave the URL alive until the browser has had time to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
