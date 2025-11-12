import React from 'react';

const HistoryIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className={className}
    >
        <path d="M11.999 2.003c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
        <path d="M12.499 7.003h-1.5v5.25l4.5 2.67.75-1.23-3.75-2.22v-4.47z"></path>
    </svg>
);

export default HistoryIcon;
