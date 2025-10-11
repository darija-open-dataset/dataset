import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, FileText } from 'lucide-react';

function FolderTreeNode({ node, level = 0, onFolderClick, selectedPath, getFileCount }) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const isSelected = selectedPath === node.path;
  const fileCount = getFileCount(node.path);

  const handleClick = () => {
    if (node.children && node.children.length > 0) {
      setIsExpanded(!isExpanded);
    }
    onFolderClick(node.path, node.name);
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left ${
          isSelected
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren && (
          <span className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
        )}
        {!hasChildren && <span className="w-3.5" />}
        
        <span className="flex-shrink-0">
          {isExpanded && hasChildren ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
        </span>
        
        <span className="flex-1 truncate text-sm">{node.name}</span>
        
        {fileCount > 0 && (
          <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded ${
            isSelected ? 'bg-blue-500' : 'bg-gray-600'
          }`}>
            {fileCount}
          </span>
        )}
      </button>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child, index) => (
            <FolderTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onFolderClick={onFolderClick}
              selectedPath={selectedPath}
              getFileCount={getFileCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FolderTree({ folderStructure, onFolderClick, selectedPath, csvFiles }) {
  const getFileCount = (folderPath) => {
    if (!csvFiles) return 0;
    
    // Count CSV files in this folder (not subfolders)
    return csvFiles.filter(file => {
      const fileDir = file.directory;
      const normalizedFolderPath = folderPath === '.' ? '' : folderPath;
      return fileDir === normalizedFolderPath || fileDir.startsWith(normalizedFolderPath + '/');
    }).length;
  };

  if (!folderStructure) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No dataset loaded
      </div>
    );
  }

  return (
    <div className="py-2">
      <FolderTreeNode
        node={folderStructure}
        onFolderClick={onFolderClick}
        selectedPath={selectedPath}
        getFileCount={getFileCount}
      />
    </div>
  );
}

export default FolderTree;
