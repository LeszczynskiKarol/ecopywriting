// src/app/admin/threads/page.tsx
'use client';

import React from 'react';
import AdminMessageList from '../../../components/admin/AdminMessageList';

export default function AdminThreadsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      
      <AdminMessageList />
    </div>
  );
}

