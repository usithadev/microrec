import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'child_process';

const fixDuration = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tempPath = filePath + '.temp.webm';

    const ffmpegProcess = spawn(ffmpeg.path, [
      '-i', filePath,
      '-c', 'copy',
      '-y', // this is the magic overwrite flag ✨
      tempPath
    ]);

    ffmpegProcess.stderr.on('data', (data) => {
      console.log(`ffmpeg: ${data}`);
    });

    ffmpegProcess.on('exit', (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg exited with code ${code}`));

      // 🧼 Replace the original with the fixed version
      const fs = require('fs');
      fs.rename(tempPath, filePath, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

export default fixDuration;