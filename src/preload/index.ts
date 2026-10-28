// 把固定的一组函数暴露给界面（window.api）。界面拿不到 ipcRenderer 本身。
import { contextBridge, ipcRenderer } from 'electron'
import type { Api } from '../shared/types'

const api: Api = {
  ping: () => ipcRenderer.invoke('ping'),
  selfTest: () => ipcRenderer.invoke('selfTest'),
}

contextBridge.exposeInMainWorld('api', api)
