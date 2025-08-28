// src/components/dashboard/MobileOrderTable.tsx
import React from 'react';
import { Image, CheckCircle, ChevronDown, ChevronUp, Bell, FileText, Paperclip, Send } from 'lucide-react';
import { Order, OrderComment } from '../../types/order';




interface MobileOrderTableProps {
    orders: (Order & { hasUnreadNotifications: boolean })[];
    expandedOrder: string | null;
    toggleOrderExpansion: (orderId: string) => void;
    comments: { [orderId: string]: OrderComment[] };
    newComments: { [orderId: string]: string };
    setNewComments: React.Dispatch<React.SetStateAction<{ [orderId: string]: string }>>;
    handleCommentSubmit: (orderId: string) => void;
    handleCommentFileChange: (orderId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    commentAttachments: { [orderId: string]: File[] };
    translateContentType: (contentType: string) => string;
    translateLanguage: (language: string) => string;
    translateFileType: (fileType: string) => string;
}


const MobileOrderTable: React.FC<MobileOrderTableProps> = ({
    orders,
    expandedOrder,
    toggleOrderExpansion,
    comments,
    newComments,
    setNewComments,
    handleCommentSubmit,
    handleCommentFileChange,
    commentAttachments,
    translateContentType,
    translateLanguage,
    translateFileType
}) => {


    const truncateFileName = (filename: string) => {
        const words = filename.split(/[\s-_]/);
        if (words.length > 5) {
            return words.slice(0, 5).join(' ') + '...';
        }
        return filename;
    };

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="font-semibold">Nr {order.orderNumber || 'N/A'}</span>
                            {order.hasUnreadNotifications && expandedOrder !== order._id && (
                                <Bell className="ml-2 text-red-500 inline" size={16} />
                            )}
                        </div>
                        <button
                            onClick={() => toggleOrderExpansion(order._id)}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            {expandedOrder === order._id ? <ChevronUp /> : <ChevronDown />}
                        </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>Data: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Termin: {new Date(order.declaredDeliveryDate).toLocaleDateString()}</p>
                        <p>Cena: {order.totalPrice.toFixed(2).replace('.', ',')} zł</p>
                    </div>
                    <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-sm ${order.status === 'zakończone' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                            order.status === 'w trakcie' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                                'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                            {order.status}
                        </span>
                    </div>
                    {expandedOrder === order._id && (
                        <div className="mt-4 border-t pt-4 dark:border-gray-700">
                            {/* Szczegóły zamówienia */}
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

                            {/* Załączniki użytkownika */}
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

                            {/* Załączniki administratora */}
                            {order.attachments &&
                                Object.keys(order.attachments).length > 0 &&
                                Object.values(order.attachments).some(attachment => attachment &&
                                    (Array.isArray(attachment) ? attachment.length > 0 : true)) && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2 flex items-center">
                                            <Paperclip className="mr-2" /> Załączniki od eCopywriting:
                                        </h4>
                                        <div className="space-y-2">
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

                            {/* Komentarze */}
                            <div className="mt-4">
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
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                        placeholder="Dodaj komentarz..."
                                        rows={4}
                                    />
                                    <div className="mt-2 space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {commentAttachments[order._id]?.map((file, index) => (
                                                <div key={index} className="bg-gray-200 dark:bg-gray-600 p-2 rounded flex items-center">
                                                    <span className="mr-2">{file.name}</span>
                                                    <button onClick={() => {
                                                        const newAttachments = [...commentAttachments[order._id]];
                                                        newAttachments.splice(index, 1);
                                                        // Tutaj powinna być funkcja do aktualizacji stanu attachmentów
                                                    }} className="text-red-500">
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
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MobileOrderTable;