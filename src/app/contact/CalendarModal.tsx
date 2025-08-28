// src/app/contact/CalendarModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitMessage, setSubmitMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleDateSelection = (date: Date | null) => {
        setSelectedDate(date);
    };

    const handleTimeSelection = (time: Date | null) => {
        setSelectedTime(time);
    };


    const handleSubmit = async () => {
        if (selectedDate && selectedTime && name && email && phone && !phoneError) {
            setIsSubmitting(true);
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/schedule-meeting`, {
                    name,
                    email,
                    phone,
                    date: selectedDate.toISOString(),
                    time: selectedTime.toTimeString().slice(0, 5)
                });
                console.log('Odpowiedź serwera:', response.data);
                setShowSuccessModal(true);
            } catch (error) {
                console.error('Błąd podczas umawiania spotkania:', error);
                if (axios.isAxiosError(error)) {
                    console.error('Szczegóły błędu:', error.response?.data);
                    setSubmitMessage(`Wystąpił błąd podczas umawiania spotkania: ${error.response?.data?.message || error.message}`);
                } else {
                    setSubmitMessage('Wystąpił nieznany błąd podczas umawiania spotkania. Spróbuj ponownie później.');
                }
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setSubmitMessage('Proszę wypełnić wszystkie pola poprawnie.');
        }
    };

    const SuccessModal = () => (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <div className="flex items-center mb-4">
                    <Check className="text-green-500 mr-2" size={24} />
                    <h2 className="text-2xl font-semibold">Spotkanie umówione!</h2>
                </div>
                <p>Dziękujemy za umówienie spotkania. Skontaktujemy się z Tobą telefonicznie:</p>
                <ul className="mt-4 mb-6">
                    <li><strong>Data:</strong> {selectedDate?.toLocaleDateString()}</li>
                    <li><strong>Godzina:</strong> {selectedTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
                    <li><strong>Numer telefonu:</strong> {phone}</li>
                </ul>
                <button
                    onClick={() => {
                        setShowSuccessModal(false);
                        onClose();
                    }}
                    className="w-full px-6 py-3 bg-[#38c775] text-white rounded-full hover:bg-[#2ea55f] transition duration-300"
                >
                    Zamknij
                </button>
            </motion.div>
        </motion.div>
    );


    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const phoneNumber = e.target.value.replace(/\D/g, '');
        setPhone(phoneNumber);
        if (phoneNumber.length < 8 || phoneNumber.length > 12) {
            setPhoneError('Numer telefonu powinien zawierać od 8 do 12 cyfr');
        } else {
            setPhoneError('');
        }
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isWeekday = (date: Date) => {
        const day = date.getDay();
        return day !== 0 && day !== 6;
    };

    const filterPassedTime = (time: Date) => {
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        const selectedHour = time.getHours();

        if (selectedDate && selectedDate.toDateString() === currentDate.toDateString()) {
            return selectedHour > currentHour;
        }
        return true;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl sm:text-2xl font-semibold">Umów rozmowę telefoniczną</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium mb-1">Wybierz datę</h3>
                                    <DatePicker
                                        selected={selectedTime}
                                        onChange={(date: Date | null) => {
                                            if (date) {
                                                handleTimeSelection(date);
                                            } else {
                                                handleTimeSelection(null);
                                            }
                                        }}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={60}
                                        timeCaption="Godzina"
                                        dateFormat="HH:mm"
                                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        minTime={new Date(0, 0, 0, 10, 0)}
                                        maxTime={new Date(0, 0, 0, 18, 0)}
                                        filterTime={filterPassedTime}
                                        placeholderText="Wybierz godzinę"
                                    />
                                </div>



                                <div>
                                    <label htmlFor="email" className="block mb-1 text-sm font-medium">Adres e-mail</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block mb-1 text-sm font-medium">Numer telefonu</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        required
                                    />
                                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium mb-1">Wybierz datę</h3>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={handleDateSelection}
                                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        dateFormat="dd/MM/yyyy"
                                        minDate={tomorrow}
                                        filterDate={isWeekday}
                                        placeholderText="Wybierz datę"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-1">Wybierz godzinę</h3>
                                    <DatePicker
                                        selected={selectedTime ? new Date(`2000-01-01T${selectedTime}`) : null}

                                        onChange={(date: Date | null) => {
                                            if (date) {
                                                handleTimeSelection(date);
                                            } else {
                                                handleTimeSelection(null);
                                            }
                                        }}

                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={60}
                                        timeCaption="Godzina"
                                        dateFormat="HH:mm"
                                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        minTime={new Date(0, 0, 0, 10, 0)}
                                        maxTime={new Date(0, 0, 0, 18, 0)}
                                        filterTime={filterPassedTime}
                                        placeholderText="Wybierz godzinę"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full px-4 py-2 mt-6 bg-[#38c775] text-white text-sm rounded-full hover:bg-[#2ea55f] transition duration-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Przetwarzanie...' : 'Potwierdź rezerwację'}
                        </button>

                        {submitMessage && (
                            <p className={`text-center mt-4 text-sm ${submitMessage.includes('błąd') ? 'text-red-500' : 'text-green-500'}`}>
                                {submitMessage}
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            )}
            {showSuccessModal && <SuccessModal />}
        </AnimatePresence>
    );
};


export default CalendarModal;