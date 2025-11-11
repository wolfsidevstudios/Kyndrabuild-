
import React from 'react';
import type { FileNode } from '../types';
import FolderIcon from './icons/FolderIcon';
import ReactIcon from './icons/ReactIcon';
import TypeScriptIcon from './icons/TypeScriptIcon';
import FileIcon from './icons/FileIcon';

interface FileTreeProps {
  node: FileNode;
  selectedFilePath: string | null;
  onSelectFile: (path: string) => void;
  level?: number;
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.tsx')) {
    return <ReactIcon />;
  }
  if (fileName.endsWith('.ts')) {
    return <TypeScriptIcon />;
  }
  return <FileIcon />;
};

const FileTree: React.FC<FileTreeProps> = ({ node, selectedFilePath, onSelectFile, level = 0 }) => {
  const isSelected = node.path === selectedFilePath;

  const handleSelect = () => {
    if (node.type === 'file') {
      onSelectFile(node.path);
    }
  };

  const paddingLeft = `${level * 1.5}rem`;

  if (node.type === 'directory') {
    return (
      <div>
        <div 
          className="flex items-center px-4 py-1 text-gray-900" 
          style={{ paddingLeft }}
        >
          <FolderIcon />
          <span>{node.name}</span>
        </div>
        {node.children && node.children.map((child) => (
          <FileTree 
            key={child.path} 
            node={child} 
            selectedFilePath={selectedFilePath} 
            onSelectFile={onSelectFile}
            level={level + 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      onClick={handleSelect}
      className={`flex items-center px-4 py-1.5 cursor-pointer transition-colors duration-150 rounded-md mx-2 ${
        isSelected ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-100/70 text-gray-600'
      }`}
      style={{ paddingLeft }}
    >
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </div>
  );
};

export default FileTree;