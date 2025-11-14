
import React, { useEffect, useRef } from 'react';
import type { ConsoleLogEntry } from '../LivePreview';

interface ConsoleLogsPanelProps {
  logs: ConsoleLogEntry[];
}

const getLogLevelClass = (level: ConsoleLogEntry['level']) => {
    switch (level) {
        case 'error': return 'text-red-500';
        case 'warn': return 'text-yellow-500';
        case 'info': return 'text-blue-500';
        default: return 'text-gray-500';
    }
}

const ConsoleLogsPanel: React.FC<ConsoleLogsPanelProps> = ({ logs }) => {
    const endOfLogsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="p-4 font-mono text-sm space-y-2 h-full overflow-y-auto">
            {logs.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Console logs from your app will appear here.</p>
                </div>
            )}
            {logs.map((log, index) => (
                <div key={index} className="flex gap-4 border-b border-gray-100 pb-2">
                    <span className="text-gray-400 text-xs flex-shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex-grow">
                        <span className={`font-semibold uppercase mr-2 ${getLogLevelClass(log.level)}`}>
                            [{log.level}]
                        </span>
                        <pre className="inline whitespace-pre-wrap text-gray-700">{log.message}</pre>
                    </div>
                </div>
            ))}
            <div ref={endOfLogsRef} />
        </div>
    );
};

export default ConsoleLogsPanel;
