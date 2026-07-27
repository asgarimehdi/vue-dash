const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

// اجرا در development یا production
const isDev = !app.isPackaged

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'H-Dashboard',
    icon: path.join(__dirname, '../public/favicon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  // منوی ساده
  const menuTemplate = [
    {
      label: 'فایل',
      submenu: [
        {
          label: 'بروزرسانی',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow?.reload(),
        },
        { type: 'separator' },
        {
          label: 'ابزارهای توسعه',
          accelerator: 'F12',
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
        { type: 'separator' },
        { role: 'quit', label: 'خروج' },
      ],
    },
    {
      label: 'نمایش',
      submenu: [
        { role: 'reload', label: 'بروزرسانی' },
        { role: 'togglefullscreen', label: 'تمام‌صفحه' },
        { type: 'separator' },
        { role: 'zoomIn', label: 'بزرگ‌نمایی' },
        { role: 'zoomOut', label: 'کوچک‌نمایی' },
        { role: 'resetZoom', label: 'بازنشانی' },
      ],
    },
  ]

  if (isDev) {
    menuTemplate.push({
      label: 'توسعه',
      submenu: [
        { role: 'toggleDevTools', label: 'DevTools' },
        { role: 'reload', label: 'بارگذاری مجدد' },
        { type: 'separator' },
        { role: 'forceReload', label: 'بارگذاری مجدد (اجباری)' },
      ],
    })
  }

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  if (isDev) {
    // در حالت توسعه، از سرور Vite استفاده کن
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // در حالت build شده، فایل dist/index.html رو باز کن
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

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
