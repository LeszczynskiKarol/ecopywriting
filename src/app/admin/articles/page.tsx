// src/app/admin/articles/page.tsx
'use client'
import { useState, useEffect } from 'react';
import Layout from '../../../components/layout/Layout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Article } from '../../../types/Article';

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const response = await fetch('/api/articles');
    const data = await response.json();
    if (data.success) {
      setArticles(data.data);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten artykuł?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/articles/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });


        if (response.ok) {
          // Odśwież listę artykułów po usunięciu
          setArticles(articles.filter(article => article._id !== id));
        } else {
          const error = await response.json();
          alert('Błąd podczas usuwania artykułu: ' + error.error);
        }
      } catch (error) {
        console.error('Błąd podczas usuwania:', error);
        alert('Wystąpił błąd podczas usuwania artykułu');
      }
    }
  };

  return (
    <Layout title="Zarządzaj Artykułami">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold mb-8 text-primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Zarządzaj Artykułami
        </motion.h1>
        <Link href="/admin/articles/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300 mb-4 inline-block">
          Dodaj nowy artykuł
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {articles.map((article, index) => (
            <motion.div
              key={article._id}
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">{article.title}</h2>
              <p className="text-gray-600 mb-4">Kategoria: {article.category}</p>
              <Link href={`/admin/articles/edit/${article._id}`} className="text-blue-500 hover:text-blue-700 transition-colors duration-300 mr-4">
                Edytuj
              </Link>
              <button
                onClick={() => handleDelete(article._id)}
                className="text-red-500 hover:text-red-700 transition-colors duration-300">
                Usuń
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ArticlesPage;
