import path from 'path';
import { execFile } from 'child_process';
import fs from 'fs/promises'; 
import {app} from "electron";

const ffmpegPath = app.isPackaged ? path.join(process.resourcesPath, 'ffmpeg.exe') : path.join(__dirname, '../../assets', 'ffmpeg.exe');

async function remuxAndOverwrite(inputPath: string): Promise<void> {
  const tempPath = inputPath + '.temp.webm'; 

  return new Promise((resolve, reject) => {
    execFile(ffmpegPath, [
      '-i', inputPath,
      '-c', 'copy',
      '-movflags', 'faststart',
      tempPath
    ], async (error, stdout, stderr) => {
      if (error) {
        console.error('FFmpeg remuxing error:', stderr);
        reject(error);
      } else {
        try {
          await fs.rename(tempPath, inputPath); 
          console.log('Remuxed and replaced original file successfully!');
          resolve();
        } catch (fsError) {
          console.error('Failed to replace original file:', fsError);
          reject(fsError);
        }
      }
    });
  });
}

export default remuxAndOverwrite;