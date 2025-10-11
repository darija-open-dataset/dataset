import React, { useState } from 'react';
import { Play, Pause, User, Clock } from 'lucide-react';

function RecordingsList({ recordings, currentUserId }) {
  const [playingId, setPlayingId] = useState(null);
  const [audioElements, setAudioElements] = useState({});

  const handlePlayRecording = async (recording) => {
    if (playingId === recording.id) {
      // Pause current
      const audio = audioElements[recording.id];
      if (audio) {
        audio.pause();
        setPlayingId(null);
      }
      return;
    }

    // Stop any currently playing
    if (playingId && audioElements[playingId]) {
      audioElements[playingId].pause();
    }

    // Load and play
    try {
      const audioData = await window.electronAPI.getAudioFile(recording.path);
      
      const audio = new Audio(audioData);
      audio.onended = () => setPlayingId(null);
      
      setAudioElements(prev => ({ ...prev, [recording.id]: audio }));
      await audio.play();
      setPlayingId(recording.id);
    } catch (error) {
      console.error('Failed to play recording:', error);
      alert('Failed to play recording');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-400" />
        Existing Recordings ({recordings.length})
      </h3>

      <div className="space-y-2">
        {recordings.map((recording) => {
          const isCurrentUser = recording.userId === currentUserId;
          const isPlaying = playingId === recording.id;

          return (
            <div
              key={recording.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isCurrentUser 
                  ? 'bg-blue-900/20 border border-blue-700' 
                  : 'bg-gray-700/50 border border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlayRecording(recording)}
                  className={`p-2 rounded-full transition-colors ${
                    isPlaying
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isCurrentUser ? 'text-blue-400' : 'text-gray-300'}`}>
                      {isCurrentUser ? 'You' : `User ${recording.userId}`}
                    </span>
                    {recording.duration && (
                      <span className="text-xs text-gray-400">
                        ({formatDuration(recording.duration)})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDate(recording.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecordingsList;
