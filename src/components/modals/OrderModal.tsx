// src/components/modals/OrderModal.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, Plus, Trash2, Minus } from 'lucide-react';

interface OrderItem {
  id: number;
  topic: string;
  length: number;
  guidelines: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ id: 1, topic: '', length: 1000, guidelines: '' }]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const addOrderItem = () => {
    const newId = orderItems.length > 0 ? Math.max(...orderItems.map(item => item.id)) + 1 : 1;
    setOrderItems([...orderItems, { id: newId, topic: '', length: 1000, guidelines: '' }]);
  };

  const removeOrderItem = (id: number) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const updateOrderItem = (id: number, field: keyof OrderItem, value: string | number) => {
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotalPrice = () => {
    const totalCharacters = orderItems.reduce((sum, item) => sum + (item.length || 0), 0);
    const price = totalCharacters / 1000 * 18;
    return price.toFixed(2).replace('.', ',');
  };

  const calculateTotalCharacters = () => {
    return orderItems.reduce((sum, item) => sum + (item.length || 0), 0);
  };

  const updateOrderItemLength = (id: number, change: number) => {
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, length: Math.max(1000, (item.length || 0) + change) } : item
    ));
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg p-6 m-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Zamów artykuły</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Twoje imię"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Twój email"
                />
              </div>
            </div>

            <div className="mb-4 space-y-4">
              {orderItems.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Artykuł {index + 1}</h3>
                    <button onClick={() => removeOrderItem(item.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Temat artykułu"
                    value={item.topic}
                    onChange={(e) => updateOrderItem(item.id, 'topic', e.target.value)}
                    className="w-full p-2 mb-2 border rounded bg-white focus:ring-2 focus:ring-blue-500"
                  />
                <div className="flex items-center mb-2">
                  <label className="mr-2 text-sm font-medium text-gray-700">Długość:</label>
                  <button
                    onClick={() => updateOrderItemLength(item.id, -1000)}
                    className="p-1 bg-gray-200 rounded-l"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={item.length || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(1000, parseInt(e.target.value));
                      updateOrderItem(item.id, 'length', value);
                    }}
                    className="w-24 p-2 border-y bg-white focus:ring-2 focus:ring-blue-500 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => updateOrderItemLength(item.id, 1000)}
                    className="p-1 bg-gray-200 rounded-r"
                  >
                    <Plus size={16} />
                  </button>
                  <span className="ml-2 text-sm text-gray-600">znaków</span>
                </div>
                  <textarea
                    placeholder="Wytyczne indywidualne"
                    value={item.guidelines}
                    onChange={(e) => updateOrderItem(item.id, 'guidelines', e.target.value)}
                    className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addOrderItem}
              className="mb-4 flex items-center justify-center w-full p-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-500 bg-white"
            >
              <Plus size={20} className="mr-2" />
              Dodaj kolejny artykuł
            </button>

            <div className="text-center mb-4 p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{calculateTotalPrice()} zł</p>
            <p className="text-sm text-gray-600">Łączna liczba znaków: {calculateTotalCharacters()}</p>
            <p className="text-sm font-medium text-green-600">Opłać teraz i uzyskaj najniższą cenę!</p>
          </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Skontaktuj się z nami</h3>
              <div className="flex items-center mb-2">
                <Phone size={20} className="text-green-500 mr-2" />
                <a href="tel:509307772" className="text-gray-800 hover:underline">509 307 772</a>
              </div>
              <div className="flex items-center">
                <Mail size={20} className="text-green-500 mr-2" />
                <a href="mailto:kontakt@ecopywriting.pl" className="text-gray-800 hover:underline">kontakt@ecopywriting.pl</a>
              </div>
            </div>

            <div className="flex justify-between items-center space-x-4">
              <button
                className="flex-grow bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300 text-lg"
                onClick={() => {
                  console.log('Zamówienie:', { clientName, clientEmail, orderItems });
                  onClose();
                }}
              >
                Zamów teraz
              </button>
              <button
                className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded hover:bg-gray-300 transition duration-300"
                onClick={() => console.log('Przekierowanie do panelu klienta')}
              >
                Panel klienta
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderModal;