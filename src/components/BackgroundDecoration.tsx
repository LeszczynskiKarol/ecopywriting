// src/components/BackgroundDecoration.tsx
import React from 'react';

const BackgroundDecoration: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <path
          d="M0,1000 C200,800 350,900 500,800 C650,700 700,550 1000,500 L1000,1000 Z"
          fill="rgba(59, 130, 246, 0.05)"
        />
        <path
          d="M0,1000 C150,900 300,1000 450,900 C600,800 750,750 1000,800 L1000,1000 Z"
          fill="rgba(59, 130, 246, 0.03)"
        />
      </svg>
    </div>
  );
};

export default BackgroundDecoration;
