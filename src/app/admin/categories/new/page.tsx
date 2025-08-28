// src/pages/admin/categories/new.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const NewCategoryPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description }),
      });
      if (response.ok) {
        router.push('/admin/categories');
      } else {
        const data = await response.json();
        console.error('Failed to create category:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return <p>Nie masz uprawnień do tej strony.</p>;
  }

  return (
    <Layout title="Dodaj Nową Kategorię">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold mb-8 text-primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dodaj Nową Kategorię
        </motion.h1>
        <motion.form
          onSubmit={handleSubmit}
          className="bg-card p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">Nazwa Kategorii</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-input rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-2">Opis (opcjonalnie)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-input rounded-md"
              rows={4}
            />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors duration-300">
            Dodaj Kategorię
          </button>
        </motion.form>
      </div>
    </Layout>
  );
};

export default NewCategoryPage;