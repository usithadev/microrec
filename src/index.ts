import { app, BrowserWindow, dialog, desktopCapturer, ipcMain } from 'electron';
import {writeFile, WriteStream, createWriteStream} from "fs";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let writeStream : WriteStream | null = null;


if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {

  const mainWindow = new BrowserWindow({
    height: 900,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: true,
    }
  });

  mainWindow.setMenu(null);

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.on('ready', createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



ipcMain.handle('get-sources', async () => {
  const sources = await desktopCapturer.getSources({ types: ['screen'] })
  return sources;
});

ipcMain.handle('showSaveDialog', async () => {
  return await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.webm`,
    filters: [
      { name: 'WebM Video', extensions: ['webm'] }
    ]
  });
});

ipcMain.handle('saveFile', async (_event, filePath: string, arrayBuffer: ArrayBuffer) => {
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<void>((resolve, reject) => {
    writeFile(filePath, buffer, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

// ipcMain.handle('startWriteStream', async (_event, filePath: string) => {
//   writeStream = createWriteStream(filePath);
// });

// ipcMain.handle('streamChunk', async (_event, arrayBuffer: ArrayBuffer) => {
//   const buffer = Buffer.from(arrayBuffer);
//   writeStream?.write(buffer);
// });

// ipcMain.handle('stopWriteStream', async () => {
//   writeStream?.close();
//   writeStream = null;
// });


ipcMain.handle('startWriteStream', async (_event, filePath: string) => {
  writeStream = createWriteStream(filePath);
});

ipcMain.handle('streamChunk', (_event, arrayBuffer: ArrayBuffer) => {
  if (writeStream) {
    const buffer = Buffer.from(arrayBuffer);
    writeStream.write(buffer);
  }
});

ipcMain.handle('stopWriteStream', async () => {
  if (writeStream) {
    await new Promise((resolve) => {
      writeStream!.end(resolve);
    });
    writeStream = null;
  }
});
