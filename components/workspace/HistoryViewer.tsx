import React from 'react';
import type { HistoryEntry } from '../../App';

interface HistoryViewerProps {
  history: HistoryEntry[];
  onRestore: (historyId: string) => void;
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ history, onRestore }) => {
    // Reverse the history to show the newest versions first
    const reversedHistory = [...history].reverse();

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    }

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project History</h1>
        <p className="text-gray-600 mb-8">Review and restore previous versions of your project.</p>
        
        <div className="space-y-4">
            {reversedHistory.map((entry, index) => (
                <div key={entry.uuid} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-800">Version {history.length - index}</h3>
                            {index === 0 && (
                                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    Current
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(entry.timestamp)}</p>
                    </div>
                    {index > 0 && (
                        <button
                            onClick={() => onRestore(entry.uuid)}
                            className="bg-gray-100 text-gray-800 py-1.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">history</span>
                            Restore
                        </button>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryViewer;
