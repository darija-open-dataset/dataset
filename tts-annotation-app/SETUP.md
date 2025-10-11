# Setup Instructions

## First Time Setup

### 1. Install Node.js
If you don't have Node.js installed:
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (recommended for most users)
3. Run the installer
4. Verify installation by opening terminal/command prompt and typing:
   ```bash
   node --version
   npm --version
   ```

### 2. Install Dependencies
Open your terminal/command prompt and navigate to this folder, then run:

```bash
npm install
```

This will download all necessary packages. It may take 2-5 minutes depending on your internet connection.

### 3. Run the Application

#### Development Mode (Recommended for testing)
```bash
npm run electron:dev
```

The app will open in a window. You can close it and reopen anytime by running this command again.

#### Build Production Version (Optional)
If you want to create a standalone executable:
```bash
npm run electron:build
```

The built application will be in the `dist-electron/` folder.

## Troubleshooting Setup

### "npm is not recognized"
- Node.js is not installed or not in your PATH
- Reinstall Node.js and restart your terminal

### "Cannot find module"
- Delete the `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### Port 5173 already in use
- Another instance is already running
- Close it or change the port in `vite.config.js`

### Permission errors on Windows
- Run terminal as Administrator
- Or change the install location to a folder you have write access to

## Next Steps

After setup is complete, refer to `README.md` for usage instructions.

## System Requirements

- **OS**: Windows 10/11, macOS 10.13+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for app + space for recordings
- **Microphone**: Required for recording audio
- **Node.js**: Version 16 or higher
