const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { v4: uuidv4 } = require('uuid');

let mainWindow;

// Use userData directory for user-specific files only
const USER_DATA_DIR = app.getPath('userData');
const USER_ID_FILE = path.join(USER_DATA_DIR, '.user-id');
const USER_PROFILE_FILE = path.join(USER_DATA_DIR, '.user-profile.json');
const DATASET_PATH_FILE = path.join(USER_DATA_DIR, '.dataset-path');

// Recordings and mapping will be stored in dataset folder (dynamic)
let DATASET_ROOT = null;
let RECORDINGS_DIR = null;
let MAPPING_FILE = null;

// For CSV files, look in parent directory of the app
const APP_ROOT = app.isPackaged 
  ? path.dirname(app.getPath('exe'))
  : path.join(__dirname, '..');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  
  // Log user data directory for debugging
  console.log('User Data Directory:', USER_DATA_DIR);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Get or create user ID
ipcMain.handle('get-user-id', async () => {
  try {
    const userId = await fs.readFile(USER_ID_FILE, 'utf-8');
    return userId.trim();
  } catch (error) {
    const newUserId = uuidv4().split('-')[0]; // First 8 chars
    await fs.writeFile(USER_ID_FILE, newUserId);
    return newUserId;
  }
});

// Get user profile
ipcMain.handle('get-user-profile', async () => {
  try {
    const profile = await fs.readFile(USER_PROFILE_FILE, 'utf-8');
    return JSON.parse(profile);
  } catch (error) {
    return null;
  }
});

// Save user profile
ipcMain.handle('save-user-profile', async (event, profileData) => {
  try {
    const profile = {
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(USER_PROFILE_FILE, JSON.stringify(profile, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
});

// Get saved dataset path
ipcMain.handle('get-dataset-path', async () => {
  try {
    const savedPath = await fs.readFile(DATASET_PATH_FILE, 'utf-8');
    return savedPath.trim();
  } catch (error) {
    return null;
  }
});

// Save dataset path
ipcMain.handle('save-dataset-path', async (event, datasetPath) => {
  try {
    await fs.writeFile(DATASET_PATH_FILE, datasetPath);
    return true;
  } catch (error) {
    console.error('Error saving dataset path:', error);
    return false;
  }
});

// Select dataset folder
ipcMain.handle('select-dataset-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Dataset Folder',
    message: 'Choose the folder containing CSV files (sentences, ongoing, etc.)',
  });

  if (result.canceled) return null;
  return result.filePaths[0];
});

// Build folder structure tree
function buildFolderTree(csvFiles, basePath) {
  const tree = {
    name: path.basename(basePath) || 'dataset',
    path: '.',
    children: []
  };

  const folderMap = new Map();
  folderMap.set('.', tree);

  csvFiles.forEach(file => {
    const dir = file.directory;
    const parts = dir === '.' ? [] : dir.split('/');
    
    let currentPath = '.';
    let parent = tree;
    
    parts.forEach((part, index) => {
      const newPath = parts.slice(0, index + 1).join('/');
      
      if (!folderMap.has(newPath)) {
        const newNode = {
          name: part,
          path: newPath,
          children: []
        };
        parent.children.push(newNode);
        folderMap.set(newPath, newNode);
      }
      
      parent = folderMap.get(newPath);
    });
  });

  // Sort children alphabetically
  function sortTree(node) {
    if (node.children) {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
      node.children.forEach(sortTree);
    }
  }
  sortTree(tree);

  return tree;
}

// Helper to set dataset root and dependent paths
function setDatasetRoot(datasetPath) {
  DATASET_ROOT = datasetPath;
  RECORDINGS_DIR = path.join(DATASET_ROOT, 'recordings');
  MAPPING_FILE = path.join(DATASET_ROOT, 'recordings-map.json');
  console.log('Dataset Root:', DATASET_ROOT);
  console.log('Recordings Directory:', RECORDINGS_DIR);
  console.log('Mapping File:', MAPPING_FILE);
}

// Discover all CSV files in dataset
ipcMain.handle('discover-csv-files', async (event, customPath) => {
  try {
    // Use custom path if provided, otherwise try to find it automatically
    let datasetRoot = customPath;
    
    if (!datasetRoot) {
      // Try to load saved path
      try {
        const savedPath = await fs.readFile(DATASET_PATH_FILE, 'utf-8');
        datasetRoot = savedPath.trim();
      } catch (error) {
        // No saved path, try automatic detection
        if (app.isPackaged) {
          const exeDir = path.dirname(app.getPath('exe'));
          if (exeDir.includes('tts-annotation-app')) {
            datasetRoot = path.join(exeDir, '..', '..');
          } else {
            datasetRoot = exeDir;
          }
        } else {
          datasetRoot = path.join(__dirname, '..', '..');
        }
      }
    }

    // Set the dataset root and dependent paths
    setDatasetRoot(datasetRoot);
    
    console.log('Scanning for CSV files in:', datasetRoot);
    const csvFiles = [];
    
    async function scanDirectory(dir, baseDir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip node_modules, .git, dist, etc.
          if (entry.name.startsWith('.') || entry.name === 'node_modules' || 
              entry.name === 'dist' || entry.name === 'dist-electron' || 
              entry.name === 'tts-annotation-app') {
            continue;
          }
          
          if (entry.isDirectory()) {
            await scanDirectory(fullPath, baseDir);
          } else if (entry.name.endsWith('.csv')) {
            const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            const stats = await fs.stat(fullPath);
            
            csvFiles.push({
              absolutePath: fullPath,
              relativePath: relativePath,
              fileName: entry.name,
              directory: path.dirname(relativePath).replace(/\\/g, '/'),
              size: stats.size,
            });
          }
        }
      } catch (err) {
        console.error('Error scanning directory:', dir, err);
      }
    }
    
    await scanDirectory(datasetRoot, datasetRoot);
    console.log(`Found ${csvFiles.length} CSV files`);
    
    // Build folder tree structure
    const folderTree = buildFolderTree(csvFiles, datasetRoot);
    
    return {
      files: csvFiles,
      folderTree: folderTree,
      datasetRoot: datasetRoot
    };
  } catch (error) {
    console.error('Error discovering CSV files:', error);
    return { files: [], folderTree: null, datasetRoot: null };
  }
});

