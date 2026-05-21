"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabledState] = useState(true);
  const [micEnabled, setMicEnabledState] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const requestMedia = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("This browser does not expose camera or microphone access.");
      return;
    }

    setRequesting(true);
    setPermissionError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = cameraEnabled;
      });
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = micEnabled;
      });
    } catch {
      setPermissionError("Camera or microphone permission was denied. You can still use the room with placeholders.");
    } finally {
      setRequesting(false);
    }
  }, [cameraEnabled, micEnabled]);

  const setCameraEnabled = useCallback((enabled: boolean) => {
    setCameraEnabledState(enabled);
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }, []);

  const setMicEnabled = useCallback((enabled: boolean) => {
    setMicEnabledState(enabled);
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { stream, cameraEnabled, micEnabled, permissionError, requesting, requestMedia, setCameraEnabled, setMicEnabled };
}
