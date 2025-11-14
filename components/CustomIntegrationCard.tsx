
import React, { useState } from 'react';
import type { CustomIntegrationRequest } from '../../App';

interface CustomIntegrationCardProps {
  request: CustomIntegrationRequest;
  onActivate: (credentials: Record<string, string>) => void;
}

const CustomIntegrationCard: React.FC<CustomIntegrationCardProps> = ({ request, onActivate }) => {
  const initialCredentials = request.fields.reduce((acc, field) => {
    acc[field] = '';
    return acc;
  }, {} as Record<string, string>);

  const [credentials, setCredentials] = useState<Record<string, string>>(initialCredentials);

  const handleChange = (fieldName: string, value: string) => {
    setCredentials(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onActivate(credentials);
  };
  
  // FIX: Added a type guard `typeof val === 'string'` to ensure val is a string before calling .trim().
  // This resolves a TypeScript error where `val` was being inferred as `unknown`.
  const allFieldsFilled = Object.values(credentials).every(val => typeof val === 'string' && val.trim() !== '');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-gray-500">key</span>
          </div>
          <div className="flex-grow">
            <h4 className="font-semibold text-gray-900">Configure {request.name}</h4>
            <p className="text-sm text-gray-600">{request.description}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {request.fields.map(field => (
            <div key={field}>
              <label htmlFor={field} className="block text-xs font-medium text-gray-600 mb-1">{field}</label>
              <input
                type="text"
                id={field}
                value={credentials[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-800"
              />
            </div>
          ))}
        </div>
        
        <p className="text-xs text-gray-500 mb-4">
            For this test, credentials will be hardcoded. The AI will add a reminder to move them to environment variables for production.
        </p>

        <button
          type="submit"
          disabled={!allFieldsFilled}
          className="w-full bg-gray-800 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Activate
        </button>
      </form>
    </div>
  );
};

export default CustomIntegrationCard;
