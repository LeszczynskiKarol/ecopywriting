// src/components/dashboard/OrderHistory.tsx
'use client'
import { Order, OrderComment } from '../../types/order';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Send, Bell, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileText, Image, Paperclip, Globe, Type } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';
import MobileOrderTable from './MobileOrderTable';

interface OrderHistoryProps {
  onOrderSuccess: (details: {
    orderNumber: string;
    totalPrice: number;
    discount: number;
    itemsCount: number;
  }) => void;
}

interface OrderItem {
  topic: string;
  length: number;
  price: number;
  contentType: string;
  language: string;
}


const OrderHistory: React.FC<OrderHistoryProps> = ({ onOrderSuccess }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Order>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { user } = useAuth();
  const [orderCounter, setOrderCounter] = useState(1);
  const [comments, setComments] = useState<{ [orderId: string]: OrderComment[] }>({});
  const [newComments, setNewComments] = useState<{ [orderId: string]: string }>({});
  const [commentAttachments, setCommentAttachments] = useState<{ [orderId: string]: File[] }>({});
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const truncateFileName = (filename: string) => {
    const words = filename.split(/[\s-_]/);
    if (words.length > 5) {
      return words.slice(0, 5).join(' ') + '...';
    }
    return filename;
  };

  const fetchComments = async (orderId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(prevComments => ({
          ...prevComments,
          [orderId]: data.data
        }));
      } else {
        console.error('Błąd pobierania komentarzy');
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };


  const handleCommentSubmit = async (orderId: string) => {
    try {
      const formData = new FormData();
      formData.append('content', newComments[orderId] || '');
      (commentAttachments[orderId] || []).forEach(file => formData.append('attachments', file));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prevComments => ({
          ...prevComments,
          [orderId]: [...(prevComments[orderId] || []), data.data]
        }));
        setNewComments(prevNewComments => ({
          ...prevNewComments,
          [orderId]: ''
        }));
        setCommentAttachments(prevAttachments => ({
          ...prevAttachments,
          [orderId]: []
        }));
      } else {
        console.error('Błąd dodawania komentarza');
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };


  const handleCommentFileChange = (orderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCommentAttachments(prevAttachments => ({
        ...prevAttachments,
        [orderId]: [...(prevAttachments[orderId] || []), ...Array.from(e.target.files!)]
      }));
    }
  };





  const translateContentType = (contentType: string): string => {
    switch (contentType) {
      case 'article':
        return 'artykuł';
      case 'product_description':
        return 'opis produktu';
      case 'category_description':
        return 'opis kategorii';
      case 'website_content':
        return 'tekst na stronę firmową';
      case 'social_media_post':
        return 'post do social media';
      case 'other':
        return 'inny';
      default:
        return contentType;
    }
  };

  const translateLanguage = (language: string): string => {
    switch (language) {
      case 'polish':
        return 'polski';
      case 'english':
        return 'angielski';
      case 'german':
        return 'niemiecki';
      default:
        return language;
    }
  };


  const translateFileType = (fileType: string): string => {
    switch (fileType) {
      case 'image':
        return 'Zdjęcia';
      case 'other':
        return 'Inne';
      default:
        return fileType.toUpperCase();
    }
  };

  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    result.sort((a, b) => {
      if (a[sortField] === undefined || b[sortField] === undefined) return 0;
      if (a[sortField]! < b[sortField]!) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField]! > b[sortField]!) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredOrders(result);
  }, [orders, sortField, sortDirection, statusFilter]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSort = (field: keyof Order) => {
    setSortField(field);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const toggleOrderExpansion = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      try {
        const [orderResponse, markReadResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-read-for-order/${orderId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        if (orderResponse.ok && markReadResponse.ok) {
          const orderData = await orderResponse.json();
          setExpandedOrder(orderId);
          await fetchComments(orderId);
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order._id === orderId
                ? { ...order, ...orderData.data, hasUnreadNotifications: false }
                : order
            )
          );
        } else {
          console.error('Błąd pobierania szczegółów zamówienia lub oznaczania powiadomień jako przeczytane');
        }
      } catch (error) {
        console.error('Błąd:', error);
      }
    }
  };


  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/user`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data);
        setFilteredOrders(data.data);
        setOrderCounter(Math.max(...data.data.map((o: Order) => o.orderNumber || 0)) + 1);

        // Wywołaj onOrderSuccess dla najnowszego zamówienia (jeśli istnieje)
        if (data.data.length > 0) {
          const newestOrder = data.data[0];
          onOrderSuccess({
            orderNumber: newestOrder.orderNumber.toString(),
            totalPrice: newestOrder.totalPrice,
            discount: 0,
            itemsCount: newestOrder.items.length
          });
        }
      } else {
        console.error('Błąd pobierania zamówień');
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };


  const ordersWithStringNumber: (Order & { hasUnreadNotifications: boolean })[] = currentOrders.map(order => ({
    ...order,
    orderNumber: order.orderNumber.toString(),
    hasUnreadNotifications: order.hasUnreadNotifications || false
  }));





  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-4 text-gray-800 dark:text-gray-200">

      <h2 className="text-2xl font-bold">Zamówienia</h2>
      <div className="flex justify-between items-center mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
        >
          <option value="all">Wszystkie statusy</option>
          <option value="oczekujące">Oczekujące</option>
          <option value="w trakcie">W trakcie</option>
          <option value="zakończone">Zakończone</option>
          <option value="anulowane">Anulowane</option>
        </select>
      </div>
      {isMobile ? (
        <MobileOrderTable
          orders={ordersWithStringNumber}
          expandedOrder={expandedOrder}
          toggleOrderExpansion={toggleOrderExpansion}
          comments={comments}
          newComments={newComments}
          setNewComments={setNewComments}
          handleCommentSubmit={handleCommentSubmit}
          handleCommentFileChange={handleCommentFileChange}
          commentAttachments={commentAttachments}
          translateContentType={translateContentType}
          translateLanguage={translateLanguage}
          translateFileType={translateFileType}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="w-[10%] p-3 border-b border-gray-300 dark:border-gray-600 cursor-pointer text-left" onClick={() => handleSort('orderNumber')}>
                  Nr {sortField === 'orderNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="w-[30%] p-3 border-b cursor-pointer text-left" onClick={() => handleSort('createdAt')}>
                  Temat
                </th>
                <th className="w-[15%] p-3 border-b cursor-pointer text-left" onClick={() => handleSort('createdAt')}>
                  Data zamówienia {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="w-[15%] p-3 border-b cursor-pointer text-left" onClick={() => handleSort('declaredDeliveryDate')}>
                  Termin realizacji {sortField === 'declaredDeliveryDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="w-[15%] p-3 border-b cursor-pointer text-left" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="w-[15%] p-3 border-b cursor-pointer text-left" onClick={() => handleSort('totalPrice')}>
                  Łączna cena {sortField === 'totalPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="w-[5%] p-3 border-b text-left">Szczegóły</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    <td className="p-3 flex items-center">
                      {order.orderNumber || 'N/A'}
                      {order.hasUnreadNotifications && expandedOrder !== order._id && (
                        <Bell className="ml-2 text-red-500" size={16} />
                      )}
                    </td>
                    <td className="p-3">
                      <Link href={`/dashboard/orders/${order._id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                        {order.items[0]?.topic || 'Brak tytułu'}
                      </Link>
                    </td>
                    <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">{new Date(order.declaredDeliveryDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded whitespace-nowrap ${order.status === 'zakończone'
                        ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                        : order.status === 'w trakcie'
                          ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                          : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                        {order.status === 'w trakcie' ? 'w\u00A0trakcie' : order.status}
                      </span>
                    </td>
                    <td className="p-3">{order.totalPrice.toFixed(2).replace('.', ',')} zł</td>
                    <td className="p-3">
                      <button onClick={() => toggleOrderExpansion(order._id)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        {expandedOrder === order._id ? <ChevronUp /> : <ChevronDown />}
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr>
                      <td colSpan={7} className="p-3 bg-gray-50 dark:bg-gray-900">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Box szczegółów zamówienia i załączników użytkownika */}
                          <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h4 className="font-semibold mb-2 flex items-center">
                              <FileText className="mr-2" /> Szczegóły zamówienia:
                            </h4>
                            <ul className="space-y-2">
                              {order.items.map((item, index) => (
                                <li key={index} className="flex flex-col">
                                  <div className="flex items-center">

                                    <div className="mt-1">Temat: <span className="font-medium">{item.topic}</span></div>
                                  </div>
                                  <div className="ml-6 mt-1 mb-3 text-sm text-gray-600 dark:text-gray-400">

                                    <span>{item.length} znaków - {item.price.toFixed(2).replace('.', ',')} zł</span>
                                  </div>
                                  <div className="ml-6 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                                      Język: {translateLanguage(item.language)}
                                    </span>
                                    <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                                      Typ zamówienia: {translateContentType(item.contentType)}
                                    </span>
                                    {item.guidelines && (
                                      <div className="mt-2">
                                        <strong>Twoje wytyczne:</strong>
                                        <p className="mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded">{item.guidelines}</p>
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>

                            {/* Sekcja załączników użytkownika */}
                            {order.userAttachments && order.userAttachments.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-semibold mb-2 flex items-center">
                                  <Paperclip className="mr-2" /> Twoje załączniki:
                                </h4>
                                <ul className="space-y-2">
                                  {order.userAttachments.map((attachment, index) => (
                                    <li key={index} className="flex items-center">

                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline dark:text-blue-400"
                                      >
                                        {attachment.filename}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Box załączników administratora */}
                          {order.attachments &&
                            Object.keys(order.attachments).length > 0 &&
                            Object.values(order.attachments).some(attachment => attachment &&
                              (Array.isArray(attachment) ? attachment.length > 0 : true)) && (
                              <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                <h4 className="font-semibold mb-2 flex items-center">
                                  <Paperclip className="mr-2" /> Załączniki od eCopywriting:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {['pdf', 'docx', 'image', 'other'].map(fileType => {
                                    const attachment = order.attachments?.[fileType];
                                    const completedFiles = order.completedStatusFiles?.filter(file => {
                                      const extension = file.filename.split('.').pop()?.toLowerCase();
                                      if (fileType === 'pdf') return extension === 'pdf';
                                      if (fileType === 'docx') return extension === 'docx' || extension === 'doc';
                                      if (fileType === 'image') return ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '');
                                      return !['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'gif'].includes(extension || '');
                                    });

                                    if ((attachment && (fileType !== 'other' || (Array.isArray(attachment) && attachment.length > 0))) || (completedFiles && completedFiles.length > 0)) {
                                      return (
                                        <div key={fileType} className="bg-gray-100 dark:bg-gray-700 p-3 rounded shadow">
                                          <h5 className="font-semibold capitalize flex items-center">
                                            {fileType === 'pdf' && <FileText className="mr-2 text-red-500" />}
                                            {fileType === 'docx' && <FileText className="mr-2 text-blue-500" />}
                                            {fileType === 'image' && <Image className="mr-2 text-green-500" />}
                                            {fileType === 'other' && <Paperclip className="mr-2 text-gray-500" />}
                                            {translateFileType(fileType)}:
                                          </h5>
                                          <ul className="mt-2">
                                            {Array.isArray(attachment) ? (
                                              attachment.map((file, index) => (
                                                <li key={`attachment-${index}`} className="mb-1 flex items-center">
                                                  {fileType === 'pdf' && <FileText className="mr-2 text-red-500" size={16} />}
                                                  {fileType === 'docx' && <FileText className="mr-2 text-blue-500" size={16} />}
                                                  {fileType === 'image' && <Image className="mr-2 text-green-500" size={16} />}
                                                  {fileType === 'other' && <Paperclip className="mr-2 text-gray-500" size={16} />}
                                                  <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline dark:text-blue-400"
                                                    title={decodeURIComponent(file.filename)} // pełna nazwa w tooltipie
                                                  >
                                                    {truncateFileName(decodeURIComponent(file.filename))}
                                                  </a>
                                                </li>
                                              ))
                                            ) : attachment ? (
                                              <li className="mb-1 flex items-center">
                                                {/* Te same ikony co wyżej */}
                                                <a
                                                  href={attachment.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-500 hover:underline dark:text-blue-400"
                                                  title={decodeURIComponent(attachment.filename)}
                                                >
                                                  {truncateFileName(decodeURIComponent(attachment.filename))}
                                                </a>
                                              </li>
                                            ) : null}
                                            {completedFiles?.map((file, index) => (
                                              <li key={`completed-${index}`} className="mb-1 flex items-center">
                                                {/* Te same ikony co wyżej */}
                                                <a
                                                  href={file.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-500 hover:underline dark:text-blue-400"
                                                  title={file.filename}
                                                >
                                                  {truncateFileName(file.filename)}
                                                </a>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              </div>
                            )}


                        </div>
                        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                          <h4 className="font-semibold mb-2">Komentarze:</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {comments[order._id]?.map(comment => (
                              <div key={comment._id} className={`p-2 rounded ${comment.isAdminComment ? 'bg-blue-100 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-600'}`}>
                                <p className="font-semibold">{comment.user.name} ({new Date(comment.createdAt).toLocaleString()})</p>
                                <p>{comment.content}</p>
                                {comment.attachments.length > 0 && (
                                  <div className="mt-2">
                                    <p className="font-semibold">Załączniki:</p>
                                    <ul className="space-y-1">
                                      {comment.attachments.map((attachment, index) => (
                                        <li key={index} className="flex items-center bg-gray-50 dark:bg-gray-600 p-2 rounded">
                                          <Paperclip size={16} className="text-gray-500 mr-2" />
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline flex-1"
                                            title={attachment.filename}
                                          >
                                            {truncateFileName(attachment.filename)}
                                          </a>
                                          <CheckCircle size={16} className="text-green-500 ml-2" />
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div>
                            <textarea
                              value={newComments[order._id] || ''}
                              onChange={(e) => setNewComments({ ...newComments, [order._id]: e.target.value })}
                              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              placeholder="Dodaj komentarz..."
                              rows={4}
                            />
                            <div className="mt-2 space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {commentAttachments[order._id]?.map((file, index) => (
                                  <div key={index} className="bg-gray-200 dark:bg-gray-600 p-2 rounded flex items-center">
                                    <span className="mr-2">{file.name}</span>
                                    <button onClick={() => setCommentAttachments({
                                      ...commentAttachments,
                                      [order._id]: commentAttachments[order._id].filter((_, i) => i !== index)
                                    })} className="text-red-500">
                                      &times;
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center">
                                <input
                                  type="file"
                                  onChange={(e) => handleCommentFileChange(order._id, e)}
                                  multiple
                                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <button
                                  onClick={() => handleCommentSubmit(order._id)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                  <Send size={16} className="inline mr-2" />
                                  Wyślij
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                </React.Fragment>
              ))}

            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 dark:bg-blue-700 dark:disabled:bg-gray-600"
        >
          <ChevronLeft />
        </button>
        <span>Strona {currentPage} z {Math.ceil(filteredOrders.length / ordersPerPage)}</span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 dark:bg-blue-700 dark:disabled:bg-gray-600"
        >
          <ChevronRight />
        </button>
      </div>

    </div>
  );
};

export default OrderHistory;