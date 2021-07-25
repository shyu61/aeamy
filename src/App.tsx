import React, { useEffect, useRef, useState } from 'react';
import * as Ayame from '@open-ayame/ayame-web-sdk';
import styled from 'styled-components';
import Connection from '@open-ayame/ayame-web-sdk/dist/connection';
import { IconButton } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

const RoomId = 'shyu61-no-heya';

function App() {
  const [pc, setPc] = useState<Connection | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [localStream, setLocalstream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const remoteElem = useRef<HTMLVideoElement>(null);
  const localElem = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const conn = Ayame.connection('wss://ayame-labo.shiguredo.jp/signaling', RoomId);
    setPc(conn);
  }, [setPc]);

  const startLive = async () => {
    if (pc === null) return;

    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    setLocalstream(mediaStream);
    console.log({ pc });
    await pc.connect(mediaStream);
    const { current } = localElem;
    if (current !== null) {
      current.srcObject = mediaStream;
    }
    callbacks();
  };

  const callbacks = () => {
    if (pc === null) return;
    pc.on('connect', (e: any) => console.info(e));
    pc.on('disconnect', (e: any) => console.error(e));
    pc.on('addstream', (e: { stream: MediaProvider | null }) => {
      const { current } = remoteElem;
      if (current !== null) {
        current.srcObject = e.stream;
      }
    });
    pc.on('removestream', (e: any) => console.error(e));
  }

  const endLive = async () => {
    if (pc === null) return;
    await pc.disconnect();
    if (localStream !== null) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  const handleOnStartLive = () => {
    startLive();
  }

  const handleOnEndLive = () => {
    endLive();
  };

  const handleOnChangeMic = () => {
    if (localStream === null) return;
    localStream.getAudioTracks()[0].enabled = !micEnabled;
    setMicEnabled(!micEnabled);
  };

  const handleOnChangeCamera = () => {
    if (localStream === null) return;
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    setCameraEnabled(!cameraEnabled);
  };

  return (
    <StyledContainer>
      <StyledVideoContainer>
        <StyledVideo ref={localElem} autoPlay playsInline></StyledVideo>
        <StyledVideo ref={remoteElem} muted autoPlay playsInline></StyledVideo>
      </StyledVideoContainer>
      <StyledMenu>
        <button onClick={handleOnStartLive}>接続する</button>
        <button onClick={handleOnEndLive}>切断する</button>
        <IconButton onClick={handleOnChangeMic}>
          {micEnabled ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
        <IconButton onClick={handleOnChangeCamera}>
          {cameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
      </StyledMenu>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  height: 100%;
  margin: 0 auto;
`;

const StyledVideoContainer = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
`;

const StyledVideo = styled.video`
  margin: 10px;
  width: 600px;
  height: 500px;
  border: 1px solid black;
`;

const StyledMenu = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`;

export default App;
