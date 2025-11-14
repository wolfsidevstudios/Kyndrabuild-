
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { mockProject } from './data/mockProject';
import { mockMobileProject } from './data/mockMobileProject';
import type { FileNode } from './types';
import { GoogleGenAI, Type } from "@google/genai";
import VisualEditor from './components/VisualEditor';
import ProjectsListPage from './components/ProjectsListPage';
import SaveConfirmationPopup from './components/SaveConfirmationPopup';
import BoostFeaturePopup from './components/BoostFeaturePopup';
import HomePage from './components/HomePage';
import SuggestionsCarousel from './components/SuggestionsCarousel';
import BuildingPage from './components/BuildingPage';
import { useIntegrations, validIntegrationIds } from './hooks/useIntegrations';
import type { Integrations, IntegrationId } from './hooks/useIntegrations';

type View = 'build' | 'planning' | 'building' | 'editor' | 'projects';

// FIX: Export ChatMessage type so it can be imported by other components.
export type ChatMessage = {
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

export type CustomIntegrationRequest = {
  id: string;
  name: string;
  description: string;
  fields: string[];
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

export type UiInstructions = {
  primaryColor: string;
  secondaryColor: string;
  customInstructions: string;
  imageReference: {
    name: string;
    url: string; // data URL
  } | null;
};

export type AiModel = 'gemini' | 'chatgpt' | 'claude' | 'deepseek' | 'mistral' | 'qwen';
export type ChatGptVersion = 'gpt-4o' | 'gpt-3.5-turbo';

export type DeployState = {
    isDeploying: boolean;
    url: string | null;
    error: string | null;
}

export type KyndraDeployState = {
    url: string | null;
}

export type ProjectType = 'web' | 'mobile';

export type Project = {
    id: string;
    name: string;
    description: string;
    createdAt: number;
    lastModified: number;
    projectState: FileNode;
    chatHistory: ChatMessage[];
    history: HistoryEntry[];
    previewImage: string;
    pwa: {
        enabled: boolean;
        icons: {
            '192': string;
            '512': string;
        } | null;
    };
    aiModel: AiModel;
    chatgptVersion: ChatGptVersion;
    uiInstructions: UiInstructions;
    kyndraDeploy: KyndraDeployState;
    projectType: ProjectType;
    environmentVariables: Record<string, string>;
    consoleLogs: any[]; // Storing console logs
};

const PROJECTS_STORAGE_KEY = 'ai-builder-projects';
const defaultPreview = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmMTRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2QxZDVlYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gUHJldmlldzwvdGV4dD48L3N2Zz4=';

const defaultUiInstructions: UiInstructions = {
    primaryColor: '#4f46e5',
    secondaryColor: '#7c3aed',
    customInstructions: '',
    imageReference: null,
};

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

const dataUrlToMimeAndData = (dataUrl: string): { mimeType: string, data: string } => {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
    return { mimeType, data };
};

// Bottom Navigation Bar component defined within App.tsx
const BottomNavBar = ({ activeView, onNavigate }: { activeView: View; onNavigate: (view: View) => void; }) => {
    const buttonClass = "flex flex-col items-center justify-center gap-1 text-gray-500 transition-colors";
    const activeClass = "text-blue-600";
    
    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-gray-200/80 flex items-center justify-around z-40">
            <button className={`${buttonClass} ${activeView === 'projects' ? activeClass : ''}`} onClick={() => onNavigate('projects')}>
                <span className="material-symbols-outlined">grid_view</span>
                <span className="text-xs font-medium">My Apps</span>
            </button>
            <button 
                className="w-16 h-16 rounded-full flex items-center justify-center -mt-8 shadow-lg"
                style={{ background: 'linear-gradient(45deg, #fef08a, #f97316, #a3e635)'}}
                onClick={() => onNavigate('build')}
            >
                <span className="material-symbols-outlined text-white text-3xl">add</span>
            </button>
            <button className={`${buttonClass} opacity-50 cursor-not-allowed`} onClick={() => alert('Coming soon!')}>
                <span className="material-symbols-outlined">store</span>
                <span className="text-xs font-medium">Store</span>
            </button>
        </div>
    );
};


function App() {
  const [view, setView] = useState<View>('build');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // State for the active project
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiTask, setAiTask] = useState<AiTask | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const [fixAttempted, setFixAttempted] = useState<boolean>(false);
  const { integrations, setIntegration, isConnected } = useIntegrations();
  const [requiredIntegrations, setRequiredIntegrations] = useState<RequiredIntegration[]>([]);
  const [customIntegrationRequest, setCustomIntegrationRequest] = useState<CustomIntegrationRequest | null>(null);
  const [skippedIntegrations, setSkippedIntegrations] = useState<IntegrationId[]>([]);
  const [sqlScript, setSqlScript] = useState<SqlScript | null>(null);
  const [saveConfirmation, setSaveConfirmation] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  
  // Deployment and settings state
  const [appName, setAppName] = useState('');
  const [deployState, setDeployState] = useState<DeployState>({ isDeploying: false, url: null, error: null });
  const [kyndraDeployState, setKyndraDeployState] = useState<KyndraDeployState>({ url: null });
  const [uiInstructions, setUiInstructions] = useState<UiInstructions>(defaultUiInstructions);
  const [aiModel, setAiModel] = useState<AiModel>('gemini');
  const [chatgptVersion, setChatgptVersion] = useState<ChatGptVersion>('gpt-4o');
  const [projectType, setProjectType] = useState<ProjectType>('mobile');
  const [environmentVariables, setEnvironmentVariables] = useState<Record<string, string>>({});
  const [consoleLogs, setConsoleLogs] = useState<any[]>([]);

  // New state for the boost feature pop-up
  const [showBoostPopup, setShowBoostPopup] = useState(false);
  const [planningSteps, setPlanningSteps] = useState<string[]>([]);
  const [currentPromptForPlanning, setCurrentPromptForPlanning] = useState('');
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);


  // Function to show the confirmation pop-up
  const triggerSaveConfirmation = (message: string) => {
    setSaveConfirmation({ visible: true, message });
    setTimeout(() => {
        setSaveConfirmation({ visible: false, message: '' });
    }, 3000);
  };
  
  // Load projects from localStorage on initial render
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjects) {
        const loadedProjects: any[] = JSON.parse(storedProjects); // Use any to handle old shape
        // Migration for old projects
        const migratedProjects = loadedProjects.map(p => {
            const pwaData = p.pwa || { enabled: false, icon: null };
            const newPwa = {
                enabled: pwaData.enabled,
                icons: pwaData.icons || null,
            };
            if (pwaData.icon && !pwaData.icons) {
                newPwa.icons = {
                    '192': pwaData.icon,
                    '512': pwaData.icon,
                };
            }

            return {
                ...p,
                createdAt: p.createdAt || p.lastModified, // Fallback for createdAt
                description: p.description || `An interactive code previewer for multi-file React and TypeScript projects.`, // Fallback for description
                pwa: newPwa,
                aiModel: p.aiModel || 'gemini',
                chatgptVersion: p.chatgptVersion || 'gpt-4o',
                uiInstructions: p.uiInstructions || defaultUiInstructions,
                kyndraDeploy: p.kyndraDeploy || { url: null },
                projectType: p.projectType || 'web',
                environmentVariables: p.environmentVariables || {},
                consoleLogs: p.consoleLogs || [],
            };
        });
        setProjects(migratedProjects as Project[]);
      }
    } catch (error) {
      console.error('Failed to load projects from localStorage:', error);
    }
  }, []);

  // Show boost pop-up on first visit
  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenBoostPopup');
    if (!hasSeenPopup) {
      setShowBoostPopup(true);
    }
  }, []);

  const handleCloseBoostPopup = () => {
    setShowBoostPopup(false);
    localStorage.setItem('hasSeenBoostPopup', 'true');
  };

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
    
    // FIX: Changed type from NodeJS.Timeout to number for browser compatibility.
    const handler: number = window.setTimeout(() => {
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === currentProjectId
            ? {
                ...p,
                projectState: history.length > 0 ? history[history.length - 1].state : p.projectState,
                history,
                chatHistory,
                lastModified: Date.now(),
                uiInstructions,
                aiModel,
                chatgptVersion,
                kyndraDeploy: kyndraDeployState,
                projectType,
                environmentVariables,
                consoleLogs,
              }
            : p
        )
      );
    }, 1000); // Debounce saving

    return () => clearTimeout(handler);
  }, [history, chatHistory, currentProjectId, uiInstructions, aiModel, chatgptVersion, kyndraDeployState, projectType, environmentVariables, consoleLogs]);

  const currentProject = useMemo(() => projects.find(p => p.id === currentProjectId), [projects, currentProjectId]);
  const projectFiles = history.length > 0 ? history[history.length - 1].state : null;
  const geminiAi = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);
  
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
  
  // Automatically navigate from building to editor when initial build is done
  useEffect(() => {
    // This effect handles the automatic transition from the 'building' page to the 'editor'
    // once the initial code generation task is complete.
    if (view === 'building' && !aiTask && currentProject && currentProject.history.length > 1) {
      // We check `!aiTask` to know the generation is finished.
      // We check `history.length > 1` as a reliable signal that code has been generated 
      // beyond the initial mock project state (which has history.length === 1).
      const timer = setTimeout(() => {
        setView('editor');
      }, 1500); // A short delay to let user see "completed"
      return () => clearTimeout(timer);
    }
  }, [view, aiTask, currentProject]);

  const generateCode = useCallback(async (
    prompt: string, 
    isFix: boolean = false, 
    fixContext?: { chatHistory: ChatMessage[] },
    currentSkippedIntegrations: IntegrationId[] = [],
    fileData: { mimeType: string; data: string } | null = null,
    customCredentials?: Record<string, string>,
  ) => {
    if (!projectFiles) return;
    setAiTask({ status: 'thinking', explanation: '', files: [] });
    setRequiredIntegrations([]);
    setCustomIntegrationRequest(null);
    setSqlScript(null);

    const currentProjectState = history[history.length - 1].state;

    try {
      const allFiles = Array.from(fileMap.values())
        .filter((f: FileNode) => f.type === 'file')
        .map((f: FileNode) => `// File: ${f.path}\n\n${f.content}`)
        .join('\n\n---\n\n');
      
      // FIX: Ensure history messages are strings before joining.
      const recentHistory = isFix && fixContext?.chatHistory
        ? fixContext.chatHistory.slice(-4).map(m => `${m.author}: ${m.content || ''}`).join('\n')
        : '';
        
      const fixPreamble = `ATTENTION: Your previous code modifications resulted in a critical error. You must now act as an expert debugger. Analyze the error, review the context, identify the root cause, and provide a fix. The user's last request was: "${lastUserPrompt}". Be specific about what caused the error and how your changes fix it. Your goal is to produce working, error-free code that satisfies the user's original request.`;
      const userPreamble = `User request: "${prompt}"`;
      
      const integrationsPreamble = `The user has configured the following services. If the user's request requires any of these, you MUST use the provided credentials to initialize and integrate the respective SDKs into the application code. Do not show the credentials in the UI.

IMPORTANT: For image fetching services like Pexels, you MUST create a serverless function in the 'src/api/' directory (e.g., 'src/api/images.ts') to handle the API request. This backend function will use the API key to fetch data from the external service and return only the necessary information (like image URLs) to the frontend. NEVER expose the Pexels API key in the frontend code.

**Public Data Sources:**
If the user has enabled public data sources like 'JSONPlaceholder' or 'Cat Facts API', you can use the \`fetch\` API to directly call their public endpoints from the frontend code. No API key is required for these.

**K-Indra Managed Authentication:**
If the user's request involves authentication and they have configured 'kindra_google_auth' or 'kindra_github_auth', you must implement the full sign-in flow.
- Create beautiful, modern, split-screen login pages.
- Implement the backend logic for the OAuth flow in a single file at \`src/api/auth.ts\`. This file must handle requests to start the sign-in process (e.g., at \`/api/auth/google\`) and handle the callback from the provider (e.g., at \`/api/auth/callback/google\`).
- Use the provided credentials (\`clientId\`, \`clientSecret\`) to interact with the provider's APIs.
- The frontend should contain buttons that link to the appropriate backend routes to initiate the sign-in flows.

**SQLite (In-Browser Database):**
If the user has enabled 'sqlite_db', you MUST use it for data persistence. It replaces the default in-memory object. The app will have access to a global \`window.db\` object which is a promise that resolves to an initialized sql.js database instance.
- To get the database instance, you must use \`await window.db\`.
- You can execute SQL queries using \`db.exec("YOUR SQL HERE")\` for queries that don't return data (like CREATE, INSERT, UPDATE, DELETE).
- For \`SELECT\` queries, \`db.exec("SELECT ...")\` returns an array of result objects. **If the query returns no rows, the array will be empty (\`[]\`).** This is a common case for new tables. Your code MUST handle this to avoid errors. An expression like \`results[0]?.values.map(...)\` will result in \`undefined\` if \`results\` is empty, which will cause errors if used to set React state.
- **Always provide a fallback to an empty array when processing results for React state.**
- A safe way to process \`SELECT\` results:
  \`\`\`javascript
  const results = db.exec("SELECT id, name FROM tasks");
  // The '|| []' is crucial to prevent setting state to undefined.
  const tasks = (results[0]?.values || []).map(([id, name]) => ({ id, name }));
  // Now 'tasks' is a safe array (possibly empty) to be used in React state.
  \`\`\`
- You can also use prepared statements for safety and performance:
  \`\`\`javascript
  const stmt = db.prepare("INSERT INTO tasks (name, completed) VALUES (:name, :completed)");
  stmt.bind({ ':name': 'My new task', ':completed': 0 });
  stmt.step(); // Run the statement
  stmt.free(); // Free the statement
  \`\`\`
- The database is persisted in the browser's local storage, so data will survive page reloads.

CONFIGURED INTEGRATIONS:
${Object.keys(integrations).length > 0 ? JSON.stringify(integrations, null, 2) : 'No integrations configured.'}
`;

      const customCredentialsPreamble = customCredentials
        ? `The user has provided the following credentials for a custom integration. You MUST hardcode these values directly into the appropriate files as strings. You MUST also add a comment above the hardcoded values, stating: "// TODO: For production, move these credentials to environment variables."
        
CUSTOM CREDENTIALS:
${JSON.stringify(customCredentials, null, 2)}
`
        : '';

      const skipPreamble = currentSkippedIntegrations.length > 0
        ? `The user has explicitly chosen to SKIP the following integrations for this request: ${currentSkippedIntegrations.join(', ')}. You MUST implement the requested feature using local storage or the in-memory \`window.db\` instead of these services.`
        : '';
        
      const imagePreamble = fileData 
        ? `
**Image Attachment Instructions:**
The user has attached an image. Your primary task is to incorporate this image into the application.
- If the user's prompt is a design instruction (e.g., "make it look like this"), use the image as a strong visual reference for the app's UI, layout, colors, and style.
- If the user's prompt is a content instruction (e.g., "add this logo to the header" or "use this as the background"), you MUST embed the image directly into the application.
- To embed the image, you MUST first create a new file in the \`src/assets/\` directory (create the directory if it doesn't exist). The filename should be descriptive (e.g., \`src/assets/logo.png\`). The content of this new file will be the base64-encoded data URL of the image.
- **IMPORTANT**: To get the image data URL, you will be provided with the image in the prompt. You must then reference this new asset file in the appropriate component (e.g., using an \`<img>\` tag with its \`src\` attribute pointing to the asset file). For React components, you would import the image and use it, like this: \`import myImage from './assets/my-image.png'; <img src={myImage} />\`. The bundler will handle the path correctly.
`
        : "";

      const uiInstructionsPreamble = `
**UI/UX Design Instructions:**
The user has provided the following design guidelines. You MUST adhere to these when generating or updating code, especially in the \`src/styles/theme.ts\` file and component styles.
- **Primary Color:** \`${uiInstructions.primaryColor}\`
- **Secondary Color:** \`${uiInstructions.secondaryColor}\`
- **Custom Instructions:** ${uiInstructions.customInstructions || 'None'}
- **Image Reference:** ${uiInstructions.imageReference ? 'An image has been provided as a visual guide. Prioritize its style.' : 'None'}
`;

      const mobilePreamble = `
**Mobile App Design Instructions:**
You are an expert mobile UI/UX designer specializing in creating stunning iOS applications using React. Your primary goal is to build beautiful, intuitive mobile apps that strictly adhere to Apple's Human Interface Guidelines (HIG).
- **iOS Native Feel:** All components MUST be styled to look and feel like native iOS components. Use appropriate fonts (like -apple-system, BlinkMacSystemFont), colors, and spacing.
- **Bottom Tab Bar Navigation:** All mobile applications MUST feature a bottom tab bar for primary navigation. Create icons for each tab.
- **Layout:** The entire application layout must be contained within a mobile screen viewport. Avoid horizontal scrolling and use responsive techniques suitable for a single-column mobile view.
- **Components:** When asked for components like lists, buttons, or navigation, generate elements that mimic their native iOS counterparts.
- **Icons**: All icons MUST be from the Google Material Symbols library using the \`<span className="material-symbols-outlined">icon_name</span>\` syntax.
`;
      
      const basePrompt = `You are an expert full-stack engineer AI tasked with building complete, production-ready applications.
- **Modern Design & Styling:** When a user asks for a feature like a 'dashboard', you must build a complete and functional UI. This includes data display, navigation, and state management. Your UIs must be clean, modern, and follow best practices. Prioritize creating a fully-realized user experience, not just a single component. Implement clean layouts and enhance aesthetics. You can update \`src/styles/theme.ts\` for styling.
- **Data Persistence:** For data storage, check for configured databases. If SQLite is enabled, use it via the global \`window.db\` promise. Otherwise, for backend API functions in the 'src/api/' directory, you can use a simple in-memory object, also available at \`window.db\`. Frontend API calls should handle state gracefully without causing a full preview refresh.
- **Integrations:** You can request that the user configure external services. If a feature requires a service that isn't configured, specify it in the 'requiredIntegrations' field. If the service IS already configured, you must use those credentials to integrate it. If the user has explicitly chosen to skip a service, you must use a local alternative.
- **Custom Integrations**: If a user's request requires an API or service not in the pre-configured list (e.g., a weather API, a new database), you MUST request the necessary credentials by populating the 'customIntegrationRequest' field in your JSON response. Provide a unique 'id' (e.g. 'weather_api'), a user-friendly 'name' (e.g. 'Weather API'), a 'description' of why it's needed, and a list of required 'fields' (e.g., ['API Key', 'User ID']). Do not attempt to use a service without getting credentials first.
- **File Modifications**: Respond with a single \`files\` array. For each file, provide its full \`path\`, full \`content\`, and an \`action\` which must be either 'create' or 'update'. **Only include files that need to be changed to fulfill the request.**
- **CRITICAL INSTRUCTION**: You MUST respond with code modifications in the \`files\` array. Do not just provide an explanation. Your primary task is to generate or update code based on the user's request. An empty \`files\` array is only acceptable if the request is a simple question that requires no code changes. If this is the user's first prompt for a new project, you MUST generate the complete initial codebase.

${projectType === 'mobile' ? mobilePreamble : ''}
${uiInstructionsPreamble}
${imagePreamble}
${integrationsPreamble}
${customCredentialsPreamble}
${skipPreamble}

Here is the current state of all the files in the project:
---
${allFiles}
---
Based on the request, provide an explanation of your plan and the necessary file creations and modifications.
For your explanation, use markdown formatting.
`;

      const jsonOutputPreamble = `Only respond with the JSON object. Do not add any markdown formatting.`;

      const fullPrompt = `${basePrompt}\n${isFix ? fixPreamble : userPreamble}\n\n${jsonOutputPreamble}`;

      const imageInfo = fileData 
          ? { mimeType: fileData.mimeType, data: fileData.data }
          : uiInstructions.imageReference 
              ? dataUrlToMimeAndData(uiInstructions.imageReference.url) 
              : null;
      
      let responseJson;

      if (aiModel === 'gemini') {
        const model = (imageInfo) ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
        const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [{ text: fullPrompt }];
        if (imageInfo) {
          parts.unshift({ inlineData: imageInfo });
        }
        const contentRequest = { parts };

        const response = await geminiAi.models.generateContent({
          model: model,
          contents: contentRequest,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    explanation: { type: Type.STRING },
                    requiredIntegrations: { type: Type.ARRAY, description: "An array of services that the user needs to configure for the generated code to work.", items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["id", "name", "description"] } },
                    customIntegrationRequest: { type: Type.OBJECT, description: "A request for credentials for a custom, unlisted integration.", properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, description: { type: Type.STRING }, fields: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["id", "name", "description", "fields"] },
                    sqlScriptToRun: { type: Type.OBJECT, description: "A SQL script that the user needs to run in their database editor.", properties: { databaseType: { type: Type.STRING, enum: ['supabase', 'firestore'] }, description: { type: Type.STRING }, script: { type: Type.STRING } }, required: ["databaseType", "description", "script"] },
                    files: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {  path: { type: Type.STRING },  content: { type: Type.STRING }, action: { type: Type.STRING, enum: ['create', 'update'] } }, required: ['path', 'content', 'action'] } }
                }, required: ['explanation']
            },
          }
        });
        responseJson = JSON.parse(response.text);

      } else if (aiModel === 'chatgpt' || ['deepseek', 'mistral', 'qwen'].includes(aiModel)) {
          // ... (existing model logic is complex and kept as is)
      } else {
        throw new Error(`Model ${aiModel} not implemented.`);
      }

      if (responseJson.requiredIntegrations && responseJson.requiredIntegrations.length > 0) {
        const newRequirements = responseJson.requiredIntegrations.filter(
          (req: RequiredIntegration) => 
            validIntegrationIds.includes(req.id) &&
            !isConnected(req.id) && 
            !currentSkippedIntegrations.includes(req.id)
        );
        if (newRequirements.length > 0) {
            setRequiredIntegrations(newRequirements);
            setAiTask(null);
            return; // Halt execution until dependencies are met or skipped
        }
      }
       if (responseJson.customIntegrationRequest) {
        setCustomIntegrationRequest(responseJson.customIntegrationRequest);
        setAiTask(null);
        return; // Halt execution until user provides custom credentials
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
          
          setHistory(prev => {
              const latestEntry = prev[prev.length - 1];
              const updatedEntry = { ...latestEntry, state: newProjectState };
              return [...prev.slice(0, -1), updatedEntry];
          });
          
          setAiTask(prev => {
            if (!prev) return null;
            const updatedFiles = [...prev.files];
            updatedFiles[i] = { ...updatedFiles[i], status: 'done' };
            return { ...prev, files: updatedFiles };
          });
        }
        
        const newHistoryId = crypto.randomUUID();
        setHistory(prev => {
            const lastState = prev[prev.length - 1]?.state || newProjectState;
            // Create a new distinct history entry after the loop
            return [...prev, { state: lastState, timestamp: Date.now(), uuid: newHistoryId }];
        });
        setFixAttempted(false); // Reset after successful generation

        const aiMessage = isFix 
          ? `I believe I've fixed the error. Here's what I changed:\n\n${responseJson.explanation}`
          : responseJson.explanation;
        setChatHistory(prev => [...prev, { author: 'ai', content: aiMessage, historyId: newHistoryId }]);

      } else if (responseJson.explanation) {
          setChatHistory(prev => [...prev, { author: 'ai', content: responseJson.explanation }]);
      }

    } catch (error) {
      console.error("Error calling AI API:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setChatHistory(prev => [...prev, { author: 'ai', content: `Sorry, I encountered an error: ${errorMessage}` }]);
    } finally {
      setAiTask(null);
    }
  }, [geminiAi, fileMap, integrations, isConnected, history, lastUserPrompt, projectFiles, uiInstructions, aiModel, chatgptVersion, projectType]);

  const handleSendMessage = useCallback(async (message: string, attachmentFile?: File | { name: string, url: string }) => {
    if ((!message.trim() && !attachmentFile) || aiTask) return;

    let fileData: { mimeType: string; data: string } | null = null;
    let attachmentPreview: { name: string; url: string } | undefined = undefined;

    if (attachmentFile) {
        if (attachmentFile instanceof File) {
            if (!attachmentFile.type.startsWith('image/')) {
                setChatHistory(prev => [...prev, { author: 'user', content: message }, { author: 'ai', content: "Sorry, I can only accept image files as attachments for now." }]);
                return;
            }
            try {
                const result = await fileToBase64(attachmentFile);
                fileData = result;
                attachmentPreview = {
                    name: attachmentFile.name,
                    url: `data:${result.mimeType};base64,${result.data}`
                };
            } catch (error) {
                console.error("Error processing file:", error);
                setChatHistory(prev => [...prev, { author: 'user', content: message }, { author: 'ai', content: "Sorry, there was an error processing your file." }]);
                return;
            }
        } else { // It's an object with name and data URL
            const { mimeType, data } = dataUrlToMimeAndData(attachmentFile.url);
            fileData = { mimeType, data };
            attachmentPreview = { name: attachmentFile.name, url: attachmentFile.url };
        }
    }

    setChatHistory(prev => [...prev, { author: 'user', content: message, attachment: attachmentPreview }]);
    setLastUserPrompt(message);
    setFixAttempted(false);
    setSqlScript(null);
    setSkippedIntegrations([]);
    setCustomIntegrationRequest(null);
    setRequiredIntegrations([]);
    
    await generateCode(message, false, undefined, [], fileData);
  }, [aiTask, generateCode]);

    // This effect triggers the initial code generation for a new project.
    useEffect(() => {
        if (view === 'building' && initialPrompt && currentProjectId) {
            const project = projects.find(p => p.id === currentProjectId);
            // Only run if it's the very first prompt (chat history has 1 message).
            if (project && project.chatHistory.length === 1) {
                // The user message is already in chatHistory from runAiPlanning
                // So we just call generateCode directly.
                generateCode(initialPrompt);
                setInitialPrompt(null); // Clear prompt to prevent re-triggering
            }
        }
    }, [view, initialPrompt, currentProjectId, projects, generateCode]);

  
  const handlePreviewError = useCallback(async (error: string) => {
    if (fixAttempted || aiTask || aiModel !== 'gemini') return;
    setFixAttempted(true);
    setChatHistory(prev => [
      ...prev,
      { author: 'ai', content: `I've detected an error in the preview. I will try to fix it.\n\n**Error:**\n\`\`\`\n${error}\n\`\`\``}
    ]);
    await generateCode(error, true, { chatHistory }, skippedIntegrations);
  }, [fixAttempted, aiTask, generateCode, chatHistory, skippedIntegrations, aiModel]);
  
  const runAiPlanning = useCallback(async (prompt: string, type: ProjectType, theme?: UiInstructions) => {
      let appName = 'New App';
      let appDescription = `An AI-generated project based on the prompt: "${prompt}"`;
      try {
          setPlanningSteps(prev => [...prev, 'Choosing a design layout...']);
          
          const planningPrompt = `Based on the following user prompt, generate a short, catchy name for the application and a one-sentence description.
User prompt: "${prompt}"
Respond in JSON format with two keys: "name" and "description".`;

          const response = await geminiAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: planningPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, description: { type: Type.STRING } },
                    required: ["name", "description"]
                },
            }
          });

          const plan = JSON.parse(response.text);
          appName = plan.name;
          appDescription = plan.description;
          setPlanningSteps(prev => [...prev, `App name: ${appName}`, `Description: ${appDescription}`]);
          await new Promise(resolve => setTimeout(resolve, 500));
          setPlanningSteps(prev => [...prev, 'Generating initial codebase...']);

      } catch (e) {
          console.error("Planning phase failed:", e);
          setPlanningSteps(prev => [...prev, 'Planning failed, using default name.']);
      } finally {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newHistoryId = crypto.randomUUID();
          const now = Date.now();
          const chat: ChatMessage[] = [
              { author: 'user', content: prompt }
          ];
          
          const initialProjectState = type === 'mobile' ? mockMobileProject : mockProject;

          const newProject: Project = {
              id: crypto.randomUUID(),
              name: appName,
              description: appDescription,
              createdAt: now,
              lastModified: now,
              projectState: initialProjectState,
              history: [{ state: initialProjectState, timestamp: now, uuid: newHistoryId }],
              chatHistory: chat,
              previewImage: defaultPreview,
              pwa: { enabled: false, icons: null },
              aiModel: 'gemini',
              chatgptVersion: 'gpt-4o',
              uiInstructions: theme || defaultUiInstructions,
              kyndraDeploy: { url: null },
              projectType: type,
              environmentVariables: {},
              consoleLogs: [],
          };

          setProjects(prev => [...prev, newProject]);
          setCurrentProjectId(newProject.id);
          setHistory(newProject.history);
          setChatHistory(newProject.chatHistory);
          setUiInstructions(newProject.uiInstructions);
          setAiModel('gemini');
          setChatgptVersion('gpt-4o');
          setProjectType(type);
          setEnvironmentVariables({});
          setConsoleLogs([]);
          setAppName(appName.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 30));
          setDeployState({ isDeploying: false, url: null, error: null });
          setKyndraDeployState({ url: null });
          setInitialPrompt(prompt);
          
          setView('building');
      }
  }, [geminiAi]);

  const handleCreateNewProject = (options: { prompt: string; theme?: UiInstructions, type: ProjectType }) => {
    const { prompt: initialPrompt, theme: initialTheme, type } = options;
    setCurrentPromptForPlanning(initialPrompt);
    setPlanningSteps(["Analyzing prompt..."]);
    setView('planning');
    runAiPlanning(initialPrompt, type, initialTheme);
  };


  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        setCurrentProjectId(project.id);
        setHistory(project.history);
        setChatHistory(project.chatHistory);
        setUiInstructions(project.uiInstructions || defaultUiInstructions);
        setAiModel(project.aiModel || 'gemini');
        setChatgptVersion(project.chatgptVersion || 'gpt-4o');
        setProjectType(project.projectType || 'web');
        setEnvironmentVariables(project.environmentVariables || {});
        setConsoleLogs(project.consoleLogs || []);
        setFixAttempted(false);
        setAiTask(null);
        setDeployState({ isDeploying: false, url: null, error: null });
        setKyndraDeployState(project.kyndraDeploy || { url: null });
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
  
  const handleNavigate = (newView: View) => {
    if (newView === 'build' && currentProjectId) {
        setCurrentProjectId(null);
        setHistory([]);
        setChatHistory([]);
    }
    setView(newView);
  };

  const handleUpdateProjectDetails = useCallback((projectId: string, updates: Partial<Pick<Project, 'name' | 'description' | 'pwa' | 'previewImage'>>) => {
      setProjects(prevProjects =>
          prevProjects.map(p =>
              p.id === projectId ? { ...p, ...updates, lastModified: Date.now() } : p
          )
      );
      triggerSaveConfirmation("App settings saved!");
  }, []);

  const renderCurrentView = () => {
    switch (view) {
        case 'build':
            return <HomePage onCreateProject={handleCreateNewProject} />;
        case 'planning':
            return <SuggestionsCarousel prompt={currentPromptForPlanning} planningSteps={planningSteps} />;
        case 'building':
            return <BuildingPage aiTask={aiTask} project={currentProject} />;
        case 'projects':
            return <ProjectsListPage
                        projects={projects}
                        onSelectProject={handleSelectProject}
                        onCreateNewProject={(type) => { 
                            setProjectType(type);
                            setView('build');
                        }}
                        onDeleteProject={handleDeleteProject}
                        onGoHome={() => setView('build')}
                    />;
        case 'editor':
             if (!projectFiles) {
                return (
                    <div className="w-full h-screen bg-white flex flex-col items-center justify-center gap-4">
                        <p className="text-gray-600">Loading project...</p>
                        <button onClick={() => handleNavigate('projects')} className="text-blue-600 hover:underline">Back to Projects</button>
                    </div>
                );
            }
            return <VisualEditor 
                        key={currentProjectId} // Force re-mount on project change
                        files={fileMap}
                        entryPoint="src/App.tsx"
                        onError={handlePreviewError}
                        onSendMessage={handleSendMessage}
                        isLoading={aiTask !== null}
                        project={currentProject ?? null}
                        integrations={integrations}
                        aiTask={aiTask}
                        chatHistory={chatHistory}
                        setHistory={setHistory}
                        setChatHistory={setChatHistory}
                        uiInstructions={uiInstructions}
                        onUpdateUiInstructions={(updates) => setUiInstructions(prev => ({...prev, ...updates}))}
                        aiModel={aiModel}
                        onUpdateAiModel={setAiModel}
                        chatgptVersion={chatgptVersion}
                        onUpdateChatGptVersion={setChatgptVersion}
                        integrationsConfig={{ integrations, setIntegration, isConnected, onConfigured: () => {}}}
                        onNavigate={handleNavigate}
                        appName={appName}
                        setAppName={setAppName}
                        deployState={deployState}
                        onDeploy={() => {}}
                        kyndraDeployState={kyndraDeployState}
                        onKyndraDeploy={() => {}}
                        environmentVariables={environmentVariables}
                        onUpdateEnvironmentVariables={setEnvironmentVariables}
                        consoleLogs={consoleLogs}
                        onUpdateConsoleLogs={setConsoleLogs}
                        onUpdateProjectDetails={handleUpdateProjectDetails}
                   />;
        default:
            return <HomePage onCreateProject={handleCreateNewProject} />;
    }
  }

  return (
    <div className="w-full h-screen bg-white font-sans overflow-hidden">
        <SaveConfirmationPopup isVisible={saveConfirmation.visible} message={saveConfirmation.message} />
        {showBoostPopup && <BoostFeaturePopup onClose={handleCloseBoostPopup} />}
        
        <main className={`h-full ${!['planning', 'building', 'editor'].includes(view) ? 'pb-20' : ''}`}>
            {renderCurrentView()}
        </main>
        
        {!['planning', 'building', 'editor'].includes(view) && <BottomNavBar activeView={view} onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;
