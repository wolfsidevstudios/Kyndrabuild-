import React from 'react';

const OpenRouterIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M8.5 8.5l-2-2" />
        <path d="M17.5 6.5l-2 2" />
        <path d="M8.5 15.5l-2 2" />
        <path d="M17.5 17.5l-2-2" />
    </svg>
);

export default OpenRouterIcon;