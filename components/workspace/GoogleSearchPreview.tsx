import React from 'react';
import type { Project } from '../../../App';
import ImageIcon from '../icons/ImageIcon';

interface GoogleSearchPreviewProps {
  project: Project;
}

const GoogleSearchPreview: React.FC<GoogleSearchPreviewProps> = ({ project }) => {
  const url = `${project.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20).replace(/-$/, '')}.vercel.app`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Search Result Preview</label>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-sans">
        {/* URL and Icon */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
            {project.pwa.icons?.['192'] ? (
              <img src={project.pwa.icons['192']} alt="App icon" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div>
            <div className="text-sm text-gray-900 font-normal">{project.name}</div>
            <div className="text-xs text-gray-500">{url}</div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-blue-800 text-xl hover:underline cursor-pointer font-normal truncate">
          {project.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#4d5156] leading-relaxed mt-1">
          <span className="text-gray-500">{new Date(project.lastModified).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} — </span>
          {project.description || "Your project description will appear here. Write something engaging to attract users."}
        </p>
      </div>
      <p className="text-xs text-gray-500 mt-2">This is a simulation of how your app might appear in Google search results. Actual appearance may vary.</p>
    </div>
  );
};

export default GoogleSearchPreview;