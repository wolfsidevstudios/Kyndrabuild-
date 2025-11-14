
import React, { useState, useEffect, useRef } from 'react';
import type { UiInstructions } from '../../../App';
import { themes } from '../../data/themes';
import ThemePreviewCard from './ThemePreviewCard';

interface UiInstructionsProps {
  instructions: UiInstructions;
  onUpdate: (updates: Partial<UiInstructions>) => void;
}

// Helper to read file as data URL
const fileToDataUrl = (file: File): Promise<{name: string; url: string}> => {
    return new Promise((resolve, reject) => {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            return reject(new Error('File is too large. Please use an image under 2MB.'));
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ name: file.name, url: reader.result as string });
        reader.onerror = error => reject(error);
    });
};


const UiInstructions: React.FC<UiInstructionsProps> = ({ instructions, onUpdate }) => {
  const [formState, setFormState] = useState(instructions);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormState(instructions);
  }, [instructions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
        const imageRef = await fileToDataUrl(file);
        setFormState(prev => ({ ...prev, imageReference: imageRef }));
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read file.');
    } finally {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleRemoveImage = () => {
    setFormState(prev => ({...prev, imageReference: null}));
  }

  const handleSave = () => {
    onUpdate(formState);
  };

  const handleThemeSelect = (theme: { name: string; primaryColor: string; secondaryColor: string; }) => {
    const newInstructions = {
        ...formState,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
    };
    setFormState(newInstructions);
    onUpdate(newInstructions);
  };

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">UI Instructions</h1>
        <p className="text-gray-600 mb-8">
          Provide design guidelines for the AI to follow when generating your app's interface.
        </p>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme Gallery</h3>
            <p className="text-sm text-gray-500 mb-6">Select a pre-designed theme to get started quickly.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {themes.map((theme) => {
                const isSelected = formState.primaryColor === theme.primaryColor && formState.secondaryColor === theme.secondaryColor;
                return (
                  <ThemePreviewCard
                    key={theme.name}
                    theme={theme}
                    isSelected={isSelected}
                    onClick={() => handleThemeSelect(theme)}
                  />
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Theme Colors</h3>
            <p className="text-sm text-gray-500 mb-6">Or, fine-tune the colors yourself.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  value={formState.primaryColor}
                  onChange={handleChange}
                  className="w-12 h-12 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"
                />
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">Primary Color</label>
                  <p className="text-xs text-gray-500">Used for main interactive elements like buttons.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  id="secondaryColor"
                  name="secondaryColor"
                  value={formState.secondaryColor}
                  onChange={handleChange}
                  className="w-12 h-12 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"
                />
                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">Secondary Color</label>
                  <p className="text-xs text-gray-500">Used for accents and secondary elements.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Custom Instructions</h3>
            <p className="text-sm text-gray-500 mb-4">
                Provide any specific design notes, like "use a minimalist style with rounded corners" or "the font should be sans-serif".
            </p>
            <textarea
                name="customInstructions"
                value={formState.customInstructions}
                onChange={handleChange}
                rows={4}
                className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800"
                placeholder="e.g., Use a modern, card-based layout..."
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Image Reference</h3>
            <p className="text-sm text-gray-500 mb-4">
                Upload a screenshot or design mockup to give the AI a strong visual guide for styling.
            </p>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <div className="flex items-center gap-4">
                {formState.imageReference ? (
                    <div className="relative group">
                        <img src={formState.imageReference.url} alt="Reference preview" className="w-48 h-auto rounded-lg border border-gray-200" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <button onClick={handleRemoveImage} className="bg-white/90 text-gray-900 py-1.5 px-4 rounded-full text-sm font-semibold hover:bg-white">
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-48 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                    </div>
                )}
                 <div>
                    <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="bg-gray-100 text-gray-800 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                        Upload Image
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Max file size: 2MB</p>
                 </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
                onClick={handleSave}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
                Save Instructions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UiInstructions;
