// src/app/admin/newsletters/NewsletterManagement.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Editor } from '@tinymce/tinymce-react';
import { Select, Input } from 'antd';

const { Option } = Select;

interface NewsletterFormData {
  title: string;
  summary: string;
  category: string;
  content: string;
}

const NewsletterManagement = () => {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, control } = useForm<NewsletterFormData>();


  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/newsletter', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch newsletters');
      const data = await response.json();
      setNewsletters(data.data || []);
    } catch (err) {
      setError('Error fetching newsletters: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };


  const onSubmit = async (data: NewsletterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create newsletter');
      await fetchNewsletters();
      reset();
      alert('Newsletter created successfully!');
    } catch (err) {
      setError('Error creating newsletter: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNewsletter = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/newsletter/${id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to send newsletter');
      alert('Newsletter sent successfully!');
    } catch (err) {
      setError('Error sending newsletter: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Newsletter Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Create Newsletter</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1">Title</label>
              <input
                {...register('title', { required: true })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Summary</label>
              <textarea
                {...register('summary', { required: true })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Category</label>
              <Controller
                name="category"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select {...field} className="w-full">
                    <Option value="Nowości">Nowości</Option>
                    <Option value="Promocje">Promocje</Option>
                    <Option value="Porady">Porady</Option>
                    <Option value="Branżowe">Branżowe</Option>
                    <Option value="Technologia">Technologia</Option>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block mb-1">Content</label>
              <Editor
                apiKey="748wl5hp6z7lz5hv6cz2fzl28ul6y0ignmqfsethwzycv7w3"
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
                onEditorChange={(content) => setValue('content', content)}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Newsletter'}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Newsletter List</h2>
          {isLoading ? (
            <p>Loading newsletters...</p>
          ) : newsletters.length > 0 ? (
            <ul className="space-y-2">
              {newsletters.map((newsletter) => (
                <li key={newsletter._id} className="border p-2 rounded">
                  <h3 className="font-semibold">{newsletter.title}</h3>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(newsletter.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Category: {newsletter.category}
                  </p>
                  <button
                    onClick={() => handleSendNewsletter(newsletter._id)}
                    className="mt-2 bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Send
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No newsletters found.</p>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default NewsletterManagement;