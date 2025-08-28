// src/components/modals/OrderConfirmationModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check } from 'lucide-react';

interface OrderConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderNumber: number;
    totalPrice: number;
    discount: number;
    itemsCount: number;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
    isOpen,
    onClose,
    orderNumber,
    totalPrice,
    discount,
    itemsCount
}) => {
    React.useEffect(() => {
        if (isOpen) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 mb-4">
                                <Check className="h-6 w-6 text-green-600 dark:text-green-200" />
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Zamówienie złożone pomyślnie!
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Numer zamówienia: {orderNumber}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Liczba zamówionych treści: {itemsCount}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Wartość zamówienia: {totalPrice.toFixed(2).replace('.', ',')} zł
                                </p>
                                {discount > 0 && (
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                        Zastosowany rabat: {discount}%
                                    </p>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                    Możesz śledzić postęp realizacji zamówienia w sekcji &quot;Zamówienia&quot; w panelu klienta.
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    O każdej aktualizacji zamówienia poinformujemy mailowo.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6">
                            <button
                                type="button"
                                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600 sm:text-sm"
                                onClick={onClose}
                            >
                                Zamknij
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OrderConfirmationModal;