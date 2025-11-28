// src/app/admin/categories/edit/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../../components/layout/Layout';
import { useAuth } from '../../../../context/AuthContext';

const EditCategoryPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setName(data.name);
        setDescription(data.description);
        setMetaTitle(data.metaTitle || '');
        setMetaDescription(data.metaDescription || '');
      } else {
        console.error('Failed to fetch category');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name, description, metaTitle, metaDescription
        }),
      });
      if (response.ok) {
        router.push('/admin/categories');
      } else {
        console.error('Failed to update category');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return <p>Nie masz uprawnień do tej strony.</p>;
  }

  return (
    <Layout title="Edytuj Kategorię">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Edytuj Kategorię</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">Meta Title</label>
            <input
              type="text"
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              maxLength={60}
            />
            <span className="text-sm text-gray-500">{metaTitle.length}/60 znaków</span>
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">Meta Description</label>
            <textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows={3}
              maxLength={160}
            />
            <span className="text-sm text-gray-500">{metaDescription.length}/160 znaków</span>
          </div>
          <div>
            <label htmlFor="name">Nazwa kategorii</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="description">Opis</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300">
            Zapisz zmiany
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EditCategoryPage; 