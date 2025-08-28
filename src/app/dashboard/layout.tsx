// src/app/dashboard/layout.tsx
'use client';
import React, { useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AuthRedirect from '../../components/auth/AuthRedirect';

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <AuthRedirect currentPath="/dashboard">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthRedirect>
  );
}