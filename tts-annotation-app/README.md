# TTS Annotation Tool

A desktop application for annotating Darija sentences with audio recordings to build a Text-to-Speech (TTS) dataset.

**📋 [View Changelog](CHANGELOG.md)** - See all updates and features

## ✨ Latest Features (v1.2.0)

- **🗂️ IDE-Style Folder Navigator** - Browse your dataset with a hierarchical tree view
- **👤 User Profile System** - Collect annotator demographics (gender, age, region, dialect)
- **🎤 Microphone Selection** - Choose which mic to use from dropdown
- **📊 Metadata CSV Files** - Each recording paired with detailed metadata CSV
- **📁 Dataset Folder Picker** - One-click folder selection, path remembered
- **💾 Local Storage** - Recordings saved in `dataset/recordings/` (portable & shareable)
- **🔍 Auto-Discovery** - Automatically finds all CSV files in your dataset
- **📈 Progress Tracking** - See annotation status for each file with progress bars

## 🚀 Quick Start

### For Non-Technical Users (Easiest Way)

**If you received a `.exe` file:**
1. Download `TTS-Annotation-Tool-Portable.exe`
2. Place it anywhere on your computer (Desktop, Documents, etc.)
3. Double-click to run
4. On first launch, click **"Select Dataset Folder"** and choose the `dataset/` folder
5. The path is saved - you won't need to select it again!

**The dataset folder should contain:**
```
dataset/
  ├── sentences/
  ├── ongoing/
  ├── semantic categories/
  ├── syntactic categories/
  └── x-tra/
```

**First time may take 10-20 seconds to extract and start.**

### For Developers

#### Running in Development
```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

#### Building Portable Executable
```bash
# Build .exe for distribution to non-developers
npm run build:exe

# Output: dist-electron/TTS-Annotation-Tool-Portable.exe
```

See `BUILD.md` for detailed build instructions.

## 📖 How to Use

### Step 1: Launch the App & Complete Profile
- Double-click the application or run `npm run electron:dev`
- On first launch, you'll be asked to fill in your profile:
  - **Gender**: Male or Female
  - **Age Range**: Select from predefined ranges
  - **Current Region**: Your current location in Morocco
  - **Native Region** (optional): Where you grew up (if different)
  - **Dialect Notes** (optional): Any specific accent or dialect characteristics
- Your unique User ID will be displayed
- This information helps build a diverse TTS dataset and is stored anonymously
- You can edit your profile anytime by clicking the settings icon

### Step 2: Select a CSV File
- The app automatically displays all available CSV files from the dataset
- Files are organized by category:
  - **sentences** - Main translated sentences
  - **ongoing** - Sentences awaiting translation
  - **semantic categories** - Categorized words/phrases
  - **syntactic categories** - Grammar-related entries
  - **x-tra** - Special categories (idioms, proverbs, etc.)
- Progress bars show annotation status for each file
- Blue text indicates files where you've contributed recordings
- Use search and filters to find specific files

### Step 3: Record Audio
1. **Read the sentence** displayed in both Latin and Arabic scripts
2. **Press Space** or click "Start Recording" to begin
3. **Speak clearly** in Darija (the timer shows recording duration)
4. **Press Space again** or click "Stop Recording" when done
5. **Press Enter** or click "Play Recording" to review
6. **Press Enter** or click "Save" to confirm, or **Esc** to discard

### Step 4: Navigate Sentences
- Use **← →** arrow keys or click Next/Previous buttons
- Use the **sidebar** to:
  - Search for specific sentences
  - Filter by status (All, With Audio, No Audio, By Me)
  - Jump to any sentence by clicking it
  - View progress indicators

### Step 5: Review Existing Recordings
- If a sentence already has recordings, they appear below the recording controls
- Click the play button to listen to any recording
- Your recordings are highlighted in blue
- You can add multiple recordings for the same sentence

## 🎹 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Start/Stop Recording | `Space` |
| Save Recording | `Enter` |
| Cancel Recording | `Esc` |
| Next Sentence | `→` or `N` |
| Previous Sentence | `←` or `P` |

## 📁 Data Organization

### Folder Structure
```
tts-annotation-app/
├── recordings/                    # Your audio files (gitignored)
│   ├── sentences/
│   │   └── sentences/
│   │       └── line_0042/
│   │           ├── user_a1b2c3d4_2025-10-10_120530.wav
│   │           └── user_x9y8z7w6_2025-10-10_143022.wav
│   ├── ongoing/
│   │   └── 02/
│   │       └── line_0023/
│   ├── semantic_categories/
│   │   └── animals/
│   └── syntactic_categories/
│       └── verbs/
├── recordings-map.json            # Mapping file (git tracked)
└── .user-id                       # Your unique ID (gitignored)
```

### recordings-map.json Structure
```json
{
  "version": "1.0",
  "recordings": {
    "sentences/sentences.csv": {
      "42": {
        "darija": "ghadi nmchi lsbitar ghda",
        "darijaAr": "غادي نمشي لصبيطار غدا",
        "recordings": [
          {
            "id": "rec_1728563130000",
            "userId": "a1b2c3d4",
            "timestamp": "2025-10-10T12:05:30Z",
            "path": "recordings/sentences/sentences/line_0042/user_a1b2c3d4_2025-10-10_120530.wav",
            "duration": 2.34,
            "annotator": {
              "gender": "Male",
              "ageRange": "26-35",
              "region": "Casablanca-Settat",
              "nativeRegion": "Fès-Meknès",
              "dialect": "Mix of Casablanca and Fes dialects"
            }
          }
        ]
      }
    }
  }
}
```

## 🔧 Technical Details

### Audio Specifications
- **Format**: WAV
- **Sample Rate**: 16kHz (configurable in code)
- **Channels**: Mono
- **Encoding**: PCM

### Technologies Used
- **Electron**: Desktop app framework
- **React**: UI framework
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **Web Audio API**: Recording functionality

### File Naming Convention
Audio files follow this pattern:
```
user_{userId}_{timestamp}.wav
```
Example: `user_a1b2c3d4_2025-10-10T12-05-30.wav`

## 🔒 Privacy & Data

- **User ID**: Generated locally, never shared externally
- **User Profile**: Stored locally in user data folder (gitignored)
- **Audio Files**: Stored in `dataset/recordings/` folder with matching directory structure
- **Metadata CSV**: Each audio file has a corresponding `.csv` file with sentence and annotator details
- **Mapping File**: `recordings-map.json` in dataset root tracks all recordings
- **Annotator Metadata**: Gender, age, region info is included with each recording for dataset diversity
- **Data Usage**: Profile information is used solely for TTS dataset quality and diversity tracking

### Recordings Storage Structure
```
dataset/
  ├── recordings/
  │   └── sentences/           ← Matches CSV folder structure
  │       └── sentences/       ← Matches CSV filename
  │           └── line_0001/   ← Line number
  │               ├── user_078e739d_2025-10-11T10-30-45.wav
  │               └── user_078e739d_2025-10-11T10-30-45.csv  ← Metadata
  └── recordings-map.json      ← Index of all recordings
