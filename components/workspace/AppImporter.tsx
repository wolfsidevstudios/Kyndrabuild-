
import React, { useState } from 'react';

interface AppImporterProps {
  onGenerate: (url: string) => void;
}

const AppImporter: React.FC<AppImporterProps> = ({ onGenerate }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onGenerate(url.trim());
    }
  };

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">App Store Landing Page Generator</h1>
        <p className="text-gray-600 mb-8">
          Turn your App Store or Google Play app into a beautiful, responsive landing page. 
          Enter the URL below and the AI will generate a complete website for you.
        </p>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <form onSubmit={handleSubmit}>
                <label htmlFor="app-url" className="block text-sm font-medium text-gray-700 mb-2">
                    App Store or Google Play URL
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="url"
                        id="app-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://apps.apple.com/us/app/..."
                        className="flex-grow bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800"
                        required
                    />
                    <button
                        type="submit"
                        className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300"
                        disabled={!url.trim()}
                    >
                        Generate
                    </button>
                </div>
                <p className="text-xs text-yellow-700 mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <span className="font-bold">Warning:</span> Using this tool will replace your entire current project with the new landing page. This action cannot be undone.
                </p>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AppImporter;
