import React, { useState, useEffect } from 'react';
import SentenceDisplay from './SentenceDisplay';
import RecordingControls from './RecordingControls';
import Navigation from './Navigation';
import RecordingsList from './RecordingsList';
import Header from './Header';

function AnnotationWorkspace({ 
  userId, 
  userProfile,
  selectedFile, 
  sentences, 
  recordingsMap, 
  onBackToFileSelection,
  onUpdateRecordingsMap 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    loadRecordingsForCurrentSentence();
  }, [currentIndex, recordingsMap]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'ArrowRight' || e.key === 'n') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'p') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, sentences.length]);

  const loadRecordingsForCurrentSentence = () => {
    if (!recordingsMap || sentences.length === 0) {
      setRecordings([]);
      return;
    }

    const sentence = sentences[currentIndex];
    const fileRecordings = recordingsMap.recordings[selectedFile.relativePath];
    
    if (fileRecordings && fileRecordings[sentence.lineNumber]) {
      const sentenceData = fileRecordings[sentence.lineNumber];
      setRecordings(sentenceData.recordings || []);
    } else {
      setRecordings([]);
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleJumpToLine = (lineNumber) => {
    const index = sentences.findIndex(s => s.lineNumber === lineNumber);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  const handleRecordingSaved = async (audioBlob, duration) => {
    const sentence = sentences[currentIndex];
    
    try {
      // Save audio file with metadata
      const audioPath = await window.electronAPI.saveAudio({
        audioBlob,
        relativeCsvPath: selectedFile.relativePath,
        lineNumber: sentence.lineNumber,
        userId,
        sentenceData: {
          darija: sentence.darija,
          darijaAr: sentence.darijaAr,
          english: sentence.english
        },
        userProfile: userProfile
      });

      // Update recordings map
      const newMap = { ...recordingsMap };
      
      if (!newMap.recordings[selectedFile.relativePath]) {
        newMap.recordings[selectedFile.relativePath] = {};
      }
      
      if (!newMap.recordings[selectedFile.relativePath][sentence.lineNumber]) {
        newMap.recordings[selectedFile.relativePath][sentence.lineNumber] = {
          darija: sentence.darija,
          darijaAr: sentence.darijaAr,
          recordings: []
        };
      }

      const newRecording = {
        id: `rec_${Date.now()}`,
        userId,
        timestamp: new Date().toISOString(),
        path: audioPath,
        duration,
        annotator: userProfile ? {
          gender: userProfile.gender,
          ageRange: userProfile.ageRange,
          region: userProfile.region,
          nativeRegion: userProfile.nativeRegion,
          dialect: userProfile.dialect,
        } : null,
      };

      newMap.recordings[selectedFile.relativePath][sentence.lineNumber].recordings.push(newRecording);

      // Save to file
      await window.electronAPI.saveRecordingsMap(newMap);
      
      // Update state
      onUpdateRecordingsMap(newMap);

      return true;
    } catch (error) {
      console.error('Failed to save recording:', error);
      alert('Failed to save recording. Please try again.');
      return false;
    }
  };

  const getAnnotationStats = () => {
    if (!recordingsMap || !recordingsMap.recordings[selectedFile.relativePath]) {
      return { total: sentences.length, annotated: 0, byUser: 0 };
    }

    const fileRecordings = recordingsMap.recordings[selectedFile.relativePath];
    const lineNumbers = Object.keys(fileRecordings);
    
    let annotatedCount = 0;
    let byUserCount = 0;

    sentences.forEach(sentence => {
      const sentenceRecordings = fileRecordings[sentence.lineNumber];
      if (sentenceRecordings && sentenceRecordings.recordings.length > 0) {
        annotatedCount++;
        if (sentenceRecordings.recordings.some(r => r.userId === userId)) {
          byUserCount++;
        }
      }
    });

    return { total: sentences.length, annotated: annotatedCount, byUser: byUserCount };
  };

  if (sentences.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <Header
          fileName={selectedFile.relativePath}
          stats={{ total: 0, annotated: 0, byUser: 0 }}
          onBack={onBackToFileSelection}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-400 text-lg mb-2">No sentences found in this file</p>
            <p className="text-gray-500 text-sm">The CSV file appears to be empty or could not be parsed.</p>
            <button
              onClick={onBackToFileSelection}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              ← Back to File Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSentence = sentences[currentIndex];
  const stats = getAnnotationStats();

  return (
    <div className="flex flex-col h-screen">
      <Header
        fileName={selectedFile.relativePath}
        stats={stats}
        onBack={onBackToFileSelection}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            <SentenceDisplay sentence={currentSentence} />
            
            <RecordingControls
              userId={userId}
              onRecordingSaved={handleRecordingSaved}
            />

            {recordings.length > 0 && (
              <RecordingsList 
                recordings={recordings} 
                currentUserId={userId}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <Navigation
            sentences={sentences}
            currentIndex={currentIndex}
            recordingsMap={recordingsMap}
            selectedFile={selectedFile}
            currentUserId={userId}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onJumpToLine={handleJumpToLine}
          />
        </div>
      </div>
    </div>
  );
}

export default AnnotationWorkspace;
