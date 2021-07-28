import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Ayame from '@open-ayame/ayame-web-sdk';
import styled from 'styled-components';
import Connection from '@open-ayame/ayame-web-sdk/dist/connection';
import { IconButton } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import { LivePannel } from '../components/LivePannel';

const ROOM_ID = 'shyu61-no-heya';
const SIGNALING_SERVER_ROOT_URL = 'ayame-server-u7gxmercbq-an.a.run.app';

export const LiveLaunch = () => {
  const [pc, setPc] = useState<Connection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [openLivePannel, setOpenLivePannel] = useState(false);

  const localElem = useRef<HTMLVideoElement>(null);

  const handleOnEnter = useCallback(() => {
    setOpenLivePannel(true);
    const { current } = localElem;
    if (current !== null) {
      current.srcObject = null;
    }
  }, [setOpenLivePannel]);

  const callbacks = useCallback(() => {
    if (pc === null) return;
    pc.on('connect', (e: any) => console.info(e));
    pc.on('disconnect', (e: any) => console.error(e));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMediaStream = useCallback(async (conn: Connection) => {
    if (conn === null) return;
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    setLocalStream(mediaStream);
    const { current } = localElem;
    if (current !== null) {
      current.srcObject = mediaStream;
    }
    callbacks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callbacks]);

  const handleOnChangeMic = useCallback(() => {
    if (localStream === null) return;
    localStream.getAudioTracks()[0].enabled = !micEnabled;
    setMicEnabled(!micEnabled);
  }, [localStream, micEnabled]);

  const handleOnChangeCamera = useCallback(() => {
    if (localStream === null) return;
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    setCameraEnabled(!cameraEnabled);
  }, [localStream, cameraEnabled]);

  useEffect(() => {
    const conn = Ayame.connection(`wss://${SIGNALING_SERVER_ROOT_URL}/signaling`, ROOM_ID);
    setPc(conn);
    // pcだと更新が間に合わないことがあるためconnを使う
    setMediaStream(conn);
  }, [setMediaStream]);

  return (
    <StyledContainer>
      {openLivePannel ? (
        <LivePannel
          pc={pc}
          setPc={setPc}
          micEnabled={micEnabled}
          handleOnChangeMic={handleOnChangeMic}
          cameraEnabled={cameraEnabled}
          handleOnChangeCamera={handleOnChangeCamera}
          localStream={localStream}
          setLocalStream={setLocalStream}
          setOpenLivePannel={setOpenLivePannel}
        />
      ) : (
        <>
          <StyledVideo ref={localElem} autoPlay playsInline></StyledVideo>
          <button onClick={handleOnEnter}>入室する</button>
          <IconButton onClick={handleOnChangeMic}>
            {micEnabled ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
          <IconButton onClick={handleOnChangeCamera}>
            {cameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </>
      )}
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  height: 100%;
  margin: 0 auto;
`;

const StyledVideo = styled.video`
  margin: 10px;
  width: 600px;
  height: 500px;
  border: 1px solid black;
`;
