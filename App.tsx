
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import FileTree from './components/FileTree';
import CodeViewer from './components/CodeViewer';
import LivePreview from './components/LivePreview';
import { mockProject } from './data/mockProject';
import type { FileNode } from './types';
import ChatPanel from './components/ChatPanel';
import PillToggle from './components/PillToggle';
import { GoogleGenAI, Type } from "@google/genai";
import SuggestionsPage from './components/SuggestionsPage';
import Workspace from './components/Workspace';
import { useIntegrations } from './hooks/useIntegrations';
import type { Integrations, IntegrationId } from './hooks/useIntegrations';
import VisualEditor from './components/VisualEditor';
import ProjectsListPage from './components/ProjectsListPage';

type RightPaneView = 'preview' | 'code' | 'suggestions' | 'workspace' | 'visual_edit';
type WorkspaceView = 'project' | 'backend' | 'database' | 'auth' | 'payments' | 'history' | 'deployment';
type ChatMessage = {
  author: 'user' | 'ai';
  content: string;
  historyId?: string; // Add history link to AI messages
  attachment?: {
    name: string;
    url: string; // data URL for preview
  };
};
export type RequiredIntegration = {
    id: IntegrationId;
    name: string;
    description: string;
}
export type SqlScript = {
  databaseType: 'supabase' | 'firestore';
  description: string;
  script: string;
}
export type HistoryEntry = {
  state: FileNode;
  timestamp: number;
  uuid: string;
};
export type AiTask = {
  status: 'thinking' | 'generating';
  explanation: string;
  files: { path: string; status: 'pending' | 'done' }[];
}

export type Project = {
    id: string;
    name: string;
    lastModified: number;
    projectState: FileNode;
    chatHistory: ChatMessage[];
    history: HistoryEntry[];
    previewImage: string;
};

export type DeployState = {
    isDeploying: boolean;
    url: string | null;
    error: string | null;
}

const PROJECTS_STORAGE_KEY = 'ai-builder-projects';
const defaultPreview = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmMTRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2QxZDVlYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gUHJldmlldzwvdGV4dD48L3N2Zz4=';

declare const Babel: any;

// Helper function to recursively find a file in the tree
const findFileByPath = (node: FileNode, path: string): FileNode | null => {
  if (node.path === path && node.type === 'file') {
    return node;
  }
  if (node.type === 'directory' && node.children) {
    for (const child of node.children) {
      const found = findFileByPath(child, path);
      if (found) return found;
    }
  }
  return null;
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

const createFileInTree = (root: FileNode, path: string, content: string): FileNode => {
  const newRoot = JSON.parse(JSON.stringify(root)); // Deep copy
  const parts = path.split('/');
  const fileName = parts.pop();
  let currentNode = newRoot;

  for (const part of parts) {
    if (currentNode.type !== 'directory' || !currentNode.children) {
      console.error("Invalid path structure for creation");
      return root; // Return original on error
    }
    let childDir = currentNode.children.find(c => c.name === part && c.type === 'directory');
    if (!childDir) {
      const parentPath = currentNode.path;
      const dirPath = parentPath ? `${parentPath}/${part}` : part;
      childDir = { name: part, type: 'directory', path: dirPath, children: [] };
      currentNode.children.push(childDir);
    }
    currentNode = childDir;
  }

  if (currentNode.type === 'directory' && fileName) {
    if (!currentNode.children.some(c => c.name === fileName)) {
      currentNode.children.push({ name: fileName, type: 'file', path, content });
    } else {
        console.warn(`File creation conflict: ${path} already exists.`);
    }
  }
  return newRoot;
};

// Helper to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const data = result.split(',')[1];
            resolve({ mimeType: file.type, data });
        };
        reader.onerror = error => reject(error);
    });
};


