import { useEffect, useState } from 'react'
import './App.css'
import { useRef } from 'react';

function App() {

const videoElement = useRef()
const audioInputSelect = useRef()
const audioOutputSelect = useRef()
const videoSelect = useRef()

const [microSelect, setMicroSelect] = useState("");
const [outputSelect, setOutputSelect] = useState("");
const [videoInputSelect, setVideoInputSelect] = useState("");

const [audioInput, setAudioInput] = useState([]);
const [audioOutput, setAudioOutput] = useState([]);
const [videoInput, setVideoInput] = useState([]);

audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);

useEffect(() => {
  async function fetchData() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    setAudioInput(devices.filter((device) => device.kind === "audioinput"))
    setAudioOutput(devices.filter((device) => device.kind === "audiooutput"))
    setVideoInput(devices.filter((device) => device.kind === "videoinput"))
  }
  fetchData();
},[])

function gotDevices(deviceInfos) {
  setAudioInput(deviceInfos.filter((device) => device.kind === "audioinput"))
  setAudioOutput(deviceInfos.filter((device) => device.kind === "audiooutput"))
  setVideoInput(deviceInfos.filter((device) => device.kind === "videoinput"))
}

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
        .then(() => {
          console.log(`Success, audio output device attached: ${sinkId}`);
        })
        .catch(error => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
          console.error(errorMessage);
          // Jump back to first output device in the list as it's the default.
          audioOutputSelect.selectedIndex = 0;
        });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

function changeAudioDestination(e) {
  setOutputSelect(e.target.value)
  const audioDestination = audioOutputSelect.current.value;
  attachSinkId(videoElement.current, audioDestination);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.current.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

async function start(e) {
  setMicroSelect(e.target.value)
  setVideoInputSelect(e.target.value)

  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioInputSelect.current.value;
  const videoSource = videoSelect.current.value;

  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
 
  navigator.mediaDevices.getUserMedia(constraints)
  .then(gotStream)
  .then(gotDevices)
  .catch(handleError);
}

return (
<div className="App">
<div id="container">

<div className="select">
   <label htmlFor="audioSource">Audio input source: </label>
  <select
  ref={audioInputSelect}
  id="audioSource"
  value={microSelect}
  onChange={start}
  >
  {audioInput.map(o => (
    <option key={o.value} value={o.deviceId}>{o.label}</option>
  ))}
</select>
</div>

<div className="select">
   <label htmlFor="audioOutput">Audio output destination: </label>
  <select
  ref={audioOutputSelect} 
  id="audioOutput"
  value={outputSelect}
  onChange={changeAudioDestination}
  >
  {audioOutput.map(o => (
    <option key={o.value} value={o.deviceId}>{o.label}</option>
  ))}
</select>
</div>

<div className="select">
   <label htmlFor="videoSource">Video source: </label>
  <select
  ref={videoSelect} 
  id="videoSource"
  value={videoInputSelect}
  onChange={start}
  >
  {videoInput.map(o => (
    <option key={o.value} value={o.deviceId}>{o.label}</option>
  ))}
</select>
</div>

<video id="video"  ref={videoElement} playsInline autoPlay></video>

</div>
    </div>
  )
}

export default App
