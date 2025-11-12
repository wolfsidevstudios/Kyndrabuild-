import React from 'react';

const WorkspaceIcon = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 16 16"
        fill="currentColor"
        className={className}
    >
        <path d="M8 8.5v4H3v-4h5m0 -1H3a1 1 0 0 0 -1 1v4a1 1 0 0 0 1 1h5a1 1 0 0 0 1 -1v-4a1 1 0 0 0 -1 -1Z"></path>
        <path d="M13.5 3v2.5H8.5V3h5m0 -1H8.5a1 1 0 0 0 -1 1v2.5a1 1 0 0 0 1 1h5a1 1 0 0 0 1 -1V3a1 1 0 0 0 -1 -1Z"></path>
        <path d="M13.5 8.5v2.5h-2.5v-2.5h2.5m0 -1h-2.5a1 1 0 0 0 -1 1v2.5a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1 -1v-2.5a1 1 0 0 0 -1 -1Z"></path>
        <path d="M5.5 3v2.5H3V3h2.5m0 -1H3a1 1 0 0 0 -1 1v2.5a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1 -1V3a1 1 0 0 0 -1 -1Z"></path>
    </svg>
);

export default WorkspaceIcon;