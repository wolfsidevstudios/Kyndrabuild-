import { FileNode } from '../types';

export const mockMobileProject: FileNode = {
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
import TabBar from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import { THEME } from './styles/theme';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div style={{
      fontFamily: THEME.fontFamily,
      backgroundColor: THEME.backgroundColor,
      color: THEME.textColor,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderScreen()}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
      `,
    },
    {
      name: 'components',
      type: 'directory',
      path: 'src/components',
      children: [
        {
          name: 'TabBar.tsx',
          type: 'file',
          path: 'src/components/TabBar.tsx',
          content: `
import React from 'react';
import TabItem from './TabItem';
import { THEME } from '../styles/theme';

const TabBar = ({ activeTab, onTabChange }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '84px',
      paddingBottom: '34px',
      backgroundColor: THEME.tabBarColor,
      borderTop: \`1px solid \${THEME.borderColor}\`,
      boxSizing: 'border-box'
    }}>
      <TabItem
        icon="home"
        label="Home"
        isActive={activeTab === 'home'}
        onClick={() => onTabChange('home')}
      />
      <TabItem
        icon="settings"
        label="Settings"
        isActive={activeTab === 'settings'}
        onClick={() => onTabChange('settings')}
      />
    </div>
  );
};

export default TabBar;
          `,
        },
        {
            name: 'TabItem.tsx',
            type: 'file',
            path: 'src/components/TabItem.tsx',
            content: `
import React from 'react';
import { THEME } from '../styles/theme';

const TabItem = ({ icon, label, isActive, onClick }) => {
    return (
        <button onClick={onClick} style={{
            background: 'none',
            border: 'none',
            color: isActive ? THEME.primaryColor : THEME.inactiveColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            width: '64px'
        }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                {icon}
            </span>
            <span style={{ fontSize: '10px', fontWeight: '500' }}>
                {label}
            </span>
        </button>
    );
};

export default TabItem;
            `
        }
      ],
    },
    {
        name: 'screens',
        type: 'directory',
        path: 'src/screens',
        children: [
            {
                name: 'HomeScreen.tsx',
                type: 'file',
                path: 'src/screens/HomeScreen.tsx',
                content: `
import React from 'react';
import { THEME } from '../styles/theme';

const HomeScreen = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '34px', fontWeight: '700', marginBottom: '24px', padding: '16px 0' }}>
                Home
            </h1>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '16px'
            }}>
                <h2 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '8px' }}>Welcome!</h2>
                <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.4 }}>
                    This is a starter mobile app template. You can ask the AI to modify it.
                </p>
                <button style={{
                    marginTop: '16px',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: THEME.primaryColor,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default HomeScreen;
                `
            },
            {
                name: 'SettingsScreen.tsx',
                type: 'file',
                path: 'src/screens/SettingsScreen.tsx',
                content: `
import React from 'react';
import { THEME } from '../styles/theme';

const SettingsScreen = () => {
    const settings = ['Profile', 'Notifications', 'Appearance', 'Privacy', 'Help & Support'];
    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '34px', fontWeight: '700', marginBottom: '24px', padding: '16px 0' }}>
                Settings
            </h1>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
            }}>
                {settings.map((item, index) => (
                    <div key={item} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        borderBottom: index < settings.length - 1 ? \`1px solid \${THEME.borderColor}\` : 'none',
                        fontSize: '16px'
                    }}>
                        <span>{item}</span>
                        <span className="material-symbols-outlined" style={{ color: THEME.inactiveColor, fontSize: '20px' }}>
                            arrow_forward_ios
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SettingsScreen;
                `
            }
        ]
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
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  primaryColor: '#007AFF', // iOS Blue
  backgroundColor: '#F2F2F7', // iOS System Gray 6
  tabBarColor: 'rgba(249, 249, 249, 0.94)', // iOS Translucent Tab Bar
  textColor: '#000000',
  inactiveColor: '#8E8E93', // iOS System Gray
  borderColor: '#E5E5EA', // iOS Separator color
};
                `
            }
        ]
    }
  ],
};
