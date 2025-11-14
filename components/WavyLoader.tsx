
import React, { useMemo } from 'react';
import type { AiTask } from '../../App';

interface BuildingLoaderProps {
  aiTask: AiTask;
}

const BuildingLoader: React.FC<BuildingLoaderProps> = ({ aiTask }) => {
    const progress = useMemo(() => {
        if (!aiTask || aiTask.status !== 'generating' || aiTask.files.length === 0) {
            return 0;
        }
        const doneCount = aiTask.files.filter(f => f.status === 'done').length;
        const totalCount = aiTask.files.length;
        return Math.round((doneCount / totalCount) * 100);
    }, [aiTask]);

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-md">
            <p className="text-4xl font-mono font-bold text-white">
                {progress}%
            </p>
        </div>
    );
}

export default BuildingLoader;
