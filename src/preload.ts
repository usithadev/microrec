import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getSources: () => ipcRenderer.invoke('get-sources'),
  saveDialog: () => ipcRenderer.invoke('showSaveDialog'),
  writef: (path: string, data: ArrayBuffer) => ipcRenderer.invoke('saveFile', path, data),
});