function App() {
  const [view, setView] = useState<'projects' | 'editor'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // State for the active project
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [rightPaneView, setRightPaneView] = useState<RightPaneView>('preview');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiTask, setAiTask] = useState<AiTask | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const [fixAttempted, setFixAttempted] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { integrations, setIntegration, isConnected } = useIntegrations();
  const [requiredIntegrations, setRequiredIntegrations] = useState<RequiredIntegration[]>([]);
  const [skippedIntegrations, setSkippedIntegrations] = useState<IntegrationId[]>([]);
  const [activeWorkspaceConfig, setActiveWorkspaceConfig] = useState<{view: string, configId: string} | null>(null);
  const [sqlScript, setSqlScript] = useState<SqlScript | null>(null);

  // Deployment state
  const [appName, setAppName] = useState('');
  const [deployState, setDeployState] = useState<DeployState>({ isDeploying: false, url: null, error: null });

  // Load projects from localStorage on initial render
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (error) {
      console.error('Failed to load projects from localStorage:', error);
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save projects to localStorage:', error);
    }
  }, [projects]);
  
  // When active project state changes, update it in the main projects list
  useEffect(() => {
    if (!currentProjectId) return;
    
    const handler = setTimeout(() => {
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === currentProjectId
            ? {
                ...p,
                projectState: history.length > 0 ? history[history.length - 1].state : p.projectState,
                history,
                chatHistory,
                lastModified: Date.now(),
              }
            : p
        )
      );
    }, 1000); // Debounce saving

    return () => clearTimeout(handler);
  }, [history, chatHistory, currentProjectId]);

  const projectFiles = history.length > 0 ? history[history.length - 1].state : null;
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

  const fileMap = useMemo(() => {
    const map = new Map<string, FileNode>();
    function traverse(node: FileNode) {
      map.set(node.path, node);
      if (node.children) {
        node.children.forEach(traverse);
      }
    }
    if (projectFiles) {
        traverse(projectFiles);
    }
    return map;
  }, [projectFiles]);

  const selectedFile = selectedFilePath ? fileMap.get(selectedFilePath) : null;
  const selectedFileHistory = useMemo(() => {
    if (!selectedFilePath) return [];
    return history.map(entry => ({
      content: findFileByPath(entry.state, selectedFilePath)?.content || '',
      timestamp: entry.timestamp,
    })).reverse(); // Newest first
  }, [history, selectedFilePath]);

  const generateCode = useCallback(async (
    prompt: string, 
    isFix: boolean = false, 
    fixContext?: { chatHistory: ChatMessage[] },
    currentSkippedIntegrations: IntegrationId[] = [],
    fileData: { mimeType: string; data: string } | null = null,
  ) => {
    if (!projectFiles) return;
    setAiTask({ status: 'thinking', explanation: '', files: [] });
    setAiSuggestions([]);
    setRequiredIntegrations([]);
    setSqlScript(null);

    const currentProjectState = history[history.length - 1].state;

    try {
      const allFiles = Array.from(fileMap.values())
        .filter((f: FileNode) => f.type === 'file')
        .map((f: FileNode) => `// File: ${f.path}\n\n${f.content}`)
        .join('\n\n---\n\n');
      
      const recentHistory = isFix && fixContext?.chatHistory
        ? fixContext.chatHistory.slice(-4).map(m => `${m.author}: ${m.content}`).join('\n')
        : '';
        
      const fixPreamble = `ATTENTION: Your previous code modifications resulted in a critical error. You must now act as an expert debugger. Analyze the error, review the context, identify the root cause, and provide a fix. The user's last request was: "${lastUserPrompt}". Be specific about what caused the error and how your changes fix it. Your goal is to produce working, error-free code that satisfies the user's original request.`;
      const userPreamble = `User request: "${prompt}"`;
      
      const integrationsPreamble = `The user has configured the following services. If the user's request requires any of these, you MUST use the provided credentials to initialize and integrate the respective SDKs into the application code. Do not show the credentials in the UI.

IMPORTANT: For image fetching services like Pexels, you MUST create a serverless function in the 'src/api/' directory (e.g., 'src/api/images.ts') to handle the API request. This backend function will use the API key to fetch data from the external service and return only the necessary information (like image URLs) to the frontend. NEVER expose the Pexels API key in the frontend code.

**K-Indra Managed Authentication:**
If the user's request involves authentication and they have configured 'kindra_google_auth' or 'kindra_github_auth', you must implement the full sign-in flow.
- Create beautiful, modern, split-screen login pages.
- Implement the backend logic for the OAuth flow in a single file at \`src/api/auth.ts\`. This file must handle requests to start the sign-in process (e.g., at \`/api/auth/google\`) and handle the callback from the provider (e.g., at \`/api/auth/callback/google\`).
- Use the provided credentials (\`clientId\`, \`clientSecret\`) to interact with the provider's APIs.
- The frontend should contain buttons that link to the appropriate backend routes to initiate the sign-in flows.

CONFIGURED INTEGRATIONS:
${Object.keys(integrations).length > 0 ? JSON.stringify(integrations, null, 2) : 'No integrations configured.'}
`;
      const skipPreamble = currentSkippedIntegrations.length > 0
        ? `The user has explicitly chosen to SKIP the following integrations for this request: ${currentSkippedIntegrations.join(', ')}. You MUST implement the requested feature using local storage or the in-memory \`window.db\` instead of these services.`
        : '';
        
      const imagePreamble = fileData ? "The user has provided an image as a UI reference. Use this image to inform the design, layout, and styling of the application components. Analyze the image for color schemes, font styles, component shapes, and overall aesthetic. Replicate the visual style of the image in your code." : "";

      const fullPrompt = `You are a world-class full-stack engineer AI. Your goal is to build beautiful, modern, and functional web applications.
- **Modern Design & Styling:** Implement clean layouts and enhance aesthetics. You can update \`src/styles/theme.ts\` for styling.
- **Backend APIs:** Create serverless backend functions in the 'src/api/' directory. Use the global \`window.db\` for in-memory data persistence. Frontend API calls should handle state gracefully without causing a full preview refresh.
- **Integrations:** You can request that the user configure external services. If a feature requires a service that isn't configured, specify it in the 'requiredIntegrations' field. If the service IS already configured, you must use those credentials to integrate it. If the user has explicitly chosen to skip a service, you must use a local alternative.
- **File Modifications**: Respond with a single \`files\` array. For each file, provide its full \`path\`, full \`content\`, and an \`action\` which must be either 'create' or 'update'. **Only include files that need to be changed to fulfill the request.**

${imagePreamble}

${integrationsPreamble}

${skipPreamble}

${isFix ? fixPreamble : userPreamble}

Here is the current state of all the files in the project:
---
${allFiles}
---

Based on the request, provide an explanation of your plan and the necessary file creations and modifications.
For your explanation, use markdown formatting.
After your explanation, provide a few short (2-4 word) relevant and actionable follow-up suggestions for the user.

Only respond with the JSON object. Do not add any markdown formatting.
`;
      
      const model = fileData ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
      const textPart = { text: fullPrompt };
      const contentRequest = fileData 
          ? { parts: [{ inlineData: { mimeType: fileData.mimeType, data: fileData.data } }, textPart] }
          : fullPrompt;

      const response = await ai.models.generateContent({
        model: model,
        contents: contentRequest,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    explanation: { type: Type.STRING },
                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    requiredIntegrations: {
                        type: Type.ARRAY,
                        description: "An array of services that the user needs to configure for the generated code to work.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING, description: "A unique identifier, e.g., 'supabase_db', 'firebase_auth'." },
                                name: { type: Type.STRING, description: "The human-readable name, e.g., 'Supabase Database'." },
                                description: { type: Type.STRING, description: "A brief explanation of why this integration is needed." }
                            },
                            required: ["id", "name", "description"]
                        }
                    },
                    sqlScriptToRun: {
                        type: Type.OBJECT,
                        description: "A SQL script that the user needs to run in their database editor.",
                        properties: {
                            databaseType: { type: Type.STRING, enum: ['supabase', 'firestore'] },
                            description: { type: Type.STRING, description: "A brief explanation of what the script does." },
                            script: { type: Type.STRING, description: "The SQL script to be executed." }
                        },
                        required: ["databaseType", "description", "script"]
                    },
                    files: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { 
                                path: { type: Type.STRING }, 
                                content: { type: Type.STRING },
                                action: { type: Type.STRING, enum: ['create', 'update'] }
                            },
                            required: ['path', 'content', 'action']
                        }
                    }
                },
                required: ['explanation', 'suggestions']
            },
        }
      });
      
      const responseJson = JSON.parse(response.text);

      if (responseJson.suggestions) {
        setAiSuggestions(responseJson.suggestions);
      }
      if (responseJson.requiredIntegrations && responseJson.requiredIntegrations.length > 0) {
        const newRequirements = responseJson.requiredIntegrations.filter(
          (req: RequiredIntegration) => !isConnected(req.id) && !currentSkippedIntegrations.includes(req.id)
        );
        if (newRequirements.length > 0) {
            setRequiredIntegrations(newRequirements);
            setAiTask(null);
            return; // Halt execution until dependencies are met or skipped
        }
      }
      if (responseJson.sqlScriptToRun) {
        setSqlScript(responseJson.sqlScriptToRun);
      }
      
      const filesToProcess = responseJson.files || [];

      if (filesToProcess.length > 0) {
        setAiTask({
          status: 'generating',
          explanation: responseJson.explanation,
          files: filesToProcess.map((f: any) => ({ path: f.path, status: 'pending' })),
        });
        
        let newProjectState = currentProjectState;

        for (let i = 0; i < filesToProcess.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const file = filesToProcess[i];

          if (file.action === 'update' && fileMap.has(file.path)) {
            newProjectState = updateFileInTree(newProjectState, file.path, file.content);
          } else if (file.action === 'create') {
            newProjectState = createFileInTree(newProjectState, file.path, file.content);
          }
          
          setAiTask(prev => {
            if (!prev) return null;
            const updatedFiles = [...prev.files];
            updatedFiles[i] = { ...updatedFiles[i], status: 'done' };
            return { ...prev, files: updatedFiles };
          });
        }
        
        const newHistoryId = crypto.randomUUID();
        setHistory(prev => [...prev, { state: newProjectState, timestamp: Date.now(), uuid: newHistoryId }]);
        setFixAttempted(false); // Reset after successful generation

        const aiMessage = isFix 
          ? `I believe I've fixed the error. Here's what I changed:\n\n${responseJson.explanation}`
          : responseJson.explanation;
        setChatHistory(prev => [...prev, { author: 'ai', content: aiMessage, historyId: newHistoryId }]);

      } else if (responseJson.explanation) {
          setChatHistory(prev => [...prev, { author: 'ai', content: responseJson.explanation }]);
      }

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setChatHistory(prev => [...prev, { author: 'ai', content: `Sorry, I encountered an error: ${errorMessage}` }]);
    } finally {
      setAiTask(null);
    }
  }, [ai, fileMap, integrations, isConnected, history, lastUserPrompt, projectFiles]);

  const handleSendMessage = useCallback(async (message: string) => {
    if ((!message.trim() && !attachedFile) || aiTask) return;

    const currentAttachedFile = attachedFile;
    setAttachedFile(null); // Clear UI immediately
    setChatInput('');
    setAiSuggestions([]);
    setLastUserPrompt(message);
    setFixAttempted(false);
    setSqlScript(null);
    setSkippedIntegrations([]);

    let fileData: { mimeType: string; data: string } | null = null;
    let attachmentPreview: { name: string; url: string } | undefined = undefined;

    if (currentAttachedFile) {
        if (!currentAttachedFile.type.startsWith('image/')) {
            setChatHistory(prev => [...prev, { author: 'ai', content: "Sorry, I can only accept image files as attachments for now." }]);
            return;
        }
        try {
            const result = await fileToBase64(currentAttachedFile);
            fileData = result;
            attachmentPreview = {
                name: currentAttachedFile.name,
                url: `data:${result.mimeType};base64,${result.data}`
            };
        } catch (error) {
            console.error("Error processing file:", error);
            setChatHistory(prev => [...prev, { author: 'ai', content: "Sorry, there was an error processing your file." }]);
            return;
        }
    }
    
    setChatHistory(prev => [...prev, { author: 'user', content: message, attachment: attachmentPreview }]);
    
    await generateCode(message, false, undefined, [], fileData);
  }, [aiTask, generateCode, attachedFile]);

  const handlePreviewError = useCallback(async (error: string) => {
    if (fixAttempted || aiTask) return;
    setFixAttempted(true);
    setChatHistory(prev => [
      ...prev,
      { author: 'ai', content: `I've detected an error in the preview. I will try to fix it.\n\n**Error:**\n\`\`\`\n${error}\n\`\`\``}
    ]);
    await generateCode(error, true, { chatHistory }, skippedIntegrations);
  }, [fixAttempted, aiTask, generateCode, chatHistory, skippedIntegrations]);
  
  const handleAddToChat = (prompt: string) => setChatInput(prompt);
  const handleSuggestionClick = (suggestion: string) => setChatInput(suggestion);

  const handleConfigureRequest = (integrationId: IntegrationId) => {
    let view: WorkspaceView = 'project';
    if(integrationId.includes('payment')) view = 'payments';
    else if(integrationId.includes('auth')) view = 'auth';
    else if(integrationId.includes('db')) view = 'database';
    else if(integrationId.includes('deployment')) view = 'deployment';
    
    setRightPaneView('workspace');
    setActiveWorkspaceConfig({ view, configId: integrationId });
    setTimeout(() => setActiveWorkspaceConfig(null), 500);
  };

  const handleIntegrationConfigured = useCallback((id: IntegrationId, name: string) => {
      if (id === 'vercel_deployment') {
        setRequiredIntegrations(prev => prev.filter(req => req.id !== id));
        return;
      }
      setRequiredIntegrations(prev => prev.filter(req => req.id !== id));
      
      const userMessageForUi = `I have configured ${name}. Please proceed with the integration.`;
      setChatHistory(prev => [...prev, { author: 'user', content: userMessageForUi }]);
      
      const promptForAi = `The user has now configured ${name}. Please proceed with the original request, which was: "${lastUserPrompt}".`;
      generateCode(promptForAi, false, undefined, skippedIntegrations);
  }, [lastUserPrompt, generateCode, skippedIntegrations]);
  
  const handleSkipIntegration = useCallback(async (integration: RequiredIntegration) => {
      const updatedSkipped = [...skippedIntegrations, integration.id];
      setSkippedIntegrations(updatedSkipped);
      setRequiredIntegrations([]);
      
      const userMessage = `Skip using ${integration.name}.`;
      const aiMessage = `Okay, I will skip using ${integration.name} and use a local alternative instead.`;
      setChatHistory(prev => [...prev, { author: 'user', content: userMessage }, { author: 'ai', content: aiMessage }]);
      
      await generateCode(lastUserPrompt, false, undefined, updatedSkipped);
  }, [lastUserPrompt, generateCode, skippedIntegrations]);

  const handleRevert = useCallback((newContent: string) => {
    if (!selectedFilePath) return;
    const currentState = history[history.length - 1].state;
    const newState = updateFileInTree(currentState, selectedFilePath, newContent);
    setHistory(prev => [...prev, { state: newState, timestamp: Date.now(), uuid: crypto.randomUUID() }]);
  }, [history, selectedFilePath]);

  const handleRestore = useCallback((historyId: string) => {
    const historyEntry = history.find(h => h.uuid === historyId);
    if (historyEntry) {
        setHistory(prev => [...prev, { ...historyEntry, timestamp: Date.now(), uuid: crypto.randomUUID() }]);
        setChatHistory(prev => [...prev, { author: 'ai', content: `Restored project to version from ${new Date(historyEntry.timestamp).toLocaleString()}` }]);
    } else {
        console.error("History ID not found:", historyId);
        setChatHistory(prev => [...prev, { author: 'ai', content: "Sorry, I couldn't find that version to restore." }]);
    }
  }, [history]);

  const handleVisualEdit = (selector: string, prompt: string) => {
    const fullPrompt = `The user wants to visually edit the element identified by the CSS selector "${selector}". Their request is: "${prompt}". Please generate the necessary code changes.`;
    handleSendMessage(fullPrompt);
    setRightPaneView('preview');
  };

  const handleCreateNewProject = () => {
    const newHistoryId = crypto.randomUUID();
    const newProject: Project = {
        id: crypto.randomUUID(),
        name: `New Project ${projects.length + 1}`,
        lastModified: Date.now(),
        projectState: mockProject,
        history: [{ state: mockProject, timestamp: Date.now(), uuid: newHistoryId }],
        chatHistory: [{ author: 'ai', content: "Hello! I can build full-stack apps with a persistent state and a unique style. I'll also automatically fix any errors that occur. Try asking me to 'create a simple todo app'." }],
        previewImage: defaultPreview,
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    setHistory(newProject.history);
    setChatHistory(newProject.chatHistory);
    setSelectedFilePath('src/App.tsx');
    setAppName(`my-cool-app-${Math.floor(Math.random() * 9000) + 1000}`);
    setDeployState({ isDeploying: false, url: null, error: null });
    setView('editor');
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        setCurrentProjectId(project.id);
        setHistory(project.history);
        setChatHistory(project.chatHistory);
        setSelectedFilePath('src/App.tsx');
        setFixAttempted(false);
        setAiTask(null);
        setDeployState({ isDeploying: false, url: null, error: null });
        setAppName(project.name.toLowerCase().replace(/\s+/g, '-'));
        setView('editor');
    }
  };
  
  const handleUpdatePreviewImage = useCallback((projectId: string, imageDataUrl: string) => {
    setProjects(prevProjects => prevProjects.map(p =>
      p.id === projectId ? { ...p, previewImage: imageDataUrl } : p
    ));
  }, []);
  
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };
  
  const handleGoToProjects = () => {
    setCurrentProjectId(null);
    setHistory([]);
    setChatHistory([]);
    setView('projects');
  };

  const compileProjectForDeployment = useCallback(async (): Promise<string> => {
    if (typeof Babel === 'undefined') throw new Error("Babel is not loaded.");

    const requireBoilerplate = `
      const modules = {};
      const externals = { 'react': window.React, 'react-dom': window.ReactDOM, '@supabase/supabase-js': window.supabase };
      const resolvePath = (base, relative) => { const stack = base.split('/'); stack.pop(); const parts = relative.split('/'); for (const part of parts) { if (part === '.') continue; if (part === '..') { if (stack.length > 0) stack.pop(); } else { stack.push(part); } } return stack.join('/'); };
      const findModule = (path) => { const candidates = [path, path + '.ts', path + '.tsx', path + '/index.ts', path + '/index.tsx']; for (const candidate of candidates) { if (modules[candidate]) return modules[candidate]; } return null; };
      const createRequire = (basePath) => {
        const require = (path) => {
          if (externals[path]) return externals[path];
          const resolvedPath = path.startsWith('.') ? resolvePath(basePath, path) : path;
          const module = findModule(resolvedPath);
          if (!module) throw new Error(\`Module not found: "\${path}" from "\${basePath}"\`);
          if (!module.exports) { module.exports = {}; module.factory(module.exports, createRequire(module.path)); }
          return module.exports;
        };
        return require;
      };
      const define = (path, factory) => { modules[path] = { factory, path: path, exports: null }; };
    `;
    const mockFetchScript = `
        const originalFetch = window.fetch;
        window.fetch = (input, options) => {
          const url = typeof input === 'string' ? input : input.url;
          // Only intercept internal API calls, preventing errors with external absolute URLs.
          if (url.startsWith('/api/')) {
            const urlObject = new URL(url, window.location.origin);
            const path = urlObject.pathname;
            const apiPath = 'src' + path;
            let modulePath;
            if (apiPath) { const candidates = [apiPath, apiPath + '.ts', apiPath + '.tsx']; for (const candidate of candidates) { if (modules[candidate]) { modulePath = candidate; break; } } }
            if (modulePath) {
              return new Promise((resolve) => {
                try {
                  const require = createRequire(modulePath);
                  const handler = require(modulePath).default;
                  if (typeof handler !== 'function') throw new Error(\`No default export function found for API route: \${modulePath}\`);
                  const req = { method: options?.method || 'GET', headers: options?.headers || {}, body: options?.body, query: Object.fromEntries(urlObject.searchParams), };
                  let statusCode = 200; let headers = {'Content-Type': 'application/json'};
                  const res = {
                    status: (code) => { statusCode = code; return res; },
                    json: (data) => { resolve(new Response(JSON.stringify(data), { status: statusCode, headers })); },
                    send: (data) => { headers['Content-Type'] = 'text/plain'; resolve(new Response(String(data), { status: statusCode, headers })); }
                  };
                  handler(req, res);
                } catch (e) { console.error('API Route Execution Error:', e); resolve(new Response(JSON.stringify({ error: 'Server Error', message: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} })); }
              });
            }
          }
          return originalFetch(input, options);
        };
      `;

    const compiledModules = Array.from(fileMap.values())
        .filter((file: FileNode) => file.type === 'file' && (file.path.endsWith('.ts') || file.path.endsWith('.tsx')))
        .map((file: FileNode) => {
          const transformed = Babel.transform(file.content || '', {
            presets: ['react', 'typescript'],
            plugins: [['transform-modules-commonjs', { "strictMode": false }]],
            filename: file.path,
          }).code;
          return `define('${file.path}', (exports, require) => { try { ${transformed} } catch(e) { console.error('Error in module ${file.path}:', e); throw e; } });`;
        })
        .join('\n');

    const entryPoint = "src/App.tsx";
    const renderScript = `
          const MainComponent = createRequire('${entryPoint}')('${entryPoint}').default;
          if(!MainComponent) { throw new Error('Could not find default export from ${entryPoint}'); }
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(MainComponent));
        `;
        
    return `${requireBoilerplate}\n${compiledModules}\n${mockFetchScript}\n${renderScript}`;
  }, [fileMap]);

  const handleDeploy = async () => {
    if (!appName.trim() || !projectFiles) return;

    setDeployState({ isDeploying: true, url: null, error: null });

    try {
        const token = integrations.vercel_deployment?.token;
        if (!token) throw new Error("Vercel token not found. Please configure it in the Workspace > Deployment tab.");

        const compiledJs = await compileProjectForDeployment();
        
        const indexHtmlContent = `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>${appName}</title>
                <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
                <style> body { margin: 0; font-family: sans-serif; } </style>
              </head>
              <body>
                <div id="root"></div>
                <script>
                    window.db = {}; // In-memory DB for deployed version
                </script>
                <script>
                    ${compiledJs}
                </script>
              </body>
            </html>
        `;

        const vercelJsonContent = JSON.stringify({
            "builds": [{ "src": "index.html", "use": "@vercel/static" }]
        });
        
        const response = await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: appName,
                files: [
                    { file: 'index.html', data: indexHtmlContent },
                    { file: 'vercel.json', data: vercelJsonContent }
                ],
                projectSettings: {
                    framework: null,
                }
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            const errorMessage = result.error?.code === 'forbidden'
              ? 'Not authorized. Please check your Vercel Personal Access Token.'
              : result.error?.message || 'Failed to deploy. Please check your token and app name.';
            throw new Error(errorMessage);
        }

        const deploymentUrl = `https://${result.url}`;
        setDeployState({ isDeploying: false, url: deploymentUrl, error: null });

    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        setDeployState({ isDeploying: false, url: null, error });
    }
  };


  if (view === 'projects') {
    return <ProjectsListPage 
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateNewProject={handleCreateNewProject}
            onDeleteProject={handleDeleteProject}
           />;
  }
  
  if (!projectFiles) {
    return (
        <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
            <button onClick={handleGoToProjects}>Go to projects</button>
        </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-50 p-4 sm:p-6 md:p-8 flex items-center justify-center font-sans">
      <main className="w-full h-full max-w-screen-2xl bg-white rounded-3xl border border-gray-200 flex overflow-hidden">
        <aside className="w-full max-w-sm hidden lg:flex border-r border-gray-200">
           <ChatPanel 
             messages={chatHistory}
             inputValue={chatInput}
             onInputChange={setChatInput}
             onSendMessage={handleSendMessage}
             aiTask={aiTask}
             suggestions={aiSuggestions}
             onSuggestionClick={handleSuggestionClick}
             requiredIntegrations={requiredIntegrations}
             onConfigureRequest={handleConfigureRequest}
             onSkipIntegration={handleSkipIntegration}
             sqlScript={sqlScript}
             onDismissSqlScript={() => setSqlScript(null)}
             onRestore={handleRestore}
             attachedFile={attachedFile}
             onFileChange={setAttachedFile}
           />
        </aside>

        <section className="flex-1 flex flex-col overflow-hidden">
          <header className="flex-shrink-0 bg-white border-b border-gray-200 p-2 flex items-center justify-between h-[61px]">
            <div className="w-1/4">
                <button onClick={handleGoToProjects} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg ml-2">
                    <span className="material-symbols-outlined text-base">arrow_back_ios_new</span>
                    Projects
                </button>
            </div>
            <div className="w-1/2 flex justify-center">
              <PillToggle
                currentView={rightPaneView}
                onViewChange={setRightPaneView}
              />
            </div>
            <div className="w-1/4 flex justify-end items-center pr-2">
               {/* Deployment UI is now in Workspace */}
            </div>
          </header>
          
          <div className="flex-1 overflow-hidden">
            {rightPaneView === 'preview' && (
              <LivePreview 
                files={fileMap} 
                entryPoint="src/App.tsx" 
                onError={handlePreviewError}
                isLoading={aiTask !== null}
                onAddToChat={handleAddToChat}
                onScreenshot={(dataUrl) => currentProjectId && handleUpdatePreviewImage(currentProjectId, dataUrl)}
              />
            )}
            {rightPaneView === 'code' && (
              <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] h-full">
                <aside className="bg-white border-r border-gray-200 overflow-y-auto">
                  <FileTree node={projectFiles} selectedFilePath={selectedFilePath} onSelectFile={setSelectedFilePath} />
                </aside>
                <section className="flex flex-col overflow-hidden">
                  <CodeViewer 
                    file={selectedFile ?? null}
                    history={selectedFileHistory}
                    onRevert={handleRevert}
                  />
                </section>
              </div>
            )}
            {rightPaneView === 'suggestions' && (
                <SuggestionsPage onAddToChat={handleAddToChat} />
            )}
            {rightPaneView === 'workspace' && (
                <Workspace 
                  files={fileMap} 
                  integrations={integrations}
                  setIntegration={setIntegration}
                  isConnected={isConnected}
                  onIntegrationConfigured={handleIntegrationConfigured}
                  activeConfig={activeWorkspaceConfig}
                  history={history}
                  onRestore={handleRestore}
                  appName={appName}
                  setAppName={setAppName}
                  deployState={deployState}
                  onDeploy={handleDeploy}
                />
            )}
             {rightPaneView === 'visual_edit' && (
              <VisualEditor
                files={fileMap}
                entryPoint="src/App.tsx"
                onError={handlePreviewError}
                onVisualEdit={handleVisualEdit}
                isLoading={aiTask !== null}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
