const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getUserId: () => ipcRenderer.invoke('get-user-id'),
  getUserProfile: () => ipcRenderer.invoke('get-user-profile'),
  saveUserProfile: (profileData) => ipcRenderer.invoke('save-user-profile', profileData),
  getDatasetPath: () => ipcRenderer.invoke('get-dataset-path'),
  saveDatasetPath: (datasetPath) => ipcRenderer.invoke('save-dataset-path', datasetPath),
  selectDatasetFolder: () => ipcRenderer.invoke('select-dataset-folder'),
  discoverCsvFiles: (customPath) => ipcRenderer.invoke('discover-csv-files', customPath),
  selectCsvFile: () => ipcRenderer.invoke('select-csv-file'),
  readCsvFile: (filePath) => ipcRenderer.invoke('read-csv-file', filePath),
  saveAudio: (data) => ipcRenderer.invoke('save-audio', data),
  loadRecordingsMap: () => ipcRenderer.invoke('load-recordings-map'),
  saveRecordingsMap: (mapData) => ipcRenderer.invoke('save-recordings-map', mapData),
  getAudioFile: (relativePath) => ipcRenderer.invoke('get-audio-file', relativePath),
  checkRecordingsDir: () => ipcRenderer.invoke('check-recordings-dir'),
});
