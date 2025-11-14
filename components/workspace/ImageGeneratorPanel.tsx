
import React, { useState, useRef } from 'react';

declare const puter: any;

type ImageModel = 'gpt-image-1' | 'dall-e-3' | 'dall-e-2';

interface ImageGeneratorPanelProps {
    onAttach: (name: string, url: string) => void;
}

const LoadingPlaceholder = () => (
    <div className="aspect-square bg-white rounded relative overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-200 rounded-full filter blur-2xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 bg-yellow-200 rounded-full filter blur-2xl opacity-40 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-1/3 h-1/3 bg-green-200 rounded-full filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
    </div>
);

const ImageGeneratorPanel: React.FC<ImageGeneratorPanelProps> = ({ onAttach }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [numImages, setNumImages] = useState(4);
    const [imageModel, setImageModel] = useState<ImageModel>('gpt-image-1');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            if (typeof puter === 'undefined' || typeof puter.ai?.txt2img !== 'function') {
                throw new Error("Puter.js is not loaded or the function is not available.");
            }
            
            const imagePromises = Array(numImages).fill(null).map(() => 
                puter.ai.txt2img(prompt, { model: imageModel })
            );

            const imageElements = await Promise.all(imagePromises);
            
            const imageUrls = imageElements.map(imgEl => {
                const canvas = document.createElement('canvas');
                canvas.width = imgEl.width;
                canvas.height = imgEl.height;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.drawImage(imgEl, 0, 0);
                return canvas.toDataURL('image/png');
            });

            setGeneratedImages(imageUrls);

        } catch (err) {
            console.error("Image generation failed:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred during image generation.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageClick = (imageUrl: string) => {
        const imageName = `${prompt.slice(0, 20).replace(/\s/g, '_')}_${Date.now()}.png`;
        onAttach(imageName, imageUrl);
    }

    return (
        <div className="p-4 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Image Generator</h1>
                <p className="text-gray-600">
                    Generate images for your app using a text prompt. Click an image to attach it to your chat.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                    <textarea
                        id="image-prompt"
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A futuristic cityscape at night"
                        className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of images</label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setNumImages(num)}
                                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                                        numImages === num 
                                            ? 'bg-gray-800 text-white' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="image-model" className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                        <select
                            id="image-model"
                            value={imageModel}
                            onChange={(e) => setImageModel(e.target.value as ImageModel)}
                            className="w-full bg-gray-100 border border-gray-200 rounded-lg h-10 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800"
                        >
                            <option value="gpt-image-1">GPT Image</option>
                            <option value="dall-e-3">DALL-E 3</option>
                            <option value="dall-e-2">DALL-E 2</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-wait flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating {numImages} image{numImages > 1 ? 's' : ''}...
                        </>
                    ) : `Generate ${numImages} Image${numImages > 1 ? 's' : ''}`}
                </button>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Results</h3>
                <div 
                    className="grid grid-cols-2 gap-2 bg-gray-100 rounded-lg border border-gray-200 p-2 min-h-[200px]"
                >
                    {isLoading && Array(numImages).fill(null).map((_, i) => <LoadingPlaceholder key={i} />)}
                    {!isLoading && generatedImages.length > 0 && generatedImages.map((imgSrc, i) => (
                        <button key={i} onClick={() => handleImageClick(imgSrc)} className="aspect-square rounded overflow-hidden transition-transform transform hover:scale-105 hover:ring-2 ring-blue-500 ring-offset-2">
                             <img src={imgSrc} alt={`Generated image ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                    {!isLoading && !error && generatedImages.length === 0 && (
                        <div className="col-span-2 flex items-center justify-center text-gray-500 text-sm">
                            Your generated images will appear here.
                        </div>
                    )}
                    {error && <p className="col-span-2 text-red-600 text-sm text-center p-4">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ImageGeneratorPanel;