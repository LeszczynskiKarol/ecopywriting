//src/components/dashboard/TopUpModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsEvents } from '../../utils/analytics';
import { useLoader } from '../../context/LoaderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';


interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {
    const [amount, setAmount] = useState('');
    const [discount, setDiscount] = useState(0);
    const { showLoader, hideLoader } = useLoader();
    const { user } = useAuth();

    const formatAmount = (value: number): string => {
        return value.toFixed(2).replace('.', ',');
    };
    const handleAmountChange = (value: string) => {
        // Usuń wszystkie znaki niebędące cyframi lub przecinkiem
        const cleanedValue = value.replace(/[^\d,]/g, '');

        // Upewnij się, że jest tylko jeden przecinek
        const parts = cleanedValue.split(',');
        if (parts.length > 2) {
            parts[1] = parts.slice(1).join('');
            setAmount(parts.join(','));
        } else {
            setAmount(cleanedValue);
        }
    };

    const handleBlur = () => {
        const numValue = parseFloat(amount.replace(',', '.'));
        if (!isNaN(numValue)) {
            setAmount(formatAmount(numValue));
        }
    };

    const parseAmount = (value: string): number => {
        return parseFloat(value.replace(',', '.')) || 0;
    };


    const handleIncrement = () => {
        const currentAmount = parseFloat(amount.replace(',', '.')) || 0;
        setAmount(formatAmount(currentAmount + 10));
    };

    const handleDecrement = () => {
        const currentAmount = parseFloat(amount.replace(',', '.')) || 0;
        if (currentAmount >= 10) {
            setAmount(formatAmount(currentAmount - 10));
        }
    };


    useEffect(() => {
        const amountNum = parseAmount(amount);
        if (amountNum >= 500) {
            setDiscount(20);
        } else if (amountNum >= 200) {
            setDiscount(10);
        } else {
            setDiscount(0);
        }
    }, [amount]);

    const calculateDiscountedAmount = () => {
        const amountNum = parseAmount(amount);
        const appliedDiscount = Math.max(discount || 0);
        return amountNum * (1 - appliedDiscount / 100);
    };

    const getDiscountMessage = () => {
        const amountNum = parseAmount(amount);
        if (amountNum < 200) {
            const remainingTo10Percent = 200 - amountNum;
            return `Do rabatu 10% brakuje ${formatAmount(remainingTo10Percent)} zł`;
        } else if (amountNum < 500) {
            const remainingTo20Percent = 500 - amountNum;
            return `Do rabatu 20% brakuje ${formatAmount(remainingTo20Percent)} zł`;
        }
        return null;
    };

    const handleTopUp = async (e: React.FormEvent) => {
        e.preventDefault();
        showLoader();

        const originalAmount = parseAmount(amount);
        const discountedAmount = calculateDiscountedAmount();

        analyticsEvents.topUpStart(discountedAmount);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/top-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    originalAmount: originalAmount,
                    discountedAmount: discountedAmount,
                    appliedDiscount: appliedDiscount
                }),
            });

            const data = await response.json();

            if (data.success) {
                analyticsEvents.topUpComplete(discountedAmount);
                localStorage.setItem('auth_token_temp', localStorage.getItem('token') || '');
                window.location.href = data.paymentUrl;
            } else {
                console.error('Top-up error:', data.message);
                alert(data.message || 'Wystąpił błąd podczas doładowywania konta.');
            }
        } catch (error) {
            console.error('Error during top-up:', error);
            alert('Wystąpił błąd podczas doładowywania konta. Spróbuj ponownie później.');
        } finally {
            hideLoader();
        }
    };

    if (!isOpen) return null;

    const showDiscountMessage = parseFloat(amount) > 0;
    const appliedDiscount = Math.max(discount || 0);
    const discountMessage = getDiscountMessage();

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
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4 dark:text-white">Doładuj konto</h2>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            Doładuj konto powyżej 200 zł, aby otrzymać 10% rabatu.
                            Przy doładowaniu powyżej 500 zł rabat wzrasta do 20%!
                        </p>

                        <form onSubmit={handleTopUp}>
                            <div className="mb-4">
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kwota doładowania (zł)
                                </label>
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={handleDecrement}
                                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-l hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 border border-gray-200 dark:border-gray-600"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <input
                                        type="text"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => handleAmountChange(e.target.value)}
                                        onBlur={handleBlur}
                                        className="flex-grow p-2 border-t border-b bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-center appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleIncrement}
                                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-r hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 border border-gray-200 dark:border-gray-600"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showDiscountMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="mb-4 p-2 rounded bg-green-100 dark:bg-green-800"
                                    >
                                        <p className="text-green-700 dark:text-green-300">
                                            Doładujesz: {amount} zł
                                        </p>
                                        {appliedDiscount > 0 ? (
                                            <p className="text-green-700 dark:text-green-300">
                                                Z rabatem {appliedDiscount}% zapłacisz {formatAmount(calculateDiscountedAmount())} zł
                                            </p>
                                        ) : (
                                            <p className="text-green-700 dark:text-green-300">
                                                Zapłacisz: {amount} zł
                                            </p>
                                        )}
                                        {discountMessage && (
                                            <p className="text-blue-700 dark:text-blue-300 mt-2">
                                                {discountMessage}
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
                                    Doładuj
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TopUpModal;
