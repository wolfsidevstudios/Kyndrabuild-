export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  content?: string;
  children?: FileNode[];
  uuid?: string; // Add a unique identifier for history tracking
}
