# Changelog

All notable changes to the TTS Annotation Tool project.

## [1.2.0] - 2025-10-11

### Added
- **IDE-Style Folder Navigator**: Hierarchical tree view in sidebar for browsing dataset structure
  - Expandable/collapsable folders with chevron icons
  - File count badges on each folder
  - Dynamic file loading based on selected folder
  - Search functionality across all files
  
- **User Profile System**: Comprehensive annotator metadata collection
  - Gender selection (Male/Female)
  - Age range selection (6 ranges from 18-65+)
  - Current region selection (all 12 Moroccan regions)
  - Optional native/origin region
  - Optional dialect characteristics notes
  - Profile edit functionality via settings icon
  - Profile displayed in sidebar
  
- **Microphone Selection**: Choose which microphone to use for recording
  - Automatic detection of all audio input devices
  - Dropdown selector visible when idle
  - Real-time device change detection
  - Device labels displayed (or IDs if unavailable)
  
- **Metadata CSV Generation**: Each recording now has a paired CSV file
  - User ID and timestamp
  - Source CSV path and line number
  - Full sentence in Darija Latin, Darija Arabic, and English
  - Complete annotator profile (gender, age, region, dialect)
  - Audio filename reference
  - CSV format for easy data processing
  
- **Dataset Folder Picker**: Manual folder selection interface
  - Prominent "Load Dataset Folder" button in sidebar
  - Folder path saved and remembered
  - "Change Dataset Folder" option
  - Dataset path display at bottom of sidebar
  
- **Auto-Discovery of CSV Files**: Automatic scanning of dataset folder
  - Recursive directory traversal
  - Builds hierarchical folder structure
  - Filters out dev/build folders (.git, node_modules, etc.)
  - Progress bars showing annotation status per file
  - "X by you" indicator for user contributions

### Changed
- **Recordings Storage Location**: 
  - **Before**: `C:\Users\...\AppData\Roaming\tts-annotation-app\recordings\`
  - **After**: `dataset/recordings/` (local to dataset folder)
  - Directory structure now matches CSV folder hierarchy
  - Makes recordings portable and shareable
  
- **File Selection UI**: Complete redesign
  - Removed manual file browser dialog
  - Two-panel layout (sidebar + main content)
  - Grid layout for file cards (responsive: 1-3 columns)
  - Category filtering via folder tree
  - Enhanced search with path matching
  
- **Empty CSV Handling**: Better error states
  - Shows header with back button when CSV is empty
  - Centered message with icon and explanation
  - Multiple back navigation options
  - Prevents getting stuck on error states

- **Audio Recording Metadata**: Extended data capture
  - Now includes full sentence data with each recording
  - Annotator profile embedded in recording metadata
  - Metadata stored in both JSON map and CSV files
  
### Fixed
- **Recordings Map Structure**: Updated to include annotator metadata
  - Each recording entry now has `annotator` object
  - Contains gender, ageRange, region, nativeRegion, dialect
  
- **Back Button Visibility**: Always accessible
  - Fixed issue where back button was hidden on empty CSV
  - Added secondary back button in error states

### Technical
- **New Components**:
  - `UserProfileForm.jsx` - User profile collection interface
  - `FolderTree.jsx` - Hierarchical folder tree component
  
- **Updated Components**:
  - `FileSelector.jsx` - Complete redesign with folder navigation
  - `RecordingControls.jsx` - Added microphone selector
  - `AnnotationWorkspace.jsx` - Enhanced empty state handling
  - `App.jsx` - Profile management integration
  
- **Enhanced Hooks**:
  - `useAudioRecorder.js` - Audio device enumeration and selection
  
- **Backend Changes**:
  - `electron/main.cjs`:
    - Dynamic dataset path management
    - Metadata CSV file generation
    - Folder structure tree building
    - Device-agnostic storage paths
  - `electron/preload.cjs`:
    - Profile API exposure
    - Dataset path management APIs
    
- **Storage Files**:
  - `.user-profile.json` - User profile (in AppData)
  - `.dataset-path` - Saved dataset location (in AppData)
  - `{audioFile}.csv` - Metadata per recording (in dataset)
  - `recordings-map.json` - Recording index (in dataset root)

### Documentation
- Updated README.md with:
  - New storage structure explanation
  - Metadata CSV format example
  - Updated quick start instructions
  - Profile setup steps
  - Privacy and data handling info
  
- Added CHANGELOG.md (this file)

---

## [1.1.0] - 2025-10-10

### Added
- **Portable Executable Build**: One-click `.exe` for non-developers
  - `npm run build:exe` command
  - No installation required
  - Electron Builder configuration
  - Custom DODa logo as app icon

### Changed
- **README**: Added build instructions and portable exe usage

---

## [1.0.0] - 2025-10-10 (Initial Release)

### Added
- **Core Annotation Features**:
  - CSV file selection and parsing
  - Sentence display (Darija Latin, Arabic, English)
  - Audio recording with Web Audio API
  - Recording playback
  - Save/cancel recording functionality
  - Navigation (next/previous/jump to line)
  
- **Recording Management**:
  - Multiple recordings per sentence
  - User ID generation and persistence
  - Recording metadata (timestamp, duration, user)
  - Organized file storage by CSV and line number
  
- **UI Components**:
  - Header with file info and stats
  - Sentence display panel
  - Recording controls with keyboard shortcuts
  - Navigation sidebar with sentence list
  - Progress indicators
  - Existing recordings list
  
- **Keyboard Shortcuts**:
  - `Space` - Start/Stop recording
  - `Enter` - Save recording
  - `Esc` - Cancel recording
  - `Arrow Keys` / `n`/`p` - Navigate sentences
  
- **Data Persistence**:
  - `recordings-map.json` for tracking all recordings
  - Hierarchical audio file organization
  - User ID in `.user-id` file
  
- **Documentation**:
  - Comprehensive README.md
  - SETUP.md for developers
  - BUILD.md for packaging instructions
  - Code comments and structure
