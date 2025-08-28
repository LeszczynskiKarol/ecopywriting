// src/components/articles/ArticleForm.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import LinkSuggester from './LinkSuggester';
import 'react-quill/dist/quill.snow.css';


interface ReactQuillProps {
  theme: string;
  value: string;
  onChange: (value: string) => void;
  modules: any;
  formats?: string[];
  className?: string;
  placeholder?: string;
}


interface CustomReactQuillProps extends ReactQuillProps {
  forwardedRef: React.RefObject<any>;
}


// Poprawiony dynamiczny import ReactQuill
const HTMLEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          {showPreview ? 'Edytuj HTML' : 'Podgląd'}
        </button>
      </div>

      {showPreview ? (
        <div
          className="prose max-w-none p-4 border rounded-md min-h-[200px]"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-[400px] font-mono p-2 border rounded-md ${className}`}
        />
      )}
    </div>
  );
};



interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ArticleFormData {
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

interface ArticleFormProps {
  initialData?: ArticleFormData;
  onSubmit: (data: FormData) => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<ArticleFormData>(
    initialData || {
      title: '',
      content: '',
      excerpt: '',
      tags: [],
      seoTitle: '',
      seoDescription: '',
      status: 'draft',
      featuredImage: '',
      category: '',
    }
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const quillRef = useRef<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
          if (data.data.length > 0 && !formData.category) {
            setFormData(prev => ({ ...prev, category: data.data[0].name }));
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim());
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFeaturedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, featuredImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formDataToSend.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formDataToSend.append(key, value.toString());
      }
    });

    if (featuredImageFile) {
      formDataToSend.append('featuredImage', featuredImageFile);
    }

    onSubmit(formDataToSend);
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
          const response = await fetch('/api/upload/image', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            const editor = quillRef.current?.getEditor();
            if (editor) {
              const range = editor.getSelection(true);
              editor.insertEmbed(range.index, 'image', data.url);
            }
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
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'code-block'],
        ['blockquote'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'indent',
    'link', 'image',
    'color', 'background',
    'align',
    'code-block'
  ];

  if (!user || user.role !== 'admin') {
    return <p>Nie masz uprawnień do dodawania artykułów.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Tytuł
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
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
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Kategoria
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
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
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Treść (HTML)
              </label>
              <div className="mt-1">
                <HTMLEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          </div>



          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
              Krótki opis
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tagi (oddzielone przecinkami)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags.join(', ')}
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
              value={formData.seoTitle}
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
              value={formData.seoDescription}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
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
            Zapisz artykuł
          </button>
        </form>
      </div>

      <div className="lg:col-span-1">
        {/*  <LinkSuggester
          content={formData.content}
          quillRef={quillRef}
        />*/}
      </div>
    </div>
  );
};

export default ArticleForm; 