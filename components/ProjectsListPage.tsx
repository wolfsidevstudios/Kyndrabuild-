


import React from 'react';
import type { Project, ProjectType } from '../../App';

interface ProjectsListPageProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onCreateNewProject: (type: ProjectType) => void;
  onDeleteProject: (id: string) => void;
  onGoHome: () => void;
}

const ProjectsListPage: React.FC<ProjectsListPageProps> = ({ projects, onSelectProject, onCreateNewProject, onDeleteProject, onGoHome }) => {
    const sortedProjects = [...projects].sort((a, b) => b.lastModified - a.lastModified);
    
    const handleDelete = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project?')) {
            onDeleteProject(projectId);
        }
    };
    
  return (
    <div className="w-full h-full bg-white p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">My Apps</h1>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 flex flex-col justify-end">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="font-bold text-white text-base truncate">{project.name}</h3>
                         <p className="text-xs text-gray-200">
                           {new Date(project.lastModified).toLocaleDateString()}
                        </p>
                    </div>
                    {project.projectType === 'mobile' && (
                        <span className="material-symbols-outlined text-white text-lg flex-shrink-0" title="Mobile Project">smartphone</span>
                    )}
                </div>
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