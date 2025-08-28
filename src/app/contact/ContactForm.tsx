// src/app/contact/ContactForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ContactForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/submit`, formData);
            setSubmitMessage('Wiadomość została wysłana pomyślnie! Odpowiemy w ciągu 24 godzin.');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setSubmitMessage('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.');
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block mb-1">Imię</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
            </div>
            <div>
                <label htmlFor="email" className="block mb-1">Adres e-mail</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
            </div>
            <div>
                <label htmlFor="message" className="block mb-1">Wiadomość</label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                ></textarea>
            </div>
            <motion.button
                type="submit"
                className="w-full px-6 py-3 bg-[#38c775] text-white rounded-full hover:bg-[#2ea55f] transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
            </motion.button>
            {submitMessage && (
                <p className={`text-center ${submitMessage.includes('błąd') ? 'text-red-500' : 'text-green-500'}`}>
                    {submitMessage}
                </p>
            )}
        </form>
    );
};

export default ContactForm;