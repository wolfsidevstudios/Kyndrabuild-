
import { FileNode } from '../types';

export const mockProject: FileNode = {
  name: 'src',
  type: 'directory',
  path: 'src',
  children: [
    {
      name: 'App.tsx',
      type: 'file',
      path: 'src/App.tsx',
      content: `
import React, { useState } from 'react';
import Button from './components/Button';
import { getGreeting } from './utils/helpers';
import { THEME } from './styles/theme';

function App() {
  const [count, setCount] = useState(0);
  const greeting = getGreeting();

  return (
    <div style={{ 
        fontFamily: 'sans-serif', 
        padding: '2rem', 
        backgroundColor: THEME.backgroundColor, 
        color: THEME.textColor,
        borderRadius: '24px',
        border: \`1px solid \${THEME.borderColor}\`
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: THEME.textColor, fontWeight: '600' }}>{greeting}</h1>
      <p style={{ marginBottom: '1.5rem', color: '#6B7280' }}>Welcome to the live preview.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button onClick={() => setCount(count + 1)}>
          Click me!
        </Button>
        <p style={{color: '#6B7280'}}>You've clicked {count} times.</p>
      </div>
    </div>
  );
}

export default App;
      `,
    },
    {
      name: 'api',
      type: 'directory',
      path: 'src/api',
      children: [],
    },
    {
      name: 'components',
      type: 'directory',
      path: 'src/components',
      children: [
        {
          name: 'Button.tsx',
          type: 'file',
          path: 'src/components/Button.tsx',
          content: `
import React from 'react';
import { THEME } from '../styles/theme';

const Button = ({ onClick, children }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const style = {
    backgroundColor: isHovered ? THEME.primaryColorDark : THEME.primaryColor,
    color: THEME.backgroundColor,
    border: 'none',
    padding: '12px 24px',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  };

  return (
    <button 
      style={style} 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};

export default Button;
          `,
        },
      ],
    },
    {
        name: 'styles',
        type: 'directory',
        path: 'src/styles',
        children: [
            {
                name: 'theme.ts',
                type: 'file',
                path: 'src/styles/theme.ts',
                content: `
export const THEME = {
  primaryColor: '#111827', // near black
  primaryColorDark: '#374151', // gray-700
  backgroundColor: '#FFFFFF', // white
  textColor: '#1F2937', // charcoal
  borderColor: '#E5E7EB', // gray-200
};
                `
            }
        ]
    },
    {
        name: 'utils',
        type: 'directory',
        path: 'src/utils',
        children: [
            {
                name: 'helpers.ts',
                type: 'file',
                path: 'src/utils/helpers.ts',
                content: `
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good Morning!';
  } else if (hour < 18) {
    return 'Good Afternoon!';
  } else {
    return 'Good Evening!';
  }
}
                `
            }
        ]
    }
  ],
};
