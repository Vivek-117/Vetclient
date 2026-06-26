import { app, protocol } from 'electron'
import { createProtocol } from 'electron-builder'

const isDevelopment = process.env.NODE_ENV !== 'production'

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true
    }
  }
])

app.on('ready', async () => {
  if (isDevelopment) {
    // In development, we use Vite dev server
    const viteHost = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
    const win = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })
    win.loadURL(viteHost)
    if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools()
    }
  } else {
    // In production, use the built files
    createProtocol('app')
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // Create new window
  }
})