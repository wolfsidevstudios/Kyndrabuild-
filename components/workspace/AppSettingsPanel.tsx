
import React, { useState, useEffect, useRef } from 'react';
import type { Project, DeployState } from '../../../App';
import ImageIcon from '../icons/ImageIcon';
import GoogleSearchPreview from './GoogleSearchPreview';

// Helper to read file as data URL
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            return reject(new Error('File is too large. Please use an image under 2MB.'));
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Helper to resize an image from a data URL
const resizeImage = (dataUrl: string, size: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));
            ctx.drawImage(img, 0, 0, size, size);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
};


const AppAppearance = ({ project, onUpdateDetails }: { project: Project; onUpdateDetails: (projectId: string, updates: Partial<Pick<Project, 'pwa' | 'previewImage'>>) => void; }) => {
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const iconInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'icon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        try {
            const dataUrl = await fileToDataUrl(file);
            if (type === 'thumbnail') {
                onUpdateDetails(project.id, { previewImage: dataUrl });
            } else {
                const icon192 = await resizeImage(dataUrl, 192);
                const icon512 = await resizeImage(dataUrl, 512);
                onUpdateDetails(project.id, { pwa: { ...project.pwa, icons: { '192': icon192, '512': icon512 } } });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to read file.');
        } finally {
            // Reset input value to allow re-uploading the same file
            e.target.value = '';
        }
    };

    const handleTogglePwa = (enabled: boolean) => {
        onUpdateDetails(project.id, { pwa: { ...project.pwa, enabled } });
    };

    return (
        <div className="bg-gray-100 p-4 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 px-2">App Appearance & PWA</h3>
            {error && <p className="text-sm text-red-600 mb-4 px-2">{error}</p>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Column: Editors */}
                <div className="space-y-6">
                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 px-2">Project Thumbnail</label>
                        <div className="aspect-[16/10] bg-white rounded-lg overflow-hidden relative group border border-gray-200">
                            <img src={project.previewImage} alt="Project thumbnail" className="w-full h-full object-cover"/>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <input type="file" accept="image/png, image/jpeg" ref={thumbnailInputRef} onChange={(e) => handleFileUpload(e, 'thumbnail')} className="hidden" />
                                <button onClick={() => thumbnailInputRef.current?.click()} className="bg-white/90 text-gray-900 py-1.5 px-4 rounded-full text-sm font-semibold hover:bg-white">
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* App Icon & PWA Toggle */}
                    <div className="space-y-6 px-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">App Icon</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                                    {project.pwa?.icons?.['512'] ? (
                                        <img src={project.pwa.icons['512']} alt="App icon" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <input type="file" accept="image/png" ref={iconInputRef} onChange={(e) => handleFileUpload(e, 'icon')} className="hidden" />
                                    <button onClick={() => iconInputRef.current?.click()} className="bg-white border border-gray-200 text-gray-800 py-1.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                                        Upload Icon
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">Recommended: 512x512 PNG</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Make Installable (PWA)</label>
                            <p className="text-xs text-gray-500 mb-3">Allows users to install your app on their device for an integrated, offline-capable experience.</p>
                            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
                                <span className="text-sm text-gray-800">Enable PWA Support</span>
                                <button onClick={() => handleTogglePwa(!project.pwa.enabled)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 ${project.pwa.enabled ? 'bg-gray-800' : 'bg-gray-300'}`}>
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${project.pwa.enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Right Column: Preview */}
                 <div>
                    <GoogleSearchPreview project={project} />
                 </div>
            </div>
        </div>
    );
};

interface AppSettingsPanelProps {
    project: Project | null;
    onUpdateDetails: (projectId: string, updates: Partial<Pick<Project, 'name' | 'description' | 'pwa' | 'previewImage'>>) => void;
}

const AppSettingsPanel: React.FC<AppSettingsPanelProps> = ({ project, onUpdateDetails }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    }
  }, [project]);
  
  useEffect(() => {
    if (isEditingName) {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingDescription) {
        descriptionTextareaRef.current?.focus();
        descriptionTextareaRef.current?.select();
    }
  }, [isEditingDescription]);

  const handleNameSave = () => {
    setIsEditingName(false);
    if (project && name.trim() && project.name !== name) {
      onUpdateDetails(project.id, { name: name.trim() });
    } else if (project) {
      setName(project.name); // Revert if empty or unchanged
    }
  };
  
  const handleDescriptionSave = () => {
    setIsEditingDescription(false);
    if (project && project.description !== description) {
      onUpdateDetails(project.id, { description: description.trim() });
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleNameSave();
    } else if (e.key === 'Escape') {
        setIsEditingName(false);
        if (project) setName(project.name);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
        setIsEditingDescription(false);
        if (project) setDescription(project.description);
    }
  };
  
  if (!project) {
    return (
        <div className="p-4 h-full flex items-center justify-center">
            <p className="text-gray-500">No project selected.</p>
        </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
        dateStyle: 'long',
        timeStyle: 'short',
    });
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-gray-100 p-4 rounded-2xl">
          <div className="group relative">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleNameKeyDown}
                className="text-2xl font-bold text-gray-900 w-full outline-none border-b-2 border-gray-800 bg-gray-200/50 p-1 -m-1 rounded-t-md"
              />
            ) : (
              <h1
                onClick={() => setIsEditingName(true)}
                className="text-2xl font-bold text-gray-900 cursor-pointer p-1 -m-1 rounded-md hover:bg-gray-200/70"
              >
                {project.name}
              </h1>
            )}
            {!isEditingName && (
              <button onClick={() => setIsEditingName(true)} className="absolute top-1/2 right-0 -translate-y-1/2 p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-800 transition-opacity">
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
            )}
          </div>
          <div className="group relative mt-2">
            {isEditingDescription ? (
              <textarea
                ref={descriptionTextareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={handleDescriptionKeyDown}
                className="text-gray-600 w-full outline-none border-b-2 border-gray-800 bg-gray-200/50 p-1 -m-1 rounded-t-md resize-none"
                rows={3}
              />
            ) : (
              <p
                onClick={() => setIsEditingDescription(true)}
                className="text-gray-600 cursor-pointer p-1 -m-1 rounded-md hover:bg-gray-200/70 text-sm"
              >
                {project.description || <span className="text-gray-400 italic">Click to add a description</span>}
              </p>
            )}
            {!isEditingDescription && (
              <button onClick={() => setIsEditingDescription(true)} className="absolute top-0 right-0 p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-800 transition-opacity">
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 p-4 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 px-2">Metadata</h3>
            <dl className="space-y-3 px-2">
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">{formatDate(project.createdAt)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">{formatDate(project.lastModified)}</dd>
              </div>
            </dl>
          </div>
          <div className="bg-gray-100 p-4 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 px-2">Status</h3>
            
            {project.kyndraDeploy?.url ? (
                <div className="flex items-center gap-3 px-2">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-green-800">Live on Kyndra</p>
                        <a 
                            href={project.kyndraDeploy.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 hover:text-black underline flex items-center gap-1"
                        >
                            {project.kyndraDeploy.url.replace(/^https?:\/\//, '')}
                            <span className="material-symbols-outlined text-base">open_in_new</span>
                        </a>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 px-2">
                    <span className="flex h-3 w-3 relative">
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300"></span>
                    </span>
                    <p className="text-sm text-gray-600">Not deployed yet.</p>
                </div>
            )}
          </div>
        </div>

        <AppAppearance project={project} onUpdateDetails={onUpdateDetails} />

      </div>
    </div>
  );
};

export default AppSettingsPanel;
