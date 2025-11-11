
import React, { useState, useMemo, useCallback } from 'react';
import FileTree from './components/FileTree';
import CodeViewer from './components/CodeViewer';
import LivePreview from './components/LivePreview';
import { mockProject } from './data/mockProject';
import type { FileNode } from './types';
import ChatPanel from './components/ChatPanel';
import PillToggle from './components/PillToggle';
import { GoogleGenAI, Type } from "@google/genai";

type RightPaneView = 'preview' | 'code';
type ChatMessage = {
  author: 'user' | 'ai';
  content: string;
};

// Helper function to recursively update a file in the tree
const updateFileInTree = (node: FileNode, path: string, newContent: string): FileNode => {
  if (node.type === 'file' && node.path === path) {
    return { ...node, content: newContent };
  }
  if (node.type === 'directory' && node.children) {
    return {
      ...node,
      children: node.children.map(child => updateFileInTree(child, path, newContent))
    };
  }
  return node;
};


function App() {
  const [projectFiles, setProjectFiles] = useState<FileNode>(mockProject);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>('src/App.tsx');
  const [rightPaneView, setRightPaneView] = useState<RightPaneView>('preview');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { author: 'ai', content: "Hello! I can now create serverless functions. Try asking me to: 'Create an API endpoint at /api/greeting that returns a welcome message.'" }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

  const fileMap = useMemo(() => {
    const map = new Map<string, FileNode>();
    function traverse(node: FileNode) {
      map.set(node.path, node);
      if (node.children) {
        node.children.forEach(traverse);
      }
    }
    traverse(projectFiles);
    return map;
  }, [projectFiles]);

  const selectedFile = selectedFilePath ? fileMap.get(selectedFilePath) : null;

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!prompt || isAiLoading) return;
    
    setIsAiLoading(true);
    setChatHistory(prev => [...prev, { author: 'user', content: prompt }]);

    try {
      // FIX: Explicitly type `f` as FileNode in callbacks to resolve issue where it was being inferred as `unknown`.
      const allFiles = Array.from(fileMap.values())
        .filter((f: FileNode) => f.type === 'file')
        .map((f: FileNode) => `// File: ${f.path}\n\n${f.content}`)
        .join('\n\n---\n\n');

      const fullPrompt = `You are an expert web developer AI. The user wants to change their web application.
      You have the ability to modify existing files and create new files.
      
      A new capability is creating serverless backend API functions.
      - API files should be created inside the 'src/api/' directory. For example, a request for '/api/user' should create a file at 'src/api/user.ts'.
      - These functions should be written in TypeScript and follow a format similar to Vercel/Next.js API routes.
      - They must have a default export of a function that accepts 'req' and 'res' arguments.
      - Example API file at 'src/api/hello.ts':
        // req and res types are simplified for this environment
        export default function handler(req, res) {
          res.status(200).json({ message: 'Hello World' });
        }
      - The frontend code can then call this using fetch('/api/hello').

      User request: "${prompt}"

      Here is the current state of all the files in the project:
      ---
      ${allFiles}
      ---
      
      Based on the user's request, please provide the necessary file creations and modifications.
      Only respond with the JSON object. Do not add any markdown formatting.
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    explanation: {
                        type: Type.STRING,
                        description: 'A brief, friendly explanation of the changes you made for the user.'
                    },
                    filesToUpdate: {
                        type: Type.ARRAY,
                        description: 'An array of existing files that need to be updated.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                path: {
                                    type: Type.STRING,
                                    description: 'The full path of the file to update (e.g., "src/components/Button.tsx").'
                                },
                                content: {
                                    type: Type.STRING,
                                    description: 'The complete new content of the file.'
                                }
                            },
                            required: ['path', 'content']
                        }
                    },
                    filesToCreate: {
                        type: Type.ARRAY,
                        description: 'An array of new files that need to be created.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                path: {
                                    type: Type.STRING,
                                    description: 'The full path of the new file to create (e.g., "src/api/new-endpoint.ts").'
                                },
                                content: {
                                    type: Type.STRING,
                                    description: 'The complete content of the new file.'
                                }
                            },
                            required: ['path', 'content']
                        }
                    }
                },
                required: ['explanation']
            },
        }
      });
      
      const responseJson = JSON.parse(response.text);

      if (responseJson.explanation) {
        setChatHistory(prev => [...prev, { author: 'ai', content: responseJson.explanation }]);
      }
      
      if (responseJson.filesToUpdate && responseJson.filesToUpdate.length > 0) {
        setProjectFiles(currentProject => {
          let updatedProject = currentProject;
          for (const file of responseJson.filesToUpdate) {
            if (fileMap.has(file.path)) {
              updatedProject = updateFileInTree(updatedProject, file.path, file.content);
            }
          }
          return updatedProject;
        });
      }

      if (responseJson.filesToCreate && responseJson.filesToCreate.length > 0) {
        setProjectFiles(currentProject => {
          // Deep clone to avoid mutation issues with nested objects
          const newProject = JSON.parse(JSON.stringify(currentProject));
      
          for (const fileToCreate of responseJson.filesToCreate) {
            const { path, content } = fileToCreate;
            const parts = path.split('/');
            const fileName = parts.pop();
            let currentNode = newProject;
      
            // Traverse/create directories
            for (const part of parts) {
              if (currentNode.type !== 'directory' || !currentNode.children) break; 
              let childDir = currentNode.children.find(c => c.name === part && c.type === 'directory');
              if (!childDir) {
                const parentPath = currentNode.path;
                const dirPath = parentPath ? `${parentPath}/${part}` : part;
                childDir = { name: part, type: 'directory', path: dirPath, children: [] };
                currentNode.children.push(childDir);
              }
              currentNode = childDir;
            }
            
            // Add file if it doesn't already exist
            if (currentNode.type === 'directory' && fileName) {
                if (!currentNode.children.some(c => c.name === fileName && c.type === 'file')) {
                   currentNode.children.push({ name: fileName, type: 'file', path, content });
                }
            }
          }
          return newProject;
        });
      }


    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setChatHistory(prev => [...prev, { author: 'ai', content: `Sorry, I encountered an error: ${errorMessage}` }]);
    } finally {
      setIsAiLoading(false);
    }
  }, [ai, fileMap, isAiLoading]);

  return (
    <div className="w-full h-screen bg-gray-50 p-4 sm:p-6 md:p-8 flex items-center justify-center font-sans">
      <main className="w-full h-full max-w-screen-2xl bg-white rounded-3xl border border-gray-200 flex overflow-hidden">
        {/* Left Pane: Chat */}
        <aside className="w-full max-w-sm hidden lg:flex border-r border-gray-200">
           <ChatPanel 
             messages={chatHistory}
             onSendMessage={handleSendMessage}
             isLoading={isAiLoading}
           />
        </aside>

        {/* Right Pane: Preview / Code */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <header className="flex-shrink-0 bg-white border-b border-gray-200 p-2 flex items-center justify-center">
            <PillToggle
              currentView={rightPaneView}
              onViewChange={setRightPaneView}
            />
          </header>
          
          <div className="flex-1 overflow-hidden">
            {rightPaneView === 'preview' ? (
              <LivePreview files={fileMap} entryPoint="src/App.tsx" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] h-full">
                <aside className="bg-white border-r border-gray-200 overflow-y-auto">
                  <FileTree 
                    node={projectFiles} 
                    selectedFilePath={selectedFilePath} 
                    onSelectFile={setSelectedFilePath} 
                  />
                </aside>
                <section className="flex flex-col overflow-hidden">
                  <CodeViewer file={selectedFile ?? null} />
                </section>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
