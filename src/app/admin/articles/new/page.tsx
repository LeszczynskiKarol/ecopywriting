// src/pages/admin/articles/new.tsx
'use client'
import React from 'react';
import { useRouter } from 'next/navigation';  // Zmiana importu
import Layout from '../../../../components/layout/Layout';
import ArticleForm from '../../../../components/articles/ArticleForm';
import { useAuth } from '../../../../context/AuthContext';

const NewArticle: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (data: FormData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      if (response.ok) {
        router.push('/admin/articles');
      } else {
        console.error('Failed to create article:', responseData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return <p>Nie masz uprawnień do tej strony.</p>;
  }

  return (
    <Layout title="Dodaj nowy artykuł">
      <h1 className="text-2xl font-bold mb-4">Dodaj nowy artykuł</h1>
      <ArticleForm onSubmit={handleSubmit} />
    </Layout>
  );
};

export default NewArticle;