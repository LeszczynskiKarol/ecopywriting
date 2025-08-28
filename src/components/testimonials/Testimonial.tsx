// src/components/testimonials/Testimonial.tsx
'use client';

import React from 'react';

interface TestimonialProps {
  author: string;
  company: string;
  content: string;
}

const Testimonial: React.FC<TestimonialProps> = ({
  author,
  company,
  content,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-secondary-600 italic mb-4">&quot;{content}&quot;</p>
      <div className="font-semibold text-primary-700">{author}</div>
      <div className="text-sm text-secondary-500">{company}</div>
    </div>
  );
};

export default Testimonial;
