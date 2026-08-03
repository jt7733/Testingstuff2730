'use strict';

window.JVS_AUDIO = (() => {
  let stream = null;
  let context = null;
  let analyser = null;
  let source = null;
  let meterFrame = 0;
  let recorder = null;
  let chunks = [];
  let currentBlob = null;
  let currentUrl = null;
  let pitchSamples = [];
  let rmsSamples = [];
  let peakSamples = [];
  let recordingStart = 0;
  let selectedDeviceId = '';
  let englishVoice = null;

  const voicePriority = ['en-AU','en-GB','en-US','en-NZ','en-CA','en'];

  function pickEnglishVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = speechSynthesis.getVoices();
    for (const prefix of voicePriority) {
      const match = voices.find(v => (v.lang || '').toLowerCase().startsWith(prefix.toLowerCase()));
      if (match) { englishVoice = match; return match; }
    }
    englishVoice = voices.find(v => /^en/i.test(v.lang || '')) || null;
    return englishVoice;
  }

  function initVoices() {
    pickEnglishVoice();
    if ('speechSynthesis' in window) speechSynthesis.addEventListener?.('voiceschanged', pickEnglishVoice);
  }

  function speak(text, options={}) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window) || !text) { resolve(false); return; }
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = englishVoice || pickEnglishVoice();
      utterance.lang = voice?.lang || 'en-AU';
      if (voice) utterance.voice = voice;
      utterance.rate = options.rate || 0.92;
      utterance.pitch = options.pitch || 1;
      utterance.volume = 1;
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);
      speechSynthesis.speak(utterance);
    });
  }

  function stopSpeech() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  async function getStream(deviceId=selectedDeviceId) {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('secure-context');
    }
    if (stream) {
      const activeId = stream.getAudioTracks()[0]?.getSettings?.().deviceId;
      if (!deviceId || deviceId === activeId) return stream;
      stopStream();
    }
    const audio = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
      channelCount: 1
    };
    if (deviceId) audio.deviceId = { exact: deviceId };
    stream = await navigator.mediaDevices.getUserMedia({ audio });
    selectedDeviceId = deviceId || stream.getAudioTracks()[0]?.getSettings?.().deviceId || '';
    return stream;
  }

  function stopStream() {
    cancelAnimationFrame(meterFrame);
    meterFrame = 0;
    if (source) { try { source.disconnect(); } catch {} source = null; }
    if (context) { try { context.close(); } catch {} context = null; }
    analyser = null;
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  async function enumerateInputs() {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === 'audioinput');
  }

  async function setupAnalyser(deviceId=selectedDeviceId) {
    const mediaStream = await getStream(deviceId);
    if (!context || context.state === 'closed') context = new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') await context.resume();
    if (source) { try { source.disconnect(); } catch {} }
    source = context.createMediaStreamSource(mediaStream);
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.25;
    source.connect(analyser);
    return analyser;
  }

  function readFrame() {
    if (!analyser || !context) return { rms:0, peak:0, pitch:null, clarity:0 };
    const data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);
    let sum = 0, peak = 0;
    for (const value of data) { sum += value*value; peak = Math.max(peak, Math.abs(value)); }
    const rms = Math.sqrt(sum/data.length);
    const pitch = autoCorrelate(data, context.sampleRate);
    return { rms, peak, pitch };
  }

  function autoCorrelate(buffer, sampleRate) {
    let rms = 0;
    for (const value of buffer) rms += value*value;
    rms = Math.sqrt(rms/buffer.length);
    if (rms < 0.012) return null;
    let start = 0, end = buffer.length - 1;
    const threshold = 0.2;
    for (let i=0;i<buffer.length/2;i++) { if (Math.abs(buffer[i]) < threshold) { start=i; break; } }
    for (let i=1;i<buffer.length/2;i++) { if (Math.abs(buffer[buffer.length-i]) < threshold) { end=buffer.length-i; break; } }
    const sliced = buffer.slice(start,end);
    const correlations = new Array(sliced.length).fill(0);
    for (let lag=0;lag<sliced.length;lag++) {
      let c=0;
      for (let i=0;i<sliced.length-lag;i++) c += sliced[i]*sliced[i+lag];
      correlations[lag]=c;
    }
    let dip=0;
    while (dip+1<correlations.length && correlations[dip] > correlations[dip+1]) dip++;
    let max=-Infinity, pos=-1;
    for (let i=dip;i<correlations.length;i++) if(correlations[i]>max){max=correlations[i];pos=i;}
    if (pos <= 0) return null;
    let T0=pos;
    const x1=correlations[T0-1]||0,x2=correlations[T0]||0,x3=correlations[T0+1]||0;
    const a=(x1+x3-2*x2)/2,b=(x3-x1)/2;
    if(a) T0 -= b/(2*a);
    const hz=sampleRate/T0;
    return hz>=60 && hz<=500 ? hz : null;
  }

  function startMeter(callback) {
    cancelAnimationFrame(meterFrame);
    const loop = () => { callback(readFrame()); meterFrame=requestAnimationFrame(loop); };
    loop();
  }

  function stopMeter() { cancelAnimationFrame(meterFrame); meterFrame=0; }

  function bestMimeType() {
    if (!window.MediaRecorder) return '';
    const types=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg;codecs=opus'];
    return types.find(t=>MediaRecorder.isTypeSupported?.(t)) || '';
  }

  async function startRecording(deviceId=selectedDeviceId, onLevel=()=>{}) {
    if (!window.MediaRecorder) throw new Error('recorder-unsupported');
    await setupAnalyser(deviceId);
    chunks=[];pitchSamples=[];rmsSamples=[];peakSamples=[];currentBlob=null;
    const mime=bestMimeType();
    recorder = mime ? new MediaRecorder(stream,{mimeType:mime}) : new MediaRecorder(stream);
    recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
    recordingStart=performance.now();
    recorder.start(100);
    startMeter(frame=>{
      if(frame.rms>0.008){rmsSamples.push(frame.rms);peakSamples.push(frame.peak);if(frame.pitch)pitchSamples.push(frame.pitch)}
      onLevel(frame);
    });
  }

  function stopRecording() {
    return new Promise((resolve,reject)=>{
      if(!recorder || recorder.state!=='recording'){reject(new Error('not-recording'));return;}
      recorder.onstop=()=>{
        stopMeter();
        const type=recorder.mimeType||'audio/webm';
        currentBlob=new Blob(chunks,{type});
        if(currentUrl)URL.revokeObjectURL(currentUrl);
        currentUrl=URL.createObjectURL(currentBlob);
        const duration=(performance.now()-recordingStart)/1000;
        const metrics=analyseMetrics(duration);
        resolve({blob:currentBlob,url:currentUrl,metrics,type});
      };
      recorder.stop();
    });
  }

  function isRecording(){return recorder?.state==='recording'};

  function median(values){if(!values.length)return null;const s=[...values].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2}
  function mean(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:null}
  function stdev(values){if(values.length<2)return null;const m=mean(values);return Math.sqrt(mean(values.map(v=>(v-m)**2)))}

  function analyseMetrics(duration) {
    const medPitch=median(pitchSamples);
    const sd=stdev(pitchSamples);
    const stability=medPitch&&sd!=null?Math.max(0,100-(sd/medPitch)*220):null;
    const averageRms=mean(rmsSamples);
    const peak=Math.max(0,...peakSamples);
    const third=Math.max(1,Math.floor(rmsSamples.length/3));
    const startLevel=mean(rmsSamples.slice(0,third));
    const endLevel=mean(rmsSamples.slice(-third));
    const endingRatio=startLevel&&endLevel?endLevel/startLevel:null;
    return { duration, medianPitch:medPitch, stability, averageRms, peak, endingRatio };
  }

  async function runMicCheck(deviceId, onProgress=()=>{}, onLevel=()=>{}) {
    await setupAnalyser(deviceId);
    const sample = (ms,label) => new Promise(resolve=>{
      const values=[];const peaks=[];const start=performance.now();onProgress(label);
      const loop=now=>{const f=readFrame();values.push(f.rms);peaks.push(f.peak);onLevel(f);if(now-start<ms)requestAnimationFrame(loop);else resolve({values,peaks})};requestAnimationFrame(loop);
    });
    const quiet=await sample(2200,'Stay quiet while I listen to the room…');
    const speech=await sample(3500,'Say: “Hi, this is my comfortable speaking voice.”');
    const noise=median(quiet.values)||0;
    const sorted=[...speech.values].sort((a,b)=>a-b);
    const speechLevel=sorted[Math.floor(sorted.length*.8)]||0;
    const peak=Math.max(...speech.peaks,0);
    const snr=noise>0?speechLevel/noise:99;
    const recommendations=[];
    if(noise>.025)recommendations.push('Reduce nearby background noise or move away from a fan, television or rubbing cable.');
    if(speechLevel<Math.max(.032,noise*3))recommendations.push('Move the microphone slightly closer. Keep speaking normally—do not shout.');
    if(peak>.92)recommendations.push('Move the microphone slightly farther away because the signal is clipping.');
    if(snr<2.8)recommendations.push('The room noise is close to your speech level. A quieter position will improve feedback.');
    if(!recommendations.length)recommendations.push('Keep this microphone position. Your ordinary speech level is clear.');
    return {noise,speechLevel,peak,snr,recommendations};
  }

  initVoices();
  return { speak, stopSpeech, getStream, stopStream, enumerateInputs, startMeter, stopMeter, readFrame, startRecording, stopRecording, isRecording, runMicCheck, get currentBlob(){return currentBlob}, get currentUrl(){return currentUrl}, setDevice(id){selectedDeviceId=id||'';} };
})();
