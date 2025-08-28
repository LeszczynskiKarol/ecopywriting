// src/app/dashboard/messages/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import MessageDetail from '../../../../components/dashboard/MessageDetail';

export default function MessageDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Szczegóły wątku</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <MessageDetail id={id} />
      </div>
    </div>
  );
}