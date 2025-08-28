// src/app/dashboard/messages/new/page.tsx
'use client';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import NewMessage from '../../../../components/dashboard/NewMessage';
import { Button } from "../../../../components/ui/button";

export default function NewMessagePage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Nowy wątek</h1>
      <NewMessage />
    </div>
  );
}