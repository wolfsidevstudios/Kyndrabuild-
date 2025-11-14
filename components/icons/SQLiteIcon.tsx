
import React from 'react';

const SQLiteIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className}>
        <path fill="#70C5EA" d="M128 0l12.8 12.8v102.4H12.8L0 128l12.8 12.8h115.2V243.2l12.8 12.8 12.8-12.8V140.8h115.2L256 128l-12.8-12.8H140.8V12.8L128 0z"/>
        <path fill="#003B57" d="M38.4 38.4h76.8v76.8H38.4z"/>
        <path fill="#fff" d="M115.2 38.4h25.6v76.8h-25.6z"/>
        <path fill="#003B57" d="M140.8 140.8h76.8v76.8h-76.8z"/>
        <path fill="#fff" d="M115.2 140.8h25.6v76.8h-25.6z"/>
    </svg>
);

export default SQLiteIcon;