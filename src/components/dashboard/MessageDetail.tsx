// src/components/dashboard/MessageDetail.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Paperclip, Send, X, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLoader } from '../../context/LoaderContext';

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  recipient: { _id: string; name: string };
  content: string;
  attachments: { filename: string; url: string }[];
  createdAt: string;
  threadId: string;
}

interface Thread {
  _id: string;
  subject: string;
  isOpen: boolean;
  participants: string[];
}

interface MessageDetailProps {
  id: string;
}

const ADMIN_ID = '66e3f850eacbd009c9a036e0';
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const MessageDetail: React.FC<MessageDetailProps> = ({ id }) => {
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchThreadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/threads/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setThread(data.data.thread);
        setMessages(data.data.messages);
      } else {
        console.error('Błąd podczas pobierania wiadomości:', data.message);
        setError(data.message);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania wiadomości:', error);
      setError('Wystąpił błąd podczas pobierania wiadomości');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThreadMessages();
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) {
      return;
    }
    try {
      showLoader();
      const recipientId = user?.role === 'admin' ? thread?.participants.find(p => p !== ADMIN_ID)! : ADMIN_ID;

      const formData = new FormData();
      formData.append('threadId', id);
      formData.append('content', newMessage);
      formData.append('recipientId', recipientId);

      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      console.log('Sending message:', { threadId: id, content: newMessage, recipientId });

      const httpResponse = await fetch(`/api/messages/${id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });
      const response = await httpResponse.json();

      if (response.success) {
        setMessages(prevMessages => [...prevMessages, response.data]);
        setNewMessage('');
        setAttachments([]);
      } else {
        throw new Error(response.message || 'Wystąpił błąd podczas wysyłania wiadomości');
      }
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
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
    setFeedback(`Dodano ${validFiles.length} załącznik(ów)`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentError(null);
    setFeedback('Załącznik został usunięty');
    setTimeout(() => setFeedback(null), 3000);
  };

  if (isLoading) {
    return <div className="text-foreground">Ładowanie...</div>;
  }

  if (error) {
    return <div className="text-foreground">Błąd: {error}</div>;
  }

  if (!thread) {
    return <div className="text-foreground">Wątek nie znaleziony</div>;
  }

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm">

        <h2 className="text-2xl font-bold">{thread?.subject}</h2>
        <div className={`px-3 py-1 rounded-full ${thread?.isOpen ? 'bg-green-500' : 'bg-yellow-500'} text-white text-sm font-medium`}>
          {thread?.isOpen ? 'Wątek otwarty' : 'Wątek zamknięty'}
        </div>
      </div>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {messages.map((message) => (
          <div key={message._id} className={`p-4 rounded-lg shadow-sm border ${message.sender._id === user?.id
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span className="font-medium">{message.sender.name}</span>
              <span>{new Date(message.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{message.content}</p>
            {message.attachments.length > 0 && (
              <div className="mt-3 bg-white dark:bg-gray-700 p-3 rounded-md">
                <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-2">Załączniki:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {message.attachments.map((attachment, index) => (
                    <li key={index}>
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        {attachment.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      {notification && (
        <div
          className={`fixed top-10 right-4 p-4 rounded-md shadow-lg transition-opacity duration-500 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white flex items-center space-x-2`}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
      {thread?.isOpen && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows={4}
            placeholder="Treść wiadomości..."
          />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md flex items-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <Paperclip className="mr-2" size={18} /> Dodaj załączniki
              </label>
              {attachmentError && <p className="text-red-500 text-sm mt-2">{attachmentError}</p>}
              {feedback && (
                <p className="text-green-500 text-sm mt-2 transition-opacity duration-300">
                  {feedback}
                </p>
              )}
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <Paperclip size={14} />
                    <span className="flex-grow truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      aria-label="Usuń załącznik"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && attachments.length === 0) || isLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-md flex items-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="mr-2" size={18} /> Wyślij
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDetail;
