// src/components/newsletter/NewsletterPreferences.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Switch, Checkbox, Modal, Button, message } from 'antd';
import { MailOutlined, StopOutlined } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';

interface Preferences {
    categories: string[];
}


const NewsletterPreferences = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [isSubscribed, setIsSubscribed] = useState(true);
    const [preferences, setPreferences] = useState<Preferences>({ categories: [] });
    const categories = ['Nowości', 'Promocje', 'Porady', 'Branżowe', 'Technologia'];
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPreferences();
        checkSubscriptionStatus();
    }, []);

    const checkSubscriptionStatus = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscription-status`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setIsSubscribed(data.isSubscribed);
            }
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    };


    const fetchPreferences = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/preferences`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched preferences:', data);
                setPreferences(data.preferences || { categories: [] });
                setIsSubscribed(data.isSubscribed);
            } else {
                console.error('Failed to fetch preferences:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching newsletter preferences:', error);
            message.error('Nie udało się pobrać preferencji newslettera');
        }
        setIsLoading(false);
    };


    const updatePreferences = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ preferences })
            });
            if (response.ok) {
                message.success('Pomyślnie zaktualizowano');
            } else {
                throw new Error('Failed to update preferences');
            }
        } catch (error) {
            console.error('Error updating newsletter preferences:', error);
            message.error('Wystąpił błąd podczas aktualizacji preferencji');
        }
    };

    const handleSubscriptionToggle = async () => {
        Modal.confirm({
            title: isSubscribed ? 'Czy na pewno chcesz zrezygnować z subskrypcji?' : 'Czy chcesz ponownie zapisać się do newslettera?',
            content: isSubscribed ? 'Ta akcja spowoduje, że przestaniesz otrzymywać wszystkie nasze newslettery.' : 'Będziesz otrzymywać nasze newslettery zgodnie z wybranymi preferencjami.',
            okText: 'Tak',
            okType: 'danger',
            cancelText: 'Anuluj',
            onOk: async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscription`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ isSubscribed: !isSubscribed })
                    });
                    if (response.ok) {
                        setIsSubscribed(!isSubscribed);
                        message.success(isSubscribed ? 'Wypisano z newslettera' : 'Zapisano do newslettera');
                    } else {
                        throw new Error('Failed to toggle subscription');
                    }
                } catch (error) {
                    console.error('Error toggling subscription:', error);
                    message.error('Wystąpił błąd podczas zmiany subskrypcji');
                }
            },
        });
    };

    if (isLoading) return <div>Ładowanie preferencji...</div>;

    return (
        <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 ${theme === 'dark' ? 'text-white' : ''}`}>
            <div className="flex justify-between items-center mb-6">
                {isSubscribed && <h2 className="text-2xl font-bold dark:text-white">Preferencje</h2>}
                <Button
                    type="primary"
                    danger={isSubscribed}
                    icon={isSubscribed ? <StopOutlined /> : <MailOutlined />}
                    onClick={handleSubscriptionToggle}
                >
                    {isSubscribed ? 'Wypisz się' : 'Subskrybuj'}
                </Button>
            </div>
            {isSubscribed && (
                <>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2 dark:text-white">Kategorie</h3>
                        {categories.map(category => (
                            <div key={category} className="flex items-center mb-2">
                                <Checkbox
                                    checked={preferences.categories.includes(category)}
                                    onChange={(e) => {
                                        const newCategories = e.target.checked
                                            ? [...preferences.categories, category]
                                            : preferences.categories.filter(c => c !== category);
                                        setPreferences({ ...preferences, categories: newCategories });
                                    }}
                                    className="mr-2 dark:text-white"
                                />


                                <span className={theme === 'dark' ? 'text-white' : ''}>{category}</span>
                            </div>
                        ))}
                    </div>
                    <Button
                        type="primary"
                        onClick={updatePreferences}
                        className="dark:bg-blue-600 dark:text-white dark:border-blue-600 dark:hover:bg-blue-700"
                    >
                        Zapisz preferencje
                    </Button>
                </>
            )}
        </div>
    );
};


export default NewsletterPreferences;