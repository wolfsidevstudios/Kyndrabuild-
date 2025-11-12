import React from 'react';

const ProjectDetails = () => {
  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Details</h1>
        <p className="text-gray-600 mb-8">Basic information and settings for your project.</p>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input 
              type="text" 
              id="projectName"
              className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800"
              defaultValue="React Multi-File Previewer" 
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              id="description"
              rows={3}
              className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800"
              defaultValue="An interactive code previewer for multi-file React and TypeScript projects."
            />
          </div>
          <div className="pt-2">
            <button
                className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
                Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;