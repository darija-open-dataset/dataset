import { useState, useRef, useEffect } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('default');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Get available audio input devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputs);
      } catch (error) {
        console.error('Error getting audio devices:', error);
      }
    };

    getDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, []);

  const startRecording = async () => {
    try {
      setPermissionError(null);
      setAudioBlob(null);
      audioChunksRef.current = [];

      const constraints = { 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        } 
      };

      // Use selected device if not default
      if (selectedDeviceId && selectedDeviceId !== 'default') {
        constraints.audio.deviceId = { exact: selectedDeviceId };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setIsRecording(false);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      setPermissionError('Could not access microphone. Please ensure you have granted microphone permissions.');
      setIsRecording(false);
      return false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return {
    isRecording,
    audioBlob,
    permissionError,
    audioDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    startRecording,
    stopRecording,
  };
}
