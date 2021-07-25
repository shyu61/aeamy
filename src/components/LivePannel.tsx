import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Connection from '@open-ayame/ayame-web-sdk/dist/connection';
import { IconButton } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

type Props = {
  pc: Connection | null,
  setPc: React.Dispatch<React.SetStateAction<Connection | null>>,
  micEnabled: boolean,
  handleOnChangeMic: () => void,
  cameraEnabled: boolean,
  handleOnChangeCamera: () => void,
  localStream: MediaStream | null,
  setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>,
  setOpenLivePannel: React.Dispatch<React.SetStateAction<boolean>>,
}

export const LivePannel = ({
  pc,
  setPc,
  micEnabled,
  handleOnChangeMic,
  cameraEnabled,
  handleOnChangeCamera,
  localStream,
  setLocalStream,
  setOpenLivePannel,
}: Props) => {
  const localElem = useRef<HTMLVideoElement>(null);
  const remoteElem = useRef<HTMLVideoElement>(null);

  const connectStream = useCallback(async () => {
    if (pc === null) return;
    await pc.connect(localStream);

    const { current } = localElem;
    if (current !== null) {
      current.srcObject = localStream;
    }
  }, [localStream, pc]);

  const callbacks = useCallback(() => {
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
  }, [pc]);

  const endLive = useCallback(async () => {
    if (pc === null) return;
    await pc.disconnect();
    if (localStream !== null) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setOpenLivePannel(false);
  }, [localStream, pc, setLocalStream, setOpenLivePannel]);

  const handleOnEndLive = useCallback(() => {
    endLive();
  }, [endLive]);

  useEffect(() => {
    connectStream();
    callbacks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledContainer>
      <StyledVideoContainer>
        <StyledVideo ref={localElem} autoPlay playsInline></StyledVideo>
        <StyledVideo ref={remoteElem} muted autoPlay playsInline></StyledVideo>
      </StyledVideoContainer>
      <StyledMenu>
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
