import React from 'react';

const SquareIcon = ({ className }: { className?: string }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
      <title>Square</title>
      <path d="M4.01 0A4.01 4.01 0 0 0 0 4.01v15.98c0 2.21 1.8 4 4.01 4.01h15.98C22.2 24 24 22.2 24 19.99V4a4.01 4.01 0 0 0 -4.01 -4H4zm1.62 4.36h12.74c0.7 0 1.26 0.57 1.26 1.27v12.74c0 0.7 -0.56 1.27 -1.26 1.27H5.63c-0.7 0 -1.26 -0.57 -1.26 -1.27V5.63a1.27 1.27 0 0 1 1.26 -1.27zm3.83 4.35a0.73 0.73 0 0 0 -0.73 0.73v5.09c0 0.4 0.32 0.72 0.72 0.72h5.1a0.73 0.73 0 0 0 0.73 -0.72V9.44a0.73 0.73 0 0 0 -0.73 -0.73h-5.1Z"></path>
    </svg>
);

export default SquareIcon;