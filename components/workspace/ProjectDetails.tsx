
import React, { useState, useEffect, useRef } from 'react';
import type { Project, DeployState } from '../../../App';

interface ProjectDetailsProps {
    project: Project | null;
    deployState: DeployState;
    onUpdateDetails: (projectId: string, updates: { name?: string; description?: string }) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, deployState, onUpdateDetails }) => {
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
        <div className="p-6 sm:p-8 h-full flex items-center justify-center">
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
    <div className="p-6 sm:p-8 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="group relative">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleNameKeyDown}
                className="text-3xl font-bold text-gray-900 w-full outline-none border-b-2 border-gray-800 bg-gray-100 p-1 -m-1 rounded-t-md"
              />
            ) : (
              <h1
                onClick={() => setIsEditingName(true)}
                className="text-3xl font-bold text-gray-900 cursor-pointer p-1 -m-1 rounded-md hover:bg-gray-100/70"
              >
                {project.name}
              </h1>
            )}
            {!isEditingName && (
              <button onClick={() => setIsEditingName(true)} className="absolute top-1/2 right-0 -translate-y-1/2 p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-800 transition-opacity">
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
            )}
          </div>
          <div className="group relative mt-4">
            {isEditingDescription ? (
              <textarea
                ref={descriptionTextareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={handleDescriptionKeyDown}
                className="text-gray-600 w-full outline-none border-b-2 border-gray-800 bg-gray-100 p-1 -m-1 rounded-t-md resize-none"
                rows={3}
              />
            ) : (
              <p
                onClick={() => setIsEditingDescription(true)}
                className="text-gray-600 cursor-pointer p-1 -m-1 rounded-md hover:bg-gray-100/70"
              >
                {project.description || <span className="text-gray-400 italic">Click to add a description</span>}
              </p>
            )}
            {!isEditingDescription && (
              <button onClick={() => setIsEditingDescription(true)} className="absolute top-0 right-0 p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-800 transition-opacity">
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Metadata</h3>
            <dl className="space-y-4">
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
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
            {deployState.url ? (
                <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-green-800">Live</p>
                        <a 
                            href={deployState.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 hover:text-black underline flex items-center gap-1"
                        >
                            {deployState.url}
                            <span className="material-symbols-outlined text-base">open_in_new</span>
                        </a>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 relative">
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300"></span>
                    </span>
                    <p className="text-sm text-gray-600">Not deployed yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
