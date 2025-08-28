// src/components/dashboard/OrderForm.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { analyticsEvents } from '../../utils/analytics';
import { useAuth } from '../../context/AuthContext';
import { useLoader } from '../../context/LoaderContext';
import { Plus, Minus, Upload, X } from 'lucide-react';
import Notification from '../common/Notification';
import Image from 'next/image';
import OrderConfirmationModal from '../modals/OrderConfirmationModal';

interface ConfirmedOrder {
  orderNumber: number;
  totalPrice: number;
  discount: number;
  itemsCount: number;
}

const contentTypes = [
  { value: 'article', label: 'Artykuł' },
  { value: 'product_description', label: 'Opis produktu' },
  { value: 'category_description', label: 'Opis kategorii' },
  { value: 'website_content', label: 'Tekst na stronę firmową' },
  { value: 'social_media_post', label: 'Post do mediów społecznościowych' },
  { value: 'other', label: 'Inny (określ w wytycznych)' }
];

const languages = [
  { value: 'polish', label: 'Polski', flag: '/images/pl-flag.png' },
  { value: 'english', label: 'Angielski', flag: '/images/en-flag.png' },
  { value: 'german', label: 'Niemiecki', flag: '/images/de-flag.png' }
];


const OrderForm: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const [orderItems, setOrderItems] = useState([{ topic: '', length: 1000, guidelines: '', contentType: 'article', language: 'polish' }]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ originalname: string, location: string }[]>([]);
  const [totalPrice, setTotalPrice] = useState('0,00');
  const [discountedPrice, setDiscountedPrice] = useState('0,00');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [declaredDeliveryDate, setDeclaredDeliveryDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [showOrderConfirmationModal, setShowOrderConfirmationModal] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);


  useEffect(() => {
    calculatePrices();
    calculateDeliveryDate();
  }, [orderItems]);

  const calculateDeliveryDate = () => {
    const totalLength = orderItems.reduce((sum, item) => sum + item.length, 0);
    let deliveryDate = new Date();
    let additionalDays = 0;

    if (totalLength <= 5000) {
      additionalDays = 1;
    } else if (totalLength <= 10000) {
      additionalDays = 2;
    } else if (totalLength <= 20000) {
      additionalDays = 3;
    } else if (totalLength <= 50000) {
      additionalDays = 6;
    } else if (totalLength <= 100000) {
      additionalDays = 14;
    } else if (totalLength <= 200000) {
      additionalDays = 21;
    } else if (totalLength <= 300000) {
      additionalDays = 40;
    } else {
      additionalDays = 60;
    }

    while (additionalDays > 0) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        additionalDays--;
      }
    }

    setDeclaredDeliveryDate(deliveryDate);


  };


  const calculatePrices = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.length || 0) * 0.020, 0);
    let discount = 0;
    if (subtotal >= 500) {
      discount = 20;
    } else if (subtotal >= 200) {
      discount = 10;
    }
    const discountedTotal = subtotal * (1 - discount / 100);

    setTotalPrice(subtotal.toFixed(2).replace('.', ','));
    setDiscountedPrice(discountedTotal.toFixed(2).replace('.', ','));
    setAppliedDiscount(discount);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { topic: '', length: 1000, guidelines: '', contentType: 'article', language: 'polish' }]);
  };



  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const getDiscountMessage = () => {
    const subtotal = parseFloat(totalPrice.replace(',', '.'));
    const formatPrice = (price: number) => price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';

    if (subtotal < 200) {
      const remainingTo10Percent = 200 - subtotal;
      return `Do rabatu 10% brakuje ${formatPrice(remainingTo10Percent)}`;
    } else if (subtotal < 500) {
      const remainingTo20Percent = 500 - subtotal;
      return `Do rabatu 20% brakuje ${formatPrice(remainingTo20Percent)}`;
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (files.length + newFiles.length > 5) {
      setNotification({ message: 'Możesz dodać maksymalnie 5 plików.', type: 'error' });
      return;
    }

    setFiles([...files, ...newFiles]);
    for (const file of newFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        console.log('Sending file:', file.name);

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Upload successful:', data);
          setUploadedFiles(prev => [...prev, { originalname: data.originalname, location: data.url }]);
        } else {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error(errorData.message || 'File upload failed');
        }
      } catch (error: unknown) {
        console.error('Error uploading file:', error);
        setNotification({
          message: `Błąd podczas przesyłania pliku: ${file.name}. ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
          type: 'error'
        });
      }
    }
  };


  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoader();
    setIsLoading(true);
    analyticsEvents.orderStart();
    const totalPriceValue = parseFloat(discountedPrice.replace(',', '.'));
    const userBalance = user?.accountBalance || 0;
    let missingAmount = Math.max(0, totalPriceValue - userBalance);

    if (missingAmount > 0 && missingAmount < 20) {
      missingAmount = 20;
    }

    try {
      const orderItemsData = orderItems.map(item => ({
        topic: item.topic,
        length: item.length,
        contentType: item.contentType || 'article',
        language: item.language || 'polish',
        guidelines: item.guidelines
      }));

      const filesData = uploadedFiles.map(file => ({
        filename: file.originalname,
        url: file.location
      }));

      console.log('Sending data:', {
        orderItems: orderItemsData,
        totalPrice: totalPriceValue,
        appliedDiscount,
        declaredDeliveryDate: declaredDeliveryDate?.toISOString(),
        missingAmount,
        files: filesData
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderItems: orderItemsData,
          totalPrice: totalPriceValue,
          appliedDiscount,
          declaredDeliveryDate: declaredDeliveryDate?.toISOString(),
          missingAmount,
          userAttachments: filesData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Wystąpił problem podczas składania zamówienia');
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        if (data.paymentUrl) {
          // Zapisz token przed przekierowaniem
          const currentToken = localStorage.getItem('token');
          if (currentToken) {
            localStorage.setItem('auth_token_temp', currentToken);
          }
          window.location.href = data.paymentUrl;
        } else {
          localStorage.setItem('lastOrderConfirmed', JSON.stringify({
            orderNumber: data.order.orderNumber,
            totalPrice: data.order.totalPrice,
            discount: appliedDiscount,
            itemsCount: orderItems.length,
          }));
          analyticsEvents.orderComplete(
            data.order.orderNumber,
            data.order.totalPrice,
            orderItems.length
          );
          setConfirmedOrder({
            orderNumber: parseInt(data.order.orderNumber, 10),
            totalPrice: data.order.totalPrice,
            discount: appliedDiscount,
            itemsCount: orderItems.length,
          });
          setIsConfirmationModalOpen(true);
          setOrderItems([{ topic: '', length: 1000, guidelines: '', contentType: 'article', language: 'polish' }]);
          setFiles([]);
          await refreshUserData();
        }
      }
    } catch (error: unknown) {
      console.error('Błąd podczas składania zamówienia:', error);
      setNotification({
        message: error instanceof Error ? error.message : 'Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie później.',
        type: 'error'
      });
    } finally {
      hideLoader();
      setIsLoading(false);
    }
  };


  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">


        {orderItems.map((item, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium dark:text-white">Zamówienie {index + 1}</h3>
              {orderItems.length > 1 && (
                <button type="button" onClick={() => removeOrderItem(index)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  <X size={20} />
                </button>
              )}
            </div>
            <select
              value={item.contentType}
              onChange={(e) => updateOrderItem(index, 'contentType', e.target.value)}
              className="w-full p-2 border rounded mb-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20"
              required
            >

              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Temat"
              value={item.topic}
              onChange={(e) => updateOrderItem(index, 'topic', e.target.value)}
              className="w-full p-2 border rounded mb-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20"
              required
            />

            <div className="flex items-center mb-2">
              <label className="mr-2 dark:text-white">Długość:</label>
              <button
                type="button"
                onClick={() => updateOrderItem(index, 'length', Math.max(1000, item.length - 1000))}
                className="p-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-l border border-gray-200 dark:border-gray-600"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={item.length}
                onChange={(e) => updateOrderItem(index, 'length', Math.max(1000, parseInt(e.target.value)))}
                className="w-24 p-2 border-y text-center bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1000"
                step="1000"
                required
              />
              <button
                type="button"
                onClick={() => updateOrderItem(index, 'length', item.length + 1000)}
                className="p-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-r border border-gray-200 dark:border-gray-600"
              >
                <Plus size={16} />
              </button>
              <span className="ml-2 dark:text-white">znaków</span>
            </div>
            <div className="mb-2">
              <label className="block mb-1 dark:text-white">Język:</label>
              <div className="flex">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => updateOrderItem(index, 'language', lang.value)}
                    className={`
          flex items-center mr-2 p-2 border rounded transition-all duration-200
          ${item.language === lang.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm relative'
                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                      }
        `}
                  >
                    <Image src={lang.flag} alt={lang.label} width={20} height={20} className="mr-2" />
                    <span>{lang.label}</span>
                    {item.language === lang.value && (
                      <svg
                        className="w-3.5 h-3.5 ml-2 text-blue-500 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Wytyczne"
              value={item.guidelines}
              onChange={(e) => updateOrderItem(index, 'guidelines', e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20"
              rows={3}
            />
          </div>
        ))}

        <button type="button" onClick={addOrderItem} className="w-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <Plus size={20} className="inline mr-2" /> Dodaj kolejny tekst
        </button>
        <div className="mt-4">
          <label className="block mb-2 dark:text-white">Dodaj pliki (max 5, każdy do 10 MB):</label>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 px-4 py-2">
            <Upload size={16} className="inline mr-2" /> Wybierz pliki
          </label>
          <div className="mt-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2">
                <span className="dark:text-white">{file.name}</span>
                <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-green-100 dark:bg-green-800 p-4 rounded-lg">
          <p className="text-xl font-semibold dark:text-white">
            Cena: {totalPrice} zł
          </p>
          {appliedDiscount > 0 && (
            <>
              <p className="text-lg text-green-600 dark:text-green-400 mt-2">
                Rabat: {appliedDiscount}%
              </p>
              <p className="text-xl font-semibold text-green-700 dark:text-green-300 mt-2">
                Cena po rabacie: {discountedPrice} zł
              </p>


            </>
          )}

          {getDiscountMessage() && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              {getDiscountMessage()}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Przewidywany termin realizacji: {declaredDeliveryDate ? declaredDeliveryDate.toLocaleString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Obliczanie...'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Twoje saldo: {user?.accountBalance !== undefined ? user.accountBalance.toFixed(2).replace('.', ',') : '0,00'} zł
          </p>
        </div>

        <button type="submit" className="w-full bg-blue-500 dark:bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300">
          Złóż zamówienie
        </button>
      </form>
      <OrderConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        orderNumber={confirmedOrder?.orderNumber ?? 0}
        totalPrice={confirmedOrder?.totalPrice ?? 0}
        discount={confirmedOrder?.discount ?? 0}
        itemsCount={confirmedOrder?.itemsCount ?? 0}
      />
    </>
  );
};


export default OrderForm;