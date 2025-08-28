// src/components/dashboard/NewMessage.tsx
'use client';

import { useAuth } from '../../context/AuthContext';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Paperclip, X } from 'lucide-react';
import { useLoader } from '../../context/LoaderContext';

const ADMIN_ID = '66e3f850eacbd009c9a036e0';
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const departments = [
  { id: 'tech', name: 'Pomoc techniczna' },
  { id: 'payment', name: 'Płatności' },
  { id: 'complaint', name: 'Reklamacja' },
  { id: 'other', name: 'Inne' }
];

const NewMessage: React.FC = () => {
  const [department, setDepartment] = useState('');
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const formData = new FormData();
    formData.append('recipientId', ADMIN_ID);
    formData.append('department', department);
    formData.append('subject', subject);
    formData.append('content', content);
    attachments.forEach((file, index) => {
      formData.append(`attachments`, file);
    });

    try {
      showLoader();
      const response = await fetch(`/api/messages`, {

        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/messages');
        }, 2000);
      } else {
        setError(data.message || 'Wystąpił błąd podczas wysyłania wiadomości');
      }
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
      setError('Wystąpił błąd podczas wysyłania wiadomości');
    } finally {
      hideLoader();
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= MAX_FILE_SIZE);

    if (validFiles.length + attachments.length > MAX_FILES) {
      setAttachmentError(`Możesz dodać maksymalnie ${MAX_FILES} plików.`);
      return;
    }

    if (validFiles.length !== files.length) {
      setAttachmentError('Niektóre pliki przekraczają limit 10 MB i zostały pominięte.');
    } else {
      setAttachmentError(null);
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentError(null);
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      {success && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Dziękujemy za wysłanie wiadomości. Odpowiemy w ciągu 24 godz. roboczych.</span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dział pomocy</label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">Wybierz dział</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Temat</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Treść</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Załączniki</label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              id="attachment"
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <label htmlFor="attachment" className="cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md flex items-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <Paperclip className="mr-2" size={18} /> Dodaj załącznik
            </label>
          </div>
          {attachmentError && <p className="text-red-500 text-sm mt-2">{attachmentError}</p>}
          <div className="mt-3 space-y-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <Paperclip size={14} />
                <span className="flex-grow truncate">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  aria-label="Usuń załącznik"
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Send className="mr-2" size={18} /> Wyślij wiadomość
        </button>
      </form>
    </div>
  );
};

export default NewMessage;