```

### Metadata CSV Format
Each recording has a corresponding CSV file with complete details:
```csv
field,value
user_id,078e739d
timestamp,2025-10-11T10:30:45.123Z
source_csv,sentences/sentences.csv
line_number,42
darija_latin,"ghadi nmchi lsbitar ghda"
darija_arabic,"غادي نمشي لصبيطار غدا"
english,"I will go to the hospital tomorrow"
annotator_gender,Male
annotator_age_range,26-35
annotator_region,Casablanca-Settat
annotator_native_region,Fès-Meknès
annotator_dialect,"Mix of Casablanca and Fes dialects"
audio_file,user_078e739d_2025-10-11T10-30-45.wav
```

## 🤝 Collaboration

Multiple users can annotate the same dataset:
- Each user gets a unique ID
- Multiple recordings per sentence are supported
- The mapping file tracks all contributors
- Filters help you see your contributions vs. others

## 📊 Progress Tracking

The app shows:
- **Total sentences** in the current file
- **Sentences with audio** (any user)
- **Sentences you recorded**
- **Overall progress percentage**

Visual indicators in the sidebar:
- 🔵 Blue highlight = Currently viewing
- 🟣 Purple background = You recorded this
- 🟢 Green background = Has recordings (from anyone)
- ⚪ Gray background = No recordings yet

## 🐛 Troubleshooting

### Microphone Not Working
- Ensure you've granted microphone permissions to the app
- On Windows: Settings → Privacy → Microphone
- Check if other apps can use your microphone

### App Won't Start
- Ensure Node.js is installed (`node --version` in terminal)
- Delete `node_modules/` folder and run `npm install` again
- Try running `npm run dev` first to test without Electron

### Recordings Not Saving
- Check if you have write permissions in the app folder
- Ensure there's enough disk space
- Look for error messages in the app

### CSV File Won't Load
- Ensure the CSV file is properly formatted
- Check that it has a header row with columns like `darija`, `darija_ar`, or `eng`
- Verify the file encoding is UTF-8

## 📝 Notes

- **Backup**: The `recordings-map.json` file is crucial - back it up regularly
- **Git**: Add `recordings-map.json` to version control, but NOT the audio files
- **Performance**: For large CSV files (>10,000 sentences), loading may take a moment
- **Quality**: Speak clearly and at a normal pace for best TTS training results
- **Environment**: Record in a quiet environment to minimize background noise

## 🎯 Best Practices

1. **Consistent Voice**: Try to maintain consistent volume and tone
2. **Natural Speech**: Speak naturally, as you would in conversation
3. **Clear Pronunciation**: Enunciate clearly but don't over-pronounce
4. **No Background Noise**: Record in a quiet environment
5. **Regular Breaks**: Take breaks to avoid voice fatigue
6. **Review Before Saving**: Always listen to your recording before saving

## 📄 License

This tool is part of the Darija Open Dataset (DODa) project.
- Dataset: CC BY-NC 4.0
- App: Open source for research and educational use

## 🙏 Contributing

To contribute to the DODa project:
1. Record audio using this tool
2. Commit the `recordings-map.json` file to your fork
3. Upload your audio files to a shared drive (coordinate with maintainers)
4. Open a pull request with your mapping file updates

---

**Happy Recording! 🎤**

For questions or issues, please open an issue on the GitHub repository.
