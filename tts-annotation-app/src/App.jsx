import React, { useState, useEffect } from 'react';
import FileSelector from './components/FileSelector';
import AnnotationWorkspace from './components/AnnotationWorkspace';
import UserProfileForm from './components/UserProfileForm';
import { parseCsvData } from './utils/csvParser';

function App() {
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [recordingsMap, setRecordingsMap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Get or create user ID
      const id = await window.electronAPI.getUserId();
      setUserId(id);

      // Load user profile
      const profile = await window.electronAPI.getUserProfile();
      setUserProfile(profile);
      
      // If no profile exists, show the form
      if (!profile) {
        setShowProfileForm(true);
      }

      // Load recordings map
      const map = await window.electronAPI.loadRecordingsMap();
      setRecordingsMap(map);

      // Ensure recordings directory exists
      await window.electronAPI.checkRecordingsDir();

      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const handleSaveProfile = async (profileData) => {
    const success = await window.electronAPI.saveUserProfile(profileData);
    if (success) {
      setUserProfile(profileData);
      setShowProfileForm(false);
    }
  };

  const handleSkipProfile = () => {
    setShowProfileForm(false);
  };

  const handleFileSelect = async (fileInfo) => {
    try {
      setLoading(true);
      const csvContent = await window.electronAPI.readCsvFile(fileInfo.absolutePath);
      const parsedSentences = parseCsvData(csvContent);
      
      // Set the file and sentences (even if empty - the workspace will handle it)
      setSentences(parsedSentences);
      setSelectedFile(fileInfo);
      setLoading(false);
      
      // Warn if no sentences were found
      if (parsedSentences.length === 0) {
        console.warn('No sentences found in CSV file:', fileInfo.fileName);
      }
    } catch (error) {
      console.error('Failed to load CSV file:', error);
      alert(`Failed to load the CSV file: ${error.message}\n\nPlease check the file format and try again.`);
      setLoading(false);
      // Don't set selectedFile on error, stay on file selection screen
    }
  };

  const handleBackToFileSelection = () => {
    setSelectedFile(null);
    setSentences([]);
  };

  const updateRecordingsMap = (newMap) => {
    setRecordingsMap(newMap);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading TTS Annotation Tool...</p>
        </div>
      </div>
    );
  }

  if (showProfileForm) {
    return (
      <UserProfileForm
        userId={userId}
        existingProfile={userProfile}
        onSave={handleSaveProfile}
        onSkip={handleSkipProfile}
      />
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white">
      {!selectedFile ? (
        <FileSelector 
          userId={userId} 
          userProfile={userProfile}
          onFileSelect={handleFileSelect}
          recordingsMap={recordingsMap}
          onEditProfile={() => setShowProfileForm(true)}
        />
      ) : (
        <AnnotationWorkspace
          userId={userId}
          userProfile={userProfile}
          selectedFile={selectedFile}
          sentences={sentences}
          recordingsMap={recordingsMap}
          onBackToFileSelection={handleBackToFileSelection}
          onUpdateRecordingsMap={updateRecordingsMap}
        />
      )}
    </div>
  );
}

export default App;
