import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import path from 'path'
import url from 'url'
import { fileURLToPath } from 'url' // Added for ES Module compatibility

// Manually define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    backgroundColor: '#ffffff',
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../public/logo.png')
  })

  // Load the app
  const startUrl = process.env.ELECTRON_START_URL || 
    url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      slashes: true
    })

  mainWindow.loadURL(startUrl)

  // Show window when ready
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
  })

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  // Create application menu
  createMenu()
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Ctrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reload()
            }
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools()
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'Ctrl+Plus',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.zoomIn()
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'Ctrl+-',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.zoomOut()
            }
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'Ctrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0)
            }
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Handle file dialog from renderer
ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await mainWindow.webContents.session.dialog.showOpenDialog(mainWindow, options)
  return result
})

// Handle save file dialog from renderer
ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await mainWindow.webContents.session.dialog.showSaveDialog(mainWindow, options)
  return result
})
