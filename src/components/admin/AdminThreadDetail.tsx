// src/components/admin/AdminThreadDetail.tsx

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { ArrowLeft, Send, Paperclip, X } from 'lucide-react';



import { useAuth } from '../../context/AuthContext';



interface Message {

  _id: string;

  sender: { _id: string; name: string };

  recipient: { _id: string; name: string };

  content: string;

  attachments: { filename: string; url: string }[];

  createdAt: string;

}



interface Thread {

  _id: string;

  subject: string;

  isOpen: boolean;

}



interface AdminThreadDetailProps {

  threadId: string;

}



const AdminThreadDetail: React.FC<AdminThreadDetailProps> = ({ threadId }) => {

  const { user } = useAuth();

  const [thread, setThread] = useState<Thread | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [newMessage, setNewMessage] = useState('');

  const [attachments, setAttachments] = useState<File[]>([]);

  const router = useRouter();

  const [error, setError] = useState<string | null>(null);





  useEffect(() => {

    fetchThreadDetails();

  }, [threadId]);



  const fetchThreadDetails = async () => {

    try {

      const token = localStorage.getItem('token');

      console.log('Fetching thread details for ID:', threadId);

      const response = await fetch(`/api/admin/threads/${threadId}`, {

        headers: {

          'Authorization': `Bearer ${token}`

        }

      });



      if (!response.ok) {

        throw new Error(`HTTP error! status: ${response.status}`);

      }



      const data = await response.json();

      console.log('Received data:', data);



      if (data.success) {

        setThread(data.data.thread);

        setMessages(data.data.messages);

      } else {

        throw new Error(data.message || 'Failed to fetch thread details');

      }

    } catch (error) {
      console.error('Error fetching thread details:', error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Wystąpił nieznany błąd podczas pobierania szczegółów wątku.');
      }
    }


  };



  const handleSendMessage = async () => {

    try {

      const token = localStorage.getItem('token');

      const formData = new FormData();

      formData.append('content', newMessage);

      attachments.forEach(file => formData.append('attachments', file));



      console.log('Sending message:', newMessage);

      console.log('Attachments:', attachments);



      const response = await fetch(`/api/admin/threads/${threadId}/messages`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${token}`

        },

        body: formData

      });





      if (!response.ok) {

        throw new Error(`HTTP error! status: ${response.status}`);

      }



      const data = await response.json();

      if (data.success) {

        setMessages(prevMessages => [...prevMessages, data.data]);

        setNewMessage('');

        setAttachments([]);

      } else {

        throw new Error(data.message || 'Failed to send message');

      }

    } catch (error) {

      console.error('Error sending message:', error);

    }

  };



  const handleToggleThreadStatus = async () => {

    try {

      const token = localStorage.getItem('token');

      const response = await fetch(`/api/admin/threads/${threadId}/toggle-status`, {

        method: 'PUT',

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json'

        }

      });



      if (!response.ok) {

        const errorData = await response.json();

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);

      }



      const data = await response.json();

      if (data.success) {

        setThread(data.data);


        throw new Error(data.message || 'Failed to toggle thread status');

      }

    } catch (error) {
      console.error('Error details:', error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Wystąpił nieznany błąd');
      }
    }

  };





  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files) {

      setAttachments(Array.from(e.target.files));

    }

  };



  const removeAttachment = (index: number) => {

    setAttachments(prev => prev.filter((_, i) => i !== index));

  };



  if (!thread) {

    return <div>Ładowanie...</div>;

  }



  if (error) {

    return <div className="text-red-500">{error}</div>;

  }



  return (

    <div className="space-y-6">

      <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">

        <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-800">

          <ArrowLeft className="mr-2" size={18} /> Powrót

        </button>

        <h2 className="text-2xl font-bold">{thread.subject}</h2>

        <button

          onClick={handleToggleThreadStatus}

          className={`px-3 py-1 rounded-full ${thread.isOpen ? 'bg-green-500' : 'bg-yellow-500'} text-white`}

        >

          {thread.isOpen ? 'Otwarty' : 'Zamknięty'}

        </button>

      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto">

        {messages.map((message) => (

          <div key={message._id} className="p-4 bg-white rounded-lg shadow">

            <div className="flex justify-between text-sm text-gray-500 mb-2">

              <span>{message.sender.name}</span>

              <span>{new Date(message.createdAt).toLocaleString()}</span>

            </div>

            <p>{message.content}</p>

            {message.attachments.length > 0 && (

              <div className="mt-2">

                <h4 className="font-semibold text-sm">Załączniki:</h4>

                <ul className="list-disc list-inside">

                  {message.attachments.map((attachment, index) => (

                    <li key={index}>

                      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">

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

      {thread.isOpen && (

        <div className="mt-6">

          <textarea

            value={newMessage}

            onChange={(e) => setNewMessage(e.target.value)}

            className="w-full p-2 border rounded"

            rows={4}

            placeholder="Treść wiadomości..."

          />

          <div className="mt-2 flex items-center space-x-2">

            <input

              type="file"

              onChange={handleFileChange}

              multiple

              className="hidden"

              id="file-upload"

            />

            <label htmlFor="file-upload" className="cursor-pointer bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center">

              <Paperclip className="mr-2" size={18} /> Dodaj załącznik

            </label>

            {attachments.map((file, index) => (

              <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded">

                <span className="text-sm truncate max-w-xs">{file.name}</span>

                <button onClick={() => removeAttachment(index)} className="ml-2 text-red-500">

                  <X size={14} />

                </button>

              </div>

            ))}

          </div>

          <button

            onClick={handleSendMessage}

            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded flex items-center"

          >

            <Send className="mr-2" size={18} /> Wyślij

          </button>

        </div>

      )}

    </div>

  );

};



export default AdminThreadDetail;