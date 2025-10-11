import React, { useState, useEffect } from 'react';
import { FileText, User, Search, Folder, ChevronRight, Settings } from 'lucide-react';
import FolderTree from './FolderTree';

function FileSelector({ userId, userProfile, onFileSelect, recordingsMap, onEditProfile }) {
  const [csvFiles, setCsvFiles] = useState([]);
  const [folderTree, setFolderTree] = useState(null);
  const [datasetRoot, setDatasetRoot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolderPath, setSelectedFolderPath] = useState('.');

  useEffect(() => {
    loadCsvFiles();
  }, []);

  const loadCsvFiles = async (customPath = null) => {
    try {
      setLoading(true);
      const result = await window.electronAPI.discoverCsvFiles(customPath);
      setCsvFiles(result.files || []);
      setFolderTree(result.folderTree);
      setDatasetRoot(result.datasetRoot);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load CSV files:', error);
      setLoading(false);
    }
  };

  const handleSelectDatasetFolder = async () => {
    try {
      const folderPath = await window.electronAPI.selectDatasetFolder();
      if (folderPath) {
        // Save the path for future use
        await window.electronAPI.saveDatasetPath(folderPath);
        // Reload files from the new path
        await loadCsvFiles(folderPath);
      }
    } catch (error) {
      console.error('Failed to select dataset folder:', error);
    }
  };

  const handleFolderClick = (folderPath, folderName) => {
    setSelectedFolderPath(folderPath);
  };

  const getFileProgress = (file) => {
    if (!recordingsMap || !recordingsMap.recordings[file.relativePath]) {
      return { annotated: 0, total: 0, percentage: 0, byUser: 0 };
    }

    const fileRecordings = recordingsMap.recordings[file.relativePath];
    const lineNumbers = Object.keys(fileRecordings);
    
    // Estimate total sentences (we'd need to parse CSV for exact count)
    const annotated = lineNumbers.length;
    const byUser = lineNumbers.filter(lineNum => {
      const recs = fileRecordings[lineNum].recordings || [];
      return recs.some(r => r.userId === userId);
    }).length;

    return { annotated, byUser, total: annotated, percentage: 0 };
  };

  // Filter files based on selected folder and search term
  const filteredFiles = csvFiles.filter(file => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesFileName = file.fileName.toLowerCase().includes(search);
      const matchesPath = file.directory.toLowerCase().includes(search);
      if (!matchesFileName && !matchesPath) {
        return false;
      }
    }

    // Folder filter
    if (selectedFolderPath === '.') {
      return true; // Show all files when root is selected
    }
    
    // Show files in this folder or subfolders
    const normalizedFolderPath = selectedFolderPath;
    return file.directory === normalizedFolderPath || 
           file.directory.startsWith(normalizedFolderPath + '/');
  });

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-2">TTS Annotation</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User className="w-4 h-4" />
              <span>ID: <span className="font-mono text-white">{userId}</span></span>
            </div>
            {userProfile && (
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <div className="flex-1">
                  <p>{userProfile.gender}, {userProfile.ageRange}</p>
                  <p>{userProfile.region}</p>
                </div>
                <button
                  onClick={onEditProfile}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title="Edit Profile"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {!userProfile && onEditProfile && (
              <button
                onClick={onEditProfile}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                + Add profile info
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleSelectDatasetFolder}
            className="w-full mb-3 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Folder className="w-4 h-4" />
            {datasetRoot ? 'Change Dataset Folder' : 'Load Dataset Folder'}
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {folderTree ? (
            <FolderTree
              folderStructure={folderTree}
              onFolderClick={handleFolderClick}
              selectedPath={selectedFolderPath}
              csvFiles={csvFiles}
            />
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              <p className="mb-2">No dataset loaded</p>
              <p className="text-xs">Click "Load Dataset Folder" above</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          {datasetRoot && (
            <div className="text-xs text-gray-500 mb-2 truncate" title={datasetRoot}>
              📁 {datasetRoot}
            </div>
          )}
          <div className="text-xs text-gray-400">
            <p className="mb-1">{csvFiles.length} total files</p>
            <p>{filteredFiles.length} in current view</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Select a File to Annotate
            </h1>
            <p className="text-gray-400">
              Choose a CSV file to start recording Darija sentences
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-400">Discovering CSV files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-500" />
              <p className="text-gray-500 mb-4 text-lg font-medium">No CSV files found</p>
              <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                Please select the <strong>dataset</strong> folder containing your CSV files<br />
                (sentences, ongoing, semantic categories, etc.)
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSelectDatasetFolder}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg flex items-center gap-2"
                >
                  <Folder className="w-5 h-5" />
                  Select Dataset Folder
                </button>
                <button
                  onClick={() => loadCsvFiles()}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Retry Scan
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-white">
                  {selectedFolderPath === '.' ? 'All Files' : selectedFolderPath.split('/').pop()}
                </h2>
                {selectedFolderPath !== '.' && (
                  <p className="text-sm text-gray-400">{selectedFolderPath}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map(file => {
                  const progress = getFileProgress(file);
                  return (
                    <button
                      key={file.relativePath}
                      onClick={() => onFileSelect(file)}
                      className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500 rounded-lg p-4 text-left transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <h4 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                              {file.fileName}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{file.directory}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                      </div>

                      {progress.annotated > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{progress.annotated} with audio</span>
                            {progress.byUser > 0 && (
                              <span className="text-blue-400">{progress.byUser} by you</span>
                            )}
                          </div>
                          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: '100%' }} />
                          </div>
                        </div>
                      )}

                      {progress.annotated === 0 && (
                        <div className="text-xs text-gray-500">
                          No recordings yet
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileSelector;
