


import React, { useState } from 'react';
import type { UiInstructions, ProjectType } from '../../App';

interface HomePageProps {
  onCreateProject: (options: { prompt: string, theme?: UiInstructions, type: ProjectType }) => void;
}

const Blob = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div
        className={`absolute -z-10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${className}`}
        style={style}
    ></div>
);

const examplePrompts = [
  'A simple todo app',
  'A pomodoro timer',
  'A recipe book',
  'A personal blog',
  'A weather app',
];


const HomePage: React.FC<HomePageProps> = ({ onCreateProject }) => {
  const [prompt, setPrompt] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('mobile');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onCreateProject({ prompt: prompt.trim(), type: projectType });
    }
  };
  
  const handlePromptCardClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-4 relative isolate overflow-hidden">
      <Blob className="bg-pink-200" style={{ width: '30rem', height: '30rem', top: '5%', left: '10%' }} />
      <Blob className="bg-orange-200" style={{ width: '25rem', height: '25rem', top: '20%', right: '5%' }} />
      <Blob className="bg-blue-200" style={{ width: '20rem', height: '20rem', bottom: '10%', left: '20%' }} />
      <Blob className="bg-yellow-200" style={{ width: '25rem', height: '25rem', bottom: '5%', right: '15%' }} />
      
      <style>{`
        .momo-trust-display-regular {
          font-family: "Momo Trust Display", sans-serif;
          font-weight: 400;
          font-style: normal;
        }
      `}</style>
      
      <div className="w-full max-w-2xl text-center">
        <h1 className="momo-trust-display-regular text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Build apps now
        </h1>
        
        <div className="flex justify-center mb-6">
            <div className="flex items-center p-1 space-x-1 bg-gray-100 rounded-full">
                <button onClick={() => setProjectType('web')} className={`px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2 transition-colors ${projectType === 'web' ? 'bg-white shadow' : 'text-gray-600 hover:bg-white/60'}`}>
                    <span className="material-symbols-outlined text-base">web</span> Web App
                </button>
                <button onClick={() => setProjectType('mobile')} className={`px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2 transition-colors ${projectType === 'mobile' ? 'bg-white shadow' : 'text-gray-600 hover:bg-white/60'}`}>
                    <span className="material-symbols-outlined text-base">smartphone</span> Mobile App
                </button>
            </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="relative">
             <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe the ${projectType === 'web' ? 'app' : 'mobile app'} you want to build...`}
              className="w-full h-40 p-6 text-lg bg-white border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all resize-none"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="mt-4 w-full h-14 px-6 bg-gray-900 text-white rounded-full text-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Start Building
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </form>

        <div className="mt-8">
          <p className="text-sm font-medium text-gray-600 mb-3">Or try one of these ideas:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {examplePrompts.map((p) => (
              <button
                key={p}
                onClick={() => handlePromptCardClick(p)}
                className="px-4 py-2 bg-white/60 border border-gray-200/80 rounded-full text-sm text-gray-700 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;