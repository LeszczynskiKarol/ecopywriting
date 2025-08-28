// src/app/admin/articles/edit/[id]/page.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '../../../../../context/AuthContext';
import Layout from '../../../../../components/layout/Layout';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Article {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: 'draft' | 'published';
  featuredImage: string;
  category: string;
}

const EditArticle: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);


  console.log('URL API:', `${process.env.NEXT_PUBLIC_API_URL}/api/articles/${id}`);

  useEffect(() => {
    console.log('ID artykułu w useEffect:', id);
    if (id) {
      fetchArticle();
      fetchCategories();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      console.log('Wysyłanie żądania do:', `${process.env.NEXT_PUBLIC_API_URL}/api/admin/articles/${id}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/articles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      console.log('Status odpowiedzi:', response.status);
      const data = await response.json();
      console.log('Pełna odpowiedź API:', data);

      if (response.ok && data.success) {

        if (data.data && typeof data.data === 'object') {
          setArticle({
            ...data.data,
            tags: Array.isArray(data.data.tags) ? data.data.tags : [],
          });
        } else {
          console.error('Nieprawidłowy format danych artykułu:', data.data);
          setError('Nieprawidłowy format danych artykułu');
        }
      } else {
        console.error('Nie udało się pobrać artykułu. Status:', response.status);
        console.error('Błąd:', data.error || 'Nieznany błąd');
        setError(data.error || 'Nie udało się pobrać artykułu');
      }
    } catch (error) {
      console.error('Błąd podczas pobierania artykułu:', error);
      setError('Wystąpił błąd podczas pobierania artykułu');
    }
  };


  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Błąd pobierania kategorii:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Zmiana pola ${name}:`, value);
    setArticle(prev => prev ? { ...prev, [name]: value } : null);
  };


  const handleContentChange = (content: string) => {
    setArticle(prev => prev ? { ...prev, content } : null);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setArticle(prev => prev ? { ...prev, tags } : null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFeaturedImageFile(e.target.files[0]);
      setArticle(prev => prev ? {
        ...prev,
        featuredImage: e.target.files?.[0]?.name || prev.featuredImage
      } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;

    console.log('Rozpoczynam przesyłanie formularza');

    const formData = new FormData();

    // Debugowanie dodawania pól do FormData
    Object.entries(article).forEach(([key, value]) => {
      console.log(`Dodaję pole ${key}:`, value);
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    if (featuredImageFile) {
      console.log('Dodaję plik obrazu:', featuredImageFile);
      formData.append('featuredImage', featuredImageFile);
    }

    // Sprawdź zawartość FormData przed wysłaniem
    for (let pair of formData.entries()) {
      console.log('FormData zawiera:', pair[0], pair[1]);
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Token autoryzacji:', token ? 'Istnieje' : 'Brak');

      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Status odpowiedzi:', response.status);
      const responseData = await response.json();
      console.log('Odpowiedź serwera:', responseData);

      if (response.ok) {
        router.push('/admin/articles');
      } else {
        console.error('Błąd aktualizacji:', responseData.error);
      }
    } catch (error) {
      console.error('Błąd podczas wysyłania:', error);
    }
  };


  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (input.files) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            const quill = (ReactQuill as any).getEditor();
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', data.url);
          } else {
            console.error('Błąd podczas przesyłania obrazu');
          }
        } catch (error) {
          console.error('Wystąpił błąd:', error);
        }
      }
    };
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <p>Nie masz uprawnień do tej strony.</p>;
  }

  if (error) {
    return <p className="text-red-500">Błąd: {error}</p>;
  }

  if (!article) {
    return <p>Ładowanie...</p>;
  }

  return (

    <Layout title="Edytuj artykuł">

      <h1 className="text-2xl font-bold mb-4">Edytuj artykuł</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tagi (oddzielone przecinkami)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={Array.isArray(article.tags) ? article.tags.join(', ') : ''}
            onChange={handleTagChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
            Zdjęcie główne
          </label>
          <input
            type="file"
            id="featuredImage"
            name="featuredImage"
            onChange={handleImageChange}
            accept="image/*"
            className="mt-1 block w-full"
          />
          {article.featuredImage && (
            <img src={article.featuredImage} alt="Featured" className="mt-2 h-32 w-auto" />
          )}
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Kategoria
          </label>
          <select
            id="category"
            name="category"
            value={article.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          >
            <option value="">Wybierz kategorię</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Treść
          </label>
          <ReactQuill
            theme="snow"
            value={article.content}
            onChange={handleContentChange}
            modules={modules}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
            Krótki opis
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={article.excerpt}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tagi (oddzielone przecinkami)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={article.tags.join(', ')}
            onChange={handleTagChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
            SEO Tytuł
          </label>
          <input
            type="text"
            id="seoTitle"
            name="seoTitle"
            value={article.seoTitle}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
            SEO Opis
          </label>
          <textarea
            id="seoDescription"
            name="seoDescription"
            value={article.seoDescription}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={article.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="draft">Szkic</option>
            <option value="published">Opublikowany</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Zaktualizuj artykuł
        </button>
      </form>
    </Layout>
  );
};

export default EditArticle; 