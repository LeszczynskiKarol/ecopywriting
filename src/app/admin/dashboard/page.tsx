// src/pages/admin/dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import Layout from '../../../components/layout/Layout';
import { motion } from 'framer-motion';


const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Ładowanie...</div>;
  }

  if (!user) {
    return null;
  }

  const dashboardItems = [
    { title: 'Zarządzaj Artykułami', link: '/admin/articles', buttonText: 'Zobacz artykuły' },
    { title: 'Dodaj Nowy Artykuł', link: '/admin/articles/new', buttonText: 'Dodaj artykuł' },
    { title: 'Zarządzaj Kategoriami', link: '/admin/categories', buttonText: 'Zobacz kategorie' },
    { title: 'Dodaj Nową Kategorię', link: '/admin/categories/new', buttonText: 'Dodaj kategorię' },
    { title: 'Zarządzaj Użytkownikami', link: '/admin/users', buttonText: 'Zobacz użytkowników' },
    { title: 'Zarządzaj Zamówieniami', link: '/admin/orders', buttonText: 'Zobacz zamówienia' },
    { title: 'Zarządzaj Wiadomościami', link: '/admin/threads', buttonText: 'Zobacz wiadomości' },
  ];

  return (
    <Layout title="Panel Administracyjny">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold mb-8 text-primary-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Panel Administracyjny
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{item.title}</h2>
              <Link
                href={item.link}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
              >
                {item.buttonText}
              </Link>
            </motion.div>
          ))}

        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;