import React, { useState, useEffect, useCallback } from 'react';
import LivePreview from './LivePreview';
import type { FileNode } from '../types';

interface VisualEditorProps {
  files: Map<string, FileNode>;
  entryPoint: string;
  onError: (error: string) => void;
  onVisualEdit: (selector: string, prompt: string) => void;
  isLoading: boolean;
}

type SelectedElement = {
  selector: string;
  tagName: string;
};

const VisualEditor: React.FC<VisualEditorProps> = ({ files, entryPoint, onError, onVisualEdit, isLoading }) => {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [prompt, setPrompt] = useState('');

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.data.type === 'visual_edit_select') {
      setSelectedElement(event.data.payload);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  useEffect(() => {
    // Reset prompt when a new element is selected
    setPrompt('');
  }, [selectedElement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && selectedElement) {
      onVisualEdit(selectedElement.selector, prompt);
      setSelectedElement(null); // Hide panel after submitting
    }
  };

  const handleClose = () => {
    setSelectedElement(null);
     // Find the iframe and remove the selection attribute from the element
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
        const selected = iframe.contentWindow.document.querySelector('[data-v-edit-selected]');
        if (selected) {
            selected.removeAttribute('data-v-edit-selected');
        }
    }
  }

  return (
    <div className="relative w-full h-full">
      <LivePreview
        files={files}
        entryPoint={entryPoint}
        onError={onError}
        isLoading={false} // We handle loading state in the editor panel
        onAddToChat={() => {}} // Not used in this mode
        visualEditingEnabled={true}
      />
      
      {!selectedElement && !isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full text-sm font-medium text-gray-700 shadow-md pointer-events-none flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-blue-500">ads_click</span>
            Click on any element in the preview to start editing.
        </div>
      )}

      {selectedElement && (
        <div className="absolute bottom-4 left-4 right-4 z-30 transition-transform duration-300 ease-in-out transform translate-y-0">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">
                        Visually Editing: <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{selectedElement.tagName.toLowerCase()}</code>
                    </h3>
                    <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your change... e.g., 'change the text to Hello World' or 'make the background blue'"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800 resize-none"
                  rows={2}
                  autoFocus
                />
              </div>
              <div className="bg-gray-50 px-4 py-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">auto_awesome</span>
                      Generate
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualEditor;
