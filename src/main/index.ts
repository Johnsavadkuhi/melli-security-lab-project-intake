import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { promises as fs } from 'node:fs'

const draftFile = () => join(app.getPath('userData'), 'project-intake-draft.json')

// The development container runs as root; production installers run as a normal user.
if (typeof process.getuid === 'function' && process.getuid() === 0) app.commandLine.appendSwitch('no-sandbox')

async function writeJsonAtomically(filePath: string, value: unknown) {
  const temporaryPath = `${filePath}.tmp-${process.pid}`
  await fs.mkdir(join(filePath, '..'), { recursive: true })
  await fs.writeFile(temporaryPath, JSON.stringify(value, null, 2), 'utf8')
  await fs.rename(temporaryPath, filePath)
}

function safeFilePart(value: unknown) {
  return String(value || 'project-passport').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'project-passport'
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1480,
    height: 980,
    minWidth: 1080,
    minHeight: 720,
    show: false,
    backgroundColor: '#f5f7fb',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  win.once('ready-to-show', () => win.show())
  win.webContents.setWindowOpenHandler(({ url }) => { void shell.openExternal(url); return { action: 'deny' } })
  if (process.env.ELECTRON_RENDERER_URL) await win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else await win.loadFile(join(__dirname, '../renderer/index.html'))
}

ipcMain.handle('draft:save', async (_event, data) => {
  await writeJsonAtomically(draftFile(), data)
  return { ok: true }
})

ipcMain.handle('draft:load', async () => {
  try { return JSON.parse(await fs.readFile(draftFile(), 'utf8')) }
  catch { return null }
})

ipcMain.handle('export:json', async (_event, data) => {
  const submissionId = (data as { submissionId?: unknown } | null)?.submissionId
  const result = await dialog.showSaveDialog({
    title: 'خروجی شناسنامه پروژه',
    defaultPath: `${safeFilePart(submissionId)}.json`,
    filters: [{ name: 'Project Passport JSON', extensions: ['json'] }]
  })
  if (result.canceled || !result.filePath) return { ok: false, canceled: true }
  await writeJsonAtomically(result.filePath, data)
  return { ok: true, path: result.filePath }
})

app.whenReady().then(() => {
  void createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow() })
})
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
