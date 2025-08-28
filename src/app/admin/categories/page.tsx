// src/pages/admin/categories/index.tsx
'use client'
import { useState, useEffect } from 'react';
import Layout from '../../../components/layout/Layout';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Layout title="Zarządzaj Kategoriami">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold mb-8 text-primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Zarządzaj Kategoriami
        </motion.h1>
        <Link href="/admin/categories/new" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors duration-300 mb-4 inline-block">
          Dodaj nową kategorię
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              className="bg-card p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">{category.name}</h2>
              <p className="text-muted-foreground mb-4">Slug: {category.slug}</p>
              <Link href={`/admin/categories/edit/${category._id}`} className="text-primary hover:text-primary/90 transition-colors duration-300">
                Edytuj
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesPage;