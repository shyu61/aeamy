import React, { useRef } from 'react';
import './App.css';
import * as Ayame from '@open-ayame/ayame-web-sdk';

const RoomId = 'shyu61-no-heya';

function App() {
  const elm1 = useRef<HTMLVideoElement>(null);
  const elm2 = useRef<HTMLVideoElement>(null);

  const conn = Ayame.connection('wss://ayame-labo.shiguredo.jp/signaling', RoomId);
  const startConn = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    await conn.connect(mediaStream);
    conn.on('disconnect', (e: any) => console.log(e));
    conn.on('addstream', (e: { stream: MediaProvider | null; }) => {
      const { current } = elm1;
      if (current !== null) {
        current.srcObject = e.stream;
      }
    });
    const { current } = elm2;
    if (current !== null) {
      current.srcObject = mediaStream;
    }
  };
  startConn();

  return (
    <div className="App">
      <h2>Hello, world</h2>
      <div style={{ float: "left" }}>
        <video ref={elm1} muted autoPlay playsInline style={{ width: "400px", height: "300px", border: "1px solid black" }}></video>
      </div>
      <div style={{ float: "left", marginLeft: "20px" }}>
        <video ref={elm2} autoPlay playsInline style={{ width: "400px", height: "300px", border: "1px solid black" }}></video>
      </div>
    </div>
  );
}

export default App;
