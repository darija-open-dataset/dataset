# Building Portable Executable for Distribution

This guide explains how to build a standalone `.exe` file that non-developers can use without installing Node.js or any dependencies.

## 🎯 For Developers: Building the Executable

### Prerequisites
- Node.js installed on your machine
- All dependencies installed (`npm install`)

### Build Commands

#### **Build Portable Executable (Recommended)**
```bash
npm run build:exe
```

This creates a **portable executable** that:
- ✅ Runs without installation
- ✅ Doesn't require admin rights
- ✅ Can be placed anywhere on the system
- ✅ Creates a single `.exe` file

**Output**: `dist-electron/TTS-Annotation-Tool-Portable.exe`

#### **Build Installer (Alternative)**
```bash
npm run electron:build
```

This creates an **NSIS installer** that:
- Installs the app to Program Files
- Creates desktop shortcuts
- Adds to Windows Start Menu

**Output**: `dist-electron/TTS Annotation Tool Setup x.x.x.exe`

### Build Time
- First build: 3-5 minutes
- Subsequent builds: 1-2 minutes

## 📦 What Gets Built

### Portable Executable Structure
```
TTS-Annotation-Tool-Portable.exe  (Single file, ~200-300MB)
```

When first run, it extracts to a temporary folder and creates:
```
%LOCALAPPDATA%/tts-annotation-app/
├── .user-id              # User's unique ID
├── recordings/           # Audio recordings
└── recordings-map.json   # Mapping file
```

### File Sizes
- Portable `.exe`: ~200-300 MB (includes Node.js, Chromium, and all dependencies)
- Installed version: ~250-350 MB

## 📤 Distribution for Non-Developers

### Option 1: Portable Executable (Recommended)

1. **Build the executable**:
   ```bash
   npm run build:exe
   ```

2. **Locate the file**:
   - Path: `tts-annotation-app/dist-electron/TTS-Annotation-Tool-Portable.exe`

3. **Share the file**:
   - Upload to Google Drive / Dropbox / OneDrive
   - Share the link with contributors
   - Or copy directly to USB drives

4. **User Instructions**:
   ```
   1. Download TTS-Annotation-Tool-Portable.exe
   2. Place it anywhere (Desktop, Documents, etc.)
   3. Double-click to run
   4. First launch may take 10-20 seconds (extracting files)
   5. No installation needed!
   ```

### Option 2: Full Installer

1. **Build the installer**:
   ```bash
   npm run electron:build
   ```

2. **Distribute**:
   - File: `dist-electron/TTS Annotation Tool Setup 1.0.0.exe`
   - Users run the installer
   - App installs to Program Files
   - Creates shortcuts automatically

## 🔧 Customization

### Change App Name
Edit `package.json`:
```json
"build": {
  "productName": "Your Custom Name",
  "portable": {
    "artifactName": "Your-Custom-Name.exe"
  }
}
```

### Add App Icon
1. Create an icon file: `public/icon.png` (512x512px)
2. Or use `.ico` format for better Windows integration
3. Update `package.json`:
```json
"win": {
  "icon": "public/icon.ico"
}
```

### Change Output Directory
```json
"build": {
  "directories": {
    "output": "releases"
  }
}
```

## 🐛 Troubleshooting Build Issues

### "electron-builder not found"
```bash
npm install --save-dev electron-builder
```

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build fails on Windows
- Run as Administrator
- Disable antivirus temporarily (it may block packaging)
- Ensure you have write permissions in the directory

### Executable won't run
- Windows may block unsigned executables
- Users may need to right-click → Properties → Unblock
- Consider code signing for production (requires certificate)

## 🔒 Code Signing (Optional but Recommended)

For production distribution, sign your executable to avoid Windows warnings:

1. Obtain a code signing certificate (from DigiCert, Sectigo, etc.)
2. Add to `package.json`:
```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "your-password"
}
```

Without signing, users will see "Unknown Publisher" warnings but can still run it.

## 📊 Build Performance

### Optimize Build Speed
```json
"build": {
  "compression": "store"  // Faster build, larger file
}
```

### Optimize File Size
```json
"build": {
  "compression": "maximum"  // Slower build, smaller file
}
```

## 🚀 Quick Start for Users

Once you distribute the `.exe`, users simply:

1. **Download** the file
2. **Double-click** to run
3. **Allow** through Windows SmartScreen if prompted:
   - Click "More info"
   - Click "Run anyway"
4. **Start annotating!**

No installation, no Node.js, no terminal commands required!

## 📝 Notes

- **First launch**: Takes 10-20 seconds as it extracts files
- **Data location**: Saved in `%LOCALAPPDATA%/tts-annotation-app/`
- **Updates**: Distribute new `.exe` versions as needed
- **Uninstall**: Simply delete the `.exe` file
- **Clean data**: Delete `%LOCALAPPDATA%/tts-annotation-app/`

---

**Building once lets unlimited users run the app without any technical setup! 🎉**
