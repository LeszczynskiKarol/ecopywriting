// src/components/ui/ModalDialog.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info'
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-gray-700 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`bg-white rounded-lg shadow-xl max-w-md w-full ${getTypeStyles()} border`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p>{message}</p>
            </div>
            <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-150 ease-in-out"
              >
                Anuluj
              </button>
              {onConfirm && (
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 ease-in-out"
                >
                  Wyślij nowy kod
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalDialog;