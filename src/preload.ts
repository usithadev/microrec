import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getSources: () => ipcRenderer.invoke('get-sources'),
  saveDialog: () => ipcRenderer.invoke('showSaveDialog'),
  startWriteStream: (path: string) => ipcRenderer.invoke('startWriteStream', path),
  stopWriteStream: () => ipcRenderer.invoke('stopWriteStream'),
  streamChunk: (data: ArrayBuffer) => ipcRenderer.invoke('streamChunk', data),
  remux: (path: string) => ipcRenderer.invoke('duration_fix', path)
});
