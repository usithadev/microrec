import './index.css';
// import { Buffer } from "buffer";
// import fixWebmDuration from 'webm-duration-fix';



let sources:any;
let path:any | String;

document.addEventListener("DOMContentLoaded", async () => {
  sources = await (window as any).electronAPI.getSources();
});

let video = document.getElementById("video") as HTMLVideoElement;

let startBtn = document.getElementById("startBtn") as HTMLButtonElement;
let stopBtn = document.getElementById("stopBtn") as HTMLButtonElement;

startBtn.addEventListener("click", async () => {
  const {canceled, filePath} = await (window as any).electronAPI.saveDialog();
  if (canceled) return;
  
  await (window as any).electronAPI.startWriteStream(filePath);
  path = filePath;
  startRecording();
});


stopBtn.addEventListener("click", async () => {
  mediaRecorder.stop();
  await (window as any).electronAPI.stopWriteStream();
  stopVideo();
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

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm; codecs=vp9'
  });

  mediaRecorder.ondataavailable = async(e) => {
    const arrayBuffer = await e.data.arrayBuffer();
    (window as any).electronAPI.streamChunk(arrayBuffer);
  }

  mediaRecorder.start(1000);
}

async function stopVideo() {
  video.srcObject = null;
  await (window as any).electronAPI.remux(path);
  path = null;

  

  // const blob = await fixWebmDuration(new Blob(chunks, {
  //   type: 'video/webm; codecs=vp9'
  // }));

  // const buffer = Buffer.from(await blob.arrayBuffer());
  // chunks = [];

  // const { canceled, filePath } = await (window as any).electronAPI.saveDialog();
  // if (canceled) return;

  // await (window as any).electronAPI.writef(filePath, buffer);
}
