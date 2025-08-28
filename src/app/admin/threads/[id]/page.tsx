// src/app/admin/threads/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AdminThreadDetail from '../../../../components/admin/AdminThreadDetail';

export default function AdminThreadDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Szczegóły Wątku</h1>
      <AdminThreadDetail threadId={id} />
    </div>
  );
}