
import React from 'react';
import type { Project } from '../../App';

interface ProjectsListPageProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onCreateNewProject: () => void;
  onDeleteProject: (id: string) => void;
}

const ProjectsListPage: React.FC<ProjectsListPageProps> = ({ projects, onSelectProject, onCreateNewProject, onDeleteProject }) => {
    const sortedProjects = [...projects].sort((a, b) => b.lastModified - a.lastModified);
    
    const handleDelete = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project?')) {
            onDeleteProject(projectId);
        }
    };
    
  return (
    <div className="w-full h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-2">Select a project to continue or start a new one.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <button
            onClick={onCreateNewProject}
            className="group aspect-[16/10] bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-800 hover:bg-gray-100/50 transition-all flex flex-col items-center justify-center text-gray-500 hover:text-gray-800"
          >
            <span className="material-symbols-outlined text-4xl mb-2 transition-transform group-hover:scale-110">add_circle</span>
            <span className="font-semibold">Create New Project</span>
          </button>
          
          {sortedProjects.map(project => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group aspect-[16/10] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer relative transition-all hover:shadow-xl hover:border-gray-800/50"
            >
              <img
                src={project.previewImage}
                alt={`${project.name} preview`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <h3 className="font-bold text-white text-lg">{project.name}</h3>
                <p className="text-xs text-gray-200">
                  Last updated: {new Date(project.lastModified).toLocaleString()}
                </p>
              </div>
               <button 
                onClick={(e) => handleDelete(e, project.id)}
                className="absolute top-2 right-2 p-1.5 bg-black/30 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                title="Delete project"
                aria-label="Delete project"
               >
                 <span className="material-symbols-outlined text-base">delete</span>
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsListPage;
