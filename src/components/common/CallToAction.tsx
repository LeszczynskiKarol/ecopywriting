// src/components/commons/CallToAction.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface CallToActionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
  title,
  description,
  buttonText,
  buttonLink,
}) => {
  return (
    <div className="bg-primary-600 text-white py-12 px-4 rounded-lg text-center">
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-xl mb-8">{description}</p>
      <Link
        href={buttonLink}
        className="bg-white text-primary-600 py-2 px-6 rounded-full font-semibold hover:bg-primary-50 transition-colors duration-300"
      >
        {buttonText}
      </Link>
    </div>
  );
};

export default CallToAction;
