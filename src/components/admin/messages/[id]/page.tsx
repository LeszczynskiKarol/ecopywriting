// src/app/admin/messages/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function AdminMessageDetailPage() {
  const params = useParams();
  const messageId = params.id as string;

  return (

    <div className="container mx-auto px-4 py-8">

    </div>

  );
}