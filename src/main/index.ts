// 主进程：创建窗口、安全设置、注册界面可调用的接口。
// 以后还会在这里放：系统通知与提示音、网页型成员视图、任务状态。
import { app, BrowserWindow, ipcMain, session, shell } from 'electron'
import { join } from 'node:path'
import { runEncryptionSelfTest } from './db'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#1e1f22',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // 安全基线：界面代码碰不到 Node 和系统，只能用 preload 暴露的 window.api
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })

  win.once('ready-to-show', () => win.show())

  // 链接用系统浏览器打开，App 内不开新窗口
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  // 不允许页面跳转到别的地址（防止 AI 回复里的链接把界面换掉）
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== win.webContents.getURL()) event.preventDefault()
  })

  // 开发时加载 electron-vite 的开发服务器，打包后加载本地文件
  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (!app.isPackaged && devUrl) win.loadURL(devUrl)
  else win.loadFile(join(__dirname, '../renderer/index.html'))
}

// ---- 界面可调用的接口（与 shared/types.ts 的 Api 一一对应）----
ipcMain.handle('ping', () => 'pong')
ipcMain.handle('selfTest', () => runEncryptionSelfTest(app.getPath('temp')))

app.whenReady().then(() => {
  // 网页不能申请摄像头、麦克风、定位等权限
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) =>
    callback(false),
  )
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
