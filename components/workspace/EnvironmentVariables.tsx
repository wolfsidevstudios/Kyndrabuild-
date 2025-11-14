
import React, { useState } from 'react';

interface EnvironmentVariablesProps {
  variables: Record<string, string>;
  onUpdate: (vars: Record<string, string>) => void;
}

const EnvironmentVariables: React.FC<EnvironmentVariablesProps> = ({ variables, onUpdate }) => {
  const [vars, setVars] = useState(variables);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleUpdate = (key: string, value: string) => {
    const newVars = { ...vars, [key]: value };
    setVars(newVars);
    onUpdate(newVars);
  };

  const handleDelete = (key: string) => {
    const newVars = { ...vars };
    delete newVars[key];
    setVars(newVars);
    onUpdate(newVars);
  };

  const handleAdd = () => {
    if (newKey.trim() && !vars.hasOwnProperty(newKey.trim())) {
      const newVars = { ...vars, [newKey.trim()]: newValue.trim() };
      setVars(newVars);
      onUpdate(newVars);
      setNewKey('');
      setNewValue('');
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Environment Variables</h1>
        <p className="text-gray-600">
          Manage environment variables for your project. These are useful for storing API keys and other secrets.
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded-2xl space-y-3">
        {Object.entries(vars).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <input
              type="text"
              value={key}
              disabled
              className="flex-grow bg-gray-200 border-gray-300 rounded-lg h-10 px-3 text-sm font-mono"
              placeholder="KEY"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleUpdate(key, e.target.value)}
              className="flex-grow bg-white border-gray-300 rounded-lg h-10 px-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="VALUE"
            />
            <button
              onClick={() => handleDelete(key)}
              className="w-10 h-10 bg-white text-gray-500 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
            className="flex-grow bg-white border-gray-300 rounded-lg h-10 px-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="NEW_VARIABLE_NAME"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-grow bg-white border-gray-300 rounded-lg h-10 px-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Value"
          />
          <button
            onClick={handleAdd}
            disabled={!newKey.trim()}
            className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-blue-600 transition-colors disabled:bg-gray-300"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentVariables;
