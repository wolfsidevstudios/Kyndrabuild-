
import React, { useState } from 'react';
import type { SqlScript } from '../../App';
import SupabaseIcon from './icons/SupabaseIcon';
import FirebaseIcon from './icons/FirebaseIcon';
import SqlSyntaxHighlighter from './utils/sqlSyntaxHighlight';
import type { Integrations } from '../../hooks/useIntegrations';


interface SqlScriptCardProps {
  script: SqlScript;
  onDismiss: () => void;
  integrations: Integrations;
}

const getIcon = (dbType: 'supabase' | 'firestore') => {
    if (dbType === 'supabase') return <SupabaseIcon className="h-8 w-8" />;
    if (dbType === 'firestore') return <FirebaseIcon className="h-8 w-8" />;
    return <span className="material-symbols-outlined text-2xl text-gray-500">database</span>;
}

const SqlScriptCard: React.FC<SqlScriptCardProps> = ({ script, onDismiss, integrations }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const isSupabase = script.databaseType === 'supabase';
  const supabaseUrl = isSupabase ? integrations.supabase_db?.url : null;
  const projectRef = supabaseUrl ? supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/)?.[1] : null;
  const sqlEditorUrl = projectRef ? `https://app.supabase.com/project/${projectRef}/sql/new` : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-sm">
        <div className="flex items-start gap-4 mb-3">
            <div className="flex-shrink-0">
                {getIcon(script.databaseType)}
            </div>
            <div className="flex-grow">
                <h4 className="font-semibold text-gray-900">Action Required: Run SQL Script</h4>
                <p className="text-sm text-gray-600">{script.description}</p>
            </div>
        </div>

        <div className="relative">
            <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                <code>
                    <SqlSyntaxHighlighter code={script.script} />
                </code>
            </pre>
            <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-white/10 rounded-md text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                title="Copy script"
            >
                <span className="material-symbols-outlined text-base">{copied ? 'done' : 'content_copy'}</span>
            </button>
        </div>
        
        <div className="mt-3 flex flex-col gap-2">
            {sqlEditorUrl && (
                <a 
                    href={sqlEditorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-800 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors text-center"
                >
                    Open Supabase SQL Editor
                </a>
            )}
             <button 
                onClick={onDismiss}
                className="w-full bg-gray-100 text-gray-800 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
                {sqlEditorUrl ? "I've run this" : "Dismiss"}
            </button>
        </div>
    </div>
  );
};

export default SqlScriptCard;
