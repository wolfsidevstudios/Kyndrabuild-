
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
import React from 'react';
import FeatureCard from './components/FeatureCard';
import { THEME } from './styles/theme';

function App() {
  return (
    <div style={{
      fontFamily: 'sans-serif',
      backgroundColor: THEME.backgroundColor,
      color: THEME.textColor,
      padding: '48px 24px',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <main style={{ maxWidth: '1024px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '16px', lineHeight: 1.2 }}>
            Welcome to Your New AI-Powered App
          </h1>
          <p style={{ fontSize: '1.125rem', color: THEME.subtleTextColor, maxWidth: '600px', margin: '0 auto' }}>
            This is your starting point. Use the chat on the left to modify, build, and bring your ideas to life.
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          <FeatureCard
            icon="palette"
            title="Modify the UI"
            description="Change colors, fonts, layouts, and styles. Just describe what you want to see."
            prompt="Change the primary color to a dark slate gray"
          />
          <FeatureCard
            icon="add_box"
            title="Add New Components"
            description="Build new UI elements from scratch, like forms, cards, or even entire pages."
            prompt="Add a contact form with name, email, and message fields"
          />
          <FeatureCard
            icon="api"
            title="Connect to APIs"
            description="Fetch data from external services and display it in your application."
            prompt="Fetch and display a list of random dog facts"
          />
          <FeatureCard
            icon="cloud_upload"
            title="Deploy to the Web"
            description="When you're ready, I can help you deploy your application to a live URL."
            prompt="Deploy this app to Vercel"
          />
        </div>

        <footer style={{ textAlign: 'center', marginTop: '64px', paddingTop: '32px', borderTop: \`1px solid \${THEME.borderColor}\` }}>
          <p style={{ fontSize: '0.875rem', color: THEME.subtleTextColor }}>
            Powered by Kyndra. Your imagination is the only limit.
          </p>
        </footer>
      </main>
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
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
        {
          name: 'FeatureCard.tsx',
          type: 'file',
          path: 'src/components/FeatureCard.tsx',
          content: `
import React from 'react';
import { THEME } from '../styles/theme';

const FeatureCard = ({ icon, title, description, prompt }) => {
  return (
    <div style={{
      backgroundColor: THEME.cardBackgroundColor,
      borderRadius: '16px',
      border: \`1px solid \${THEME.borderColor}\`,
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: THEME.primaryColor }}>
        {icon}
      </span>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: THEME.textColor }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: THEME.subtleTextColor, flexGrow: 1 }}>{description}</p>
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: THEME.backgroundColor,
        borderRadius: '8px',
        border: \`1px solid \${THEME.borderColor}\`,
      }}>
          <p style={{ fontSize: '0.875rem', color: THEME.subtleTextColor }}>Try saying:</p>
          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: THEME.textColor, marginTop: '4px' }}>"{prompt}"</p>
      </div>
    </div>
  );
};

export default FeatureCard;
          `
        }
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
  primaryColor: '#6366F1', // Indigo 500
  primaryColorDark: '#4F46E5', // Indigo 600
  backgroundColor: '#F9FAFB', // Gray 50
  cardBackgroundColor: '#FFFFFF', // White
  textColor: '#1F2937', // Gray 800
  subtleTextColor: '#6B7280', // Gray 500
  borderColor: '#E5E7EB', // Gray 200
};
                `
            }
        ]
    }
  ],
};
