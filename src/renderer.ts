import './index.css';
import { Buffer } from "buffer"

let sources:any;

document.addEventListener("DOMContentLoaded", async () => {
  sources = await (window as any).electronAPI.getSources();
});

let video = document.getElementById("video") as HTMLVideoElement;

let startBtn = document.getElementById("startBtn") as HTMLButtonElement;
let stopBtn = document.getElementById("stopBtn") as HTMLButtonElement;

startBtn.addEventListener("click", startRecording);
stopBtn.addEventListener("click", () => {
  mediaRecorder.stop();
});

let mediaRecorder:MediaRecorder;
let chunks:Blob[] = [];

async function startRecording() {

  const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      // @ts-ignore
      mandatory: {
        chromeMediaSource: 'desktop'
      }
    },
    video: {
      // @ts-ignore
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sources[0].id
      }
    }
  });

  video.srcObject = stream;
  video.muted = true;
  video.play();

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    chunks.push(event.data);
  };
  mediaRecorder.onstop = () => {
    stopRecording();
  }
  mediaRecorder.start();
}

async function stopRecording() {
  video.srcObject = null;

  const blob = new Blob(chunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());
  chunks = [];

  const { canceled, filePath } = await (window as any).electronAPI.saveDialog();
  if (canceled) return;

  await (window as any).electronAPI.writef(filePath, buffer);
}
