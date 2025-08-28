// src/components/dashboard/MessageList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Loader, MessageCircle, Search, Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface Thread {
  _id: string;
  subject: string;
  participants: Array<{ _id: string; name: string }>;
  lastMessage: Message;
  lastMessageDate: string;
  isOpen: boolean;
  department: string;
}

const ITEMS_PER_PAGE = 10;

const departmentNames: { [key: string]: string } = {
  'tech': 'Pomoc techniczna',
  'payment': 'Płatności',
  'complaint': 'Reklamacja',
  'other': 'Inne'
};


const MessageList: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Thread>('lastMessageDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/threads`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setThreads(data.data);
      } else {
        console.error('Error fetching threads:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Thread) => {
    setSortField(field);
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedThreads = threads
    .filter(thread => {
      const matchesSearch =
        thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

      switch (filter) {
        case 'inbox':
          return matchesSearch && thread.participants.some(p => p._id !== user?.id);
        case 'sent':
          return matchesSearch && thread.participants.some(p => p._id === user?.id);
        case 'unread':
          return matchesSearch && !thread.isOpen;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const pageCount = Math.ceil(filteredAndSortedThreads.length / ITEMS_PER_PAGE);
  const paginatedThreads = filteredAndSortedThreads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4 text-foreground">

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Skrzynka</h2>
        <Link href="/dashboard/messages/new" className="bg-primary text-primary-foreground px-3 py-1 rounded-md flex items-center hover:bg-primary/90 transition-colors text-sm">
          <Plus className="mr-1" size={16} /> Nowa wiadomość
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Szukaj w historii..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-md bg-background text-foreground"
          />
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded-md bg-background text-foreground"
        >
          <option value="all">Wszystkie</option>
          <option value="inbox">Odebrane</option>
          <option value="sent">Wysłane</option>
          <option value="unread">Nieprzeczytane</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-primary" size={48} />
        </div>
      ) : paginatedThreads.length === 0 ? (
        <div className="text-center py-10">
          <MessageCircle className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">Brak wiadomości do wyświetlenia</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-4 gap-4 font-bold mb-2 text-muted-foreground px-4">
            <div className="cursor-pointer" onClick={() => handleSort('subject')}>
              Temat {sortField === 'subject' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
            </div>
            <div className="cursor-pointer" onClick={() => handleSort('department')}>
              Dział pomocy {sortField === 'department' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
            </div>
            <div className="cursor-pointer" onClick={() => handleSort('lastMessageDate')}>
              Data {sortField === 'lastMessageDate' && (sortDirection === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
            </div>
            <div>Status</div>
          </div>
          <div className="space-y-2">
            {paginatedThreads.map((thread) => (
              <Link href={`/dashboard/messages/${thread._id}`} key={thread._id}>
                <div className={`grid grid-cols-4 gap-4 p-4 border rounded-lg ${thread.isOpen
                  ? theme === 'dark' ? 'bg-primary/20 hover:bg-primary/30' : 'bg-white hover:bg-gray-50'
                  : theme === 'dark' ? 'bg-secondary hover:bg-secondary/80' : 'bg-gray-100 hover:bg-gray-200'
                  } transition duration-200`}>
                  <div className="font-medium">{thread.subject}</div>
                  <div>{departmentNames[thread.department] || 'Nieznany dział'}</div>
                  <div>{new Date(thread.lastMessageDate).toLocaleString()}</div>
                  <div>
                    {thread.isOpen ? (
                      <span className="text-green-500">Otwarty</span>
                    ) : (
                      <span className="text-yellow-500">Zamknięty</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <span>Strona {currentPage} z {pageCount}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
              disabled={currentPage === pageCount}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;