// Select CSV file (kept for backwards compatibility)
ipcMain.handle('select-csv-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    defaultPath: path.join(APP_ROOT, '..'),
  });

  if (result.canceled) return null;
  
  const filePath = result.filePaths[0];
  const relativePath = path.relative(path.join(APP_ROOT, '..'), filePath);
  
  return {
    absolutePath: filePath,
    relativePath: relativePath.replace(/\\/g, '/'),
  };
});

// Read CSV file
ipcMain.handle('read-csv-file', async (event, filePath) => {
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
});

// Save audio file with metadata CSV
ipcMain.handle('save-audio', async (event, { audioBlob, relativeCsvPath, lineNumber, userId, sentenceData, userProfile }) => {
  try {
    if (!RECORDINGS_DIR) {
      throw new Error('Dataset not loaded. Please select a dataset folder first.');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Create directory structure matching CSV location
    const csvCategory = path.dirname(relativeCsvPath);
    const csvName = path.basename(relativeCsvPath, '.csv');
    const lineDir = path.join(RECORDINGS_DIR, csvCategory, csvName, `line_${String(lineNumber).padStart(4, '0')}`);
    
    console.log('Creating directory:', lineDir);
    await fs.mkdir(lineDir, { recursive: true });
    
    // Save audio file
    const baseFileName = `user_${userId}_${timestamp}`;
    const audioFileName = `${baseFileName}.wav`;
    const audioPath = path.join(lineDir, audioFileName);
    
    console.log('Saving audio to:', audioPath);
    
    // Convert base64 to buffer
    const base64Data = audioBlob.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(audioPath, buffer);
    
    // Create metadata CSV file
    const csvFileName = `${baseFileName}.csv`;
    const csvPath = path.join(lineDir, csvFileName);
    
    // Build CSV content with all metadata
    const csvLines = [
      'field,value',
      `user_id,${userId}`,
      `timestamp,${new Date().toISOString()}`,
      `source_csv,${relativeCsvPath}`,
      `line_number,${lineNumber}`,
      `darija_latin,"${(sentenceData.darija || '').replace(/"/g, '""')}"`,
      `darija_arabic,"${(sentenceData.darijaAr || '').replace(/"/g, '""')}"`,
      `english,"${(sentenceData.english || '').replace(/"/g, '""')}"`,
    ];

    // Add user profile data if available
    if (userProfile) {
      csvLines.push(`annotator_gender,${userProfile.gender || ''}`);
      csvLines.push(`annotator_age_range,${userProfile.ageRange || ''}`);
      csvLines.push(`annotator_region,${userProfile.region || ''}`);
      csvLines.push(`annotator_native_region,${userProfile.nativeRegion || ''}`);
      csvLines.push(`annotator_dialect,"${(userProfile.dialect || '').replace(/"/g, '""')}"`);
    }

    csvLines.push(`audio_file,${audioFileName}`);
    
    const csvContent = csvLines.join('\n');
    await fs.writeFile(csvPath, csvContent, 'utf-8');
    console.log('Metadata CSV saved:', csvPath);
    
    // Return relative path for mapping (relative to DATASET_ROOT)
    const relativeAudioPath = path.relative(DATASET_ROOT, audioPath).replace(/\\/g, '/');
    console.log('Audio saved successfully:', relativeAudioPath);
    return relativeAudioPath;
  } catch (error) {
    console.error('Error saving audio:', error);
    throw error;
  }
});

// Load recordings map
ipcMain.handle('load-recordings-map', async () => {
  try {
    if (!MAPPING_FILE) {
      return {
        version: "1.0",
        recordings: {}
      };
    }
    const content = await fs.readFile(MAPPING_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // Initialize new map if doesn't exist
    const newMap = {
      version: "1.0",
      recordings: {}
    };
    return newMap;
  }
});

// Save recordings map
ipcMain.handle('save-recordings-map', async (event, mapData) => {
  await fs.writeFile(MAPPING_FILE, JSON.stringify(mapData, null, 2));
  return true;
});

// Get audio file
ipcMain.handle('get-audio-file', async (event, relativePath) => {
  try {
    if (!DATASET_ROOT) {
      throw new Error('Dataset not loaded');
    }
    const absolutePath = path.join(DATASET_ROOT, relativePath);
    console.log('Loading audio from:', absolutePath);
    const buffer = await fs.readFile(absolutePath);
    return `data:audio/wav;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Error loading audio:', error);
    throw error;
  }
});

// Check if recordings directory exists, create if not
ipcMain.handle('check-recordings-dir', async () => {
  try {
    if (!RECORDINGS_DIR) {
      console.log('Recordings directory not set yet (no dataset loaded)');
      return true;
    }
    await fs.access(RECORDINGS_DIR);
  } catch (error) {
    if (RECORDINGS_DIR) {
      await fs.mkdir(RECORDINGS_DIR, { recursive: true });
    }
  }
  return true;
});
