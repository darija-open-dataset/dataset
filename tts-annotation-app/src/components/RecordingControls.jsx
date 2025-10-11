import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Save, X, AlertCircle, Headphones } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

function RecordingControls({ userId, onRecordingSaved }) {
  const [status, setStatus] = useState('idle'); // idle, recording, recorded, saving
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const durationTimerRef = useRef(null);

  const { 
    startRecording, 
    stopRecording, 
    audioBlob, 
    isRecording, 
    permissionError,
    audioDevices,
    selectedDeviceId,
    setSelectedDeviceId
  } = useAudioRecorder();

  useEffect(() => {
    if (audioBlob) {
      setRecordedBlob(audioBlob);
      setStatus('recorded');
    }
  }, [audioBlob]);

  useEffect(() => {
    if (permissionError) {
      setError(permissionError);
    }
  }, [permissionError]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'idle') {
          handleStartRecording();
        } else if (status === 'recording') {
          handleStopRecording();
        }
      } else if (e.key === 'Enter' && status === 'recorded') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape' && (status === 'recording' || status === 'recorded')) {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  const handleStartRecording = async () => {
    setError(null);
    setDuration(0);
    
    const success = await startRecording();
    if (success) {
      setStatus('recording');
      
      // Start duration timer
      const startTime = Date.now();
      durationTimerRef.current = setInterval(() => {
        setDuration((Date.now() - startTime) / 1000);
      }, 100);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
  };

  const handlePlayRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleSave = async () => {
    if (!recordedBlob) return;

    setStatus('saving');
    
    const reader = new FileReader();
    reader.readAsDataURL(recordedBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result;
      const success = await onRecordingSaved(base64Audio, duration);
      
      if (success) {
        setStatus('idle');
        setRecordedBlob(null);
        setDuration(0);
      } else {
        setStatus('recorded');
      }
    };
  };

  const handleCancel = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    
    if (isRecording) {
      stopRecording();
    }
    
    setStatus('idle');
    setRecordedBlob(null);
    setDuration(0);
    setError(null);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Microphone Access Error</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Microphone Selector */}
      {audioDevices.length > 0 && status === 'idle' && (
        <div className="mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <Headphones className="w-4 h-4" />
            <span>Microphone:</span>
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default Microphone</option>
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {status === 'idle' && (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <Mic className="w-5 h-5" />
              Start Recording (Space)
            </button>
          )}

          {status === 'recording' && (
            <>
              <button
                onClick={handleStopRecording}
                className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium animate-pulse"
              >
                <Square className="w-5 h-5" />
                Stop Recording (Space)
              </button>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xl font-mono">{formatDuration(duration)}</span>
              </div>
            </>
          )}

          {status === 'recorded' && (
            <>
              <button
                onClick={handlePlayRecording}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <Play className="w-5 h-5" />
                Play Recording
              </button>
              <span className="text-gray-400 font-mono">{formatDuration(duration)}</span>
            </>
          )}

          {status === 'saving' && (
            <div className="flex items-center gap-3 text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>Saving recording...</span>
            </div>
          )}
        </div>

        {(status === 'recorded' || status === 'recording') && (
          <div className="flex items-center gap-2">
            {status === 'recorded' && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save (Enter)
              </button>
            )}
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel (Esc)
            </button>
          </div>
        )}
      </div>

      {recordedBlob && (
        <audio ref={audioRef} src={URL.createObjectURL(recordedBlob)} className="hidden" />
      )}
    </div>
  );
}

export default RecordingControls;
