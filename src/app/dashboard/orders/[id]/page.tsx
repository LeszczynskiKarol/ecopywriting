// src/app/dashboard/orders/[id]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Send, FileText, Clock, DollarSign, Type, Globe, X } from 'lucide-react';

interface OrderItem {
    topic: string;
    length: number;
    price: number;
    contentType: string;
    language: string;
    guidelines?: string;
}

interface OrderComment {
    _id: string;
    user: {
        _id: string;
        name: string;
    };
    content: string;
    createdAt: string;
    attachments: {
        filename: string;
        url: string;
    }[];
    isAdminComment: boolean;
}

interface Order {
    _id: string;
    orderNumber: number;
    items: OrderItem[];
    totalPrice: number;
    status: string;
    createdAt: string;
    declaredDeliveryDate: string;
    hasUnreadNotifications?: boolean;
    attachments?: {
        [key: string]: any;
    };
    userAttachments?: {
        filename: string;
        url: string;
    }[];
    completedStatusFiles?: {
        filename: string;
        url: string;
        uploadDate: string;
    }[];
}

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.id as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [comments, setComments] = useState<OrderComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentAttachments, setCommentAttachments] = useState<File[]>([]);


    useEffect(() => {
        fetchOrderDetails();
        fetchComments();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setOrder(data.data);
            } else {
                console.error('Błąd pobierania szczegółów zamówienia');
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setComments(data.data);
            } else {
                console.error('Błąd pobierania komentarzy');
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    };

    const handleCommentSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('content', newComment);
            commentAttachments.forEach(file => formData.append('attachments', file));

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setComments(prevComments => [...prevComments, data.data]);
                setNewComment('');
                setCommentAttachments([]);
            } else {
                console.error('Błąd dodawania komentarza');
            }
        } catch (error) {
            console.error('Błąd:', error);
        }
    };

    const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setCommentAttachments(prevAttachments => [...prevAttachments, ...Array.from(e.target.files!)]);
        }
    };



    const translateContentType = (contentType: string): string => {
        switch (contentType) {
            case 'article': return 'artykuł';
            case 'product_description': return 'opis produktu';
            case 'category_description': return 'opis kategorii';
            case 'website_content': return 'tekst na stronę firmową';
            case 'social_media_post': return 'post do social media';
            case 'other': return 'inny';
            default: return contentType;
        }
    };

    const translateLanguage = (language: string): string => {
        switch (language) {
            case 'polish': return 'polski';
            case 'english': return 'angielski';
            case 'german': return 'niemiecki';
            default: return language;
        }
    };

    const hasAttachments = (order: Order) => {
        if (order.attachments && Object.values(order.attachments).some(att =>
            att && (Array.isArray(att) ? att.length > 0 : true)
        )) {
            return true;
        }
        if (order.completedStatusFiles && order.completedStatusFiles.length > 0) {
            return true;
        }
        if (order.userAttachments && order.userAttachments.length > 0) {
            return true;
        }
        return false;
    };


    if (!order) {
        return <div className="flex justify-center items-center h-screen">Ładowanie...</div>;
    }
    return (

        <div>
            <h1 className="text-2xl font-bold mb-6">Szczegóły zamówienia #{order.orderNumber}</h1>

            {/* Informacje o zamówieniu */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Informacje o zamówieniu</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${order.status === 'zakończone' ? 'bg-green-500' :
                            order.status === 'w trakcie' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                        <span>Status: {order.status}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="mr-2" size={18} />
                        <span>Data utworzenia: {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="mr-2" size={18} />
                        <span>Termin realizacji: {new Date(order.declaredDeliveryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                        <DollarSign className="mr-2" size={18} />
                        <span>Łączna cena: {order.totalPrice.toFixed(2)} zł</span>
                    </div>
                </div>
            </div>

            {/* Zamówione elementy */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Zamówione teksty</h2>
                {order.items.map((item, index) => (
                    <div key={index} className="mb-6 last:mb-0 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">{item.topic}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center">
                                <Type className="mr-2" size={18} />
                                <span>Długość: {item.length} znaków</span>
                            </div>
                            <div className="flex items-center">
                                <DollarSign className="mr-2" size={18} />
                                <span>Cena: {item.price.toFixed(2)} zł</span>
                            </div>
                            <div className="flex items-center">
                                <FileText className="mr-2" size={18} />
                                <span>Typ treści: {translateContentType(item.contentType)}</span>
                            </div>
                            <div className="flex items-center">
                                <Globe className="mr-2" size={18} />
                                <span>Język: {translateLanguage(item.language)}</span>
                            </div>
                        </div>
                        {item.guidelines && (
                            <div className="mt-2">
                                <strong>Wytyczne:</strong>
                                <p className="bg-white dark:bg-gray-600 p-2 rounded mt-1">{item.guidelines}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Załączniki */}
            {hasAttachments(order) && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
                    <h2 className="text-xl font-semibold mb-2">Załączniki</h2>

                    {/* Załączniki użytkownika */}
                    {order.userAttachments && order.userAttachments.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Twoje załączniki:</h3>
                            <ul className="space-y-2">
                                {order.userAttachments.map((attachment, index) => (
                                    <li key={index}>
                                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                                            {attachment.filename}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Załączniki administratora */}
                    {(order.attachments && Object.keys(order.attachments).length > 0) || (order.completedStatusFiles && order.completedStatusFiles.length > 0) ? (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Dodane przez eCopywriting:</h3>
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
                                                <h4 className="font-semibold mb-2">{fileType.charAt(0).toUpperCase() + fileType.slice(1)}</h4>
                                                <ul className="list-none">
                                                    {attachment && (
                                                        Array.isArray(attachment)
                                                            ? attachment.map((file, index) => (
                                                                <li key={index} className="mb-1">
                                                                    <a
                                                                        href={file.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center text-blue-500 hover:underline"
                                                                    >
                                                                        <FileText size={16} className="mr-2" />
                                                                        {file.filename}
                                                                    </a>
                                                                </li>
                                                            ))
                                                            : (
                                                                <li className="mb-1">
                                                                    <a
                                                                        href={attachment.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center text-blue-500 hover:underline"
                                                                    >
                                                                        <FileText size={16} className="mr-2" />
                                                                        {attachment.filename}
                                                                    </a>
                                                                </li>
                                                            )
                                                    )}
                                                    {completedFiles && completedFiles.map((file, index) => (
                                                        <li key={`completed-${index}`} className="mb-1">
                                                            <a
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center text-blue-500 hover:underline"
                                                            >
                                                                <FileText size={16} className="mr-2" />
                                                                {file.filename}
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
                    ) : null}
                </div>
            )}

            {/* Komentarze */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Komentarze</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                    {comments.map(comment => (
                        <div key={comment._id} className={`p-3 rounded ${comment.isAdminComment ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <p className="font-semibold">{comment.user.name} ({new Date(comment.createdAt).toLocaleString()})</p>
                            <p className="mt-1">{comment.content}</p>
                            {comment.attachments.length > 0 && (
                                <div className="mt-2">
                                    <p className="font-semibold">Załączniki:</p>
                                    <ul className="list-disc list-inside">
                                        {comment.attachments.map((attachment, index) => (
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
                <div>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Dodaj komentarz..."
                    />



                    <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {commentAttachments.map((file, index) => (
                                <div key={index} className="bg-gray-200 dark:bg-gray-600 p-2 rounded flex items-center">
                                    <span className="mr-2">{file.name}</span>
                                    <button onClick={() => setCommentAttachments(commentAttachments.filter((_, i) => i !== index))} className="text-red-500">
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <input
                                type="file"
                                onChange={handleCommentFileChange}
                                multiple
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-full sm:w-auto"
                            />
                            <button
                                onClick={handleCommentSubmit}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
                            >
                                <Send size={16} className="inline mr-2" />
                                Wyślij
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
