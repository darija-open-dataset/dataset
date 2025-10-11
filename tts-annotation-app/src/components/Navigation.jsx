import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, CheckCircle, Circle, User as UserIcon } from 'lucide-react';

function Navigation({ 
  sentences, 
  currentIndex, 
  recordingsMap, 
  selectedFile, 
  currentUserId,
  onNext, 
  onPrevious, 
  onJumpToLine 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, withAudio, withoutAudio, byMe

  const getSentenceStatus = (sentence) => {
    if (!recordingsMap || !recordingsMap.recordings[selectedFile.relativePath]) {
      return { hasAudio: false, recordedByUser: false, count: 0 };
    }

    const fileRecordings = recordingsMap.recordings[selectedFile.relativePath];
    const sentenceData = fileRecordings[sentence.lineNumber];

    if (!sentenceData || !sentenceData.recordings || sentenceData.recordings.length === 0) {
      return { hasAudio: false, recordedByUser: false, count: 0 };
    }

    const recordedByUser = sentenceData.recordings.some(r => r.userId === currentUserId);
    return { 
      hasAudio: true, 
      recordedByUser, 
      count: sentenceData.recordings.length 
    };
  };

  const filteredSentences = sentences.filter(sentence => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesDarija = sentence.darija.toLowerCase().includes(search);
      const matchesDarijaAr = sentence.darijaAr.includes(searchTerm);
      const matchesEnglish = sentence.english.toLowerCase().includes(search);
      const matchesLineNumber = sentence.lineNumber.toString().includes(searchTerm);
      
      if (!matchesDarija && !matchesDarijaAr && !matchesEnglish && !matchesLineNumber) {
        return false;
      }
    }

    // Status filter
    if (filterMode !== 'all') {
      const status = getSentenceStatus(sentence);
      
      if (filterMode === 'withAudio' && !status.hasAudio) return false;
      if (filterMode === 'withoutAudio' && status.hasAudio) return false;
      if (filterMode === 'byMe' && !status.recordedByUser) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Navigation Buttons */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex gap-2 mb-4">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === sentences.length - 1}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center text-sm text-gray-400">
          Sentence {currentIndex + 1} of {sentences.length}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sentences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              filterMode === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('withAudio')}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              filterMode === 'withAudio' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            With Audio
          </button>
          <button
            onClick={() => setFilterMode('withoutAudio')}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              filterMode === 'withoutAudio' 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            No Audio
          </button>
          <button
            onClick={() => setFilterMode('byMe')}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              filterMode === 'byMe' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            By Me
          </button>
        </div>
      </div>

      {/* Sentences List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSentences.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No sentences match your filters
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredSentences.map((sentence, idx) => {
              const status = getSentenceStatus(sentence);
              const actualIndex = sentences.indexOf(sentence);
              const isCurrent = actualIndex === currentIndex;

              return (
                <button
                  key={sentence.lineNumber}
                  onClick={() => onJumpToLine(sentence.lineNumber)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : status.recordedByUser
                      ? 'bg-purple-900/30 hover:bg-purple-900/50 text-white'
                      : status.hasAudio
                      ? 'bg-green-900/30 hover:bg-green-900/50 text-white'
                      : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">
                      #{sentence.lineNumber}
                    </span>
                    <div className="flex items-center gap-1">
                      {status.recordedByUser && (
                        <UserIcon className="w-3 h-3 text-purple-400" />
                      )}
                      {status.hasAudio ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-gray-400">{status.count}</span>
                        </div>
                      ) : (
                        <Circle className="w-3 h-3 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm truncate">{sentence.darija || sentence.darijaAr}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="font-semibold mb-2">Keyboard Shortcuts</div>
          <div className="flex justify-between">
            <span>Record/Stop</span>
            <kbd className="px-2 py-0.5 bg-gray-700 rounded">Space</kbd>
          </div>
          <div className="flex justify-between">
            <span>Save Recording</span>
            <kbd className="px-2 py-0.5 bg-gray-700 rounded">Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span>Cancel</span>
            <kbd className="px-2 py-0.5 bg-gray-700 rounded">Esc</kbd>
          </div>
          <div className="flex justify-between">
            <span>Next/Previous</span>
            <kbd className="px-2 py-0.5 bg-gray-700 rounded">← →</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navigation;
