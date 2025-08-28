// src/components/modals/PaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLoader } from '../../context/LoaderContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentType: 'topUp' | 'order';
    initialAmount?: number;
    orderId?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, paymentType, initialAmount = 0, orderId }) => {
    const [amount, setAmount] = useState(initialAmount.toString());
    const [discount, setDiscount] = useState(0);
    const { showLoader, hideLoader } = useLoader();
    const { user, refreshUserData } = useAuth();

    useEffect(() => {
        const amountNum = parseFloat(amount);
        if (amountNum >= 500) {
            setDiscount(20);
        } else if (amountNum >= 200) {
            setDiscount(10);
        } else {
            setDiscount(0);
        }
    }, [amount]);

    const calculateDiscountedAmount = () => {
        const amountNum = parseFloat(amount);
        const appliedDiscount = Math.max(discount || 0);
        return amountNum * (1 - appliedDiscount / 100);
    };

    const getDiscountMessage = () => {
        const amountNum = parseFloat(amount);
        if (amountNum < 200) {
            const remainingTo10Percent = 200 - amountNum;
            return `Do rabatu 10% brakuje ${remainingTo10Percent.toFixed(2)} zł`;
        } else if (amountNum < 500) {
            const remainingTo20Percent = 500 - amountNum;
            return `Do rabatu 20% brakuje ${remainingTo20Percent.toFixed(2)} zł`;
        }
        return null;
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        showLoader();

        try {
            const endpoint = paymentType === 'topUp' ? '/api/users/top-up' : `/api/orders/${orderId}/pay`;
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                }),
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = data.paymentUrl;
            } else {
                console.error('Payment error:', data.message);
                alert(data.message || 'Wystąpił błąd podczas przetwarzania płatności.');
            }
        } catch (error) {
            console.error('Error during payment:', error);
            alert('Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie później.');
        } finally {
            hideLoader();
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={modalVariants}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4 dark:text-white">
                            {paymentType === 'topUp' ? 'Doładuj konto' : 'Opłać zamówienie'}
                        </h2>
                        <form onSubmit={handlePayment}>
                            <div className="mb-4">
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kwota {paymentType === 'topUp' ? 'doładowania' : 'do zapłaty'} (zł)
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="20"
                                    step="0.01"
                                    required
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    disabled={paymentType === 'order'}
                                />
                            </div>
                            {parseFloat(amount) > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="mb-4 p-2 rounded bg-green-100 dark:bg-green-800"
                                >
                                    <p className="text-green-700 dark:text-green-300">
                                        {paymentType === 'topUp' ? 'Doładujesz:' : 'Do zapłaty:'} {amount} zł
                                    </p>
                                    {discount > 0 && (
                                        <p className="text-green-700 dark:text-green-300">
                                            Z rabatem {discount}% zapłacisz {calculateDiscountedAmount().toFixed(2)} zł
                                        </p>
                                    )}
                                    {getDiscountMessage() && (
                                        <p className="text-blue-700 dark:text-blue-300 mt-2">
                                            {getDiscountMessage()}
                                        </p>
                                    )}
                                </motion.div>
                            )}
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Akceptowane metody płatności:
                                </p>
                                <div className="flex justify-center space-x-4">
                                    <Image src="/images/google-pay-logo.png" alt="Google Pay" width={50} height={30} />
                                    <Image src="/images/blik-logo.png" alt="BLIK" width={50} height={30} />
                                    <Image src="/images/visa-logo.png" alt="Visa" width={50} height={30} />
                                    <Image src="/images/mastercard-logo.png" alt="Mastercard" width={50} height={30} />
                                    <Image src="/images/paypal-logo.png" alt="PayPal" width={50} height={30} />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors duration-300"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300"
                                >
                                    {paymentType === 'topUp' ? 'Doładuj' : 'Zapłać'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;