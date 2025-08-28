// src/components/newsletter/NewsletterHistory.tsx
import React, { useState, useEffect } from 'react';
import { List, Skeleton, message, Collapse } from 'antd';
import { useTheme } from '../../context/ThemeContext';

const { Panel } = Collapse;

const NewsletterHistory = () => {
    const [newsletters, setNewsletters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        fetchNewsletters();
    }, []);

    const fetchNewsletters = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNewsletters(data.data || []);
            } else {
                throw new Error('Failed to fetch newsletter history');
            }
        } catch (error) {
            console.error('Error fetching newsletter history:', error);
            message.error('Nie udało się pobrać historii newsletterów');
        } finally {
            setIsLoading(false);
        }
    };

    const darkModeClass = theme === 'dark' ? 'dark-mode' : '';

    if (isLoading) return <div>Ładowanie historii...</div>;

    if (newsletters.length === 0) return <div>Brak historii newsletterów</div>;

    return (
        <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 ${darkModeClass}`}>
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">Wysłane newslettery</h2>
            <List
                itemLayout="vertical"
                dataSource={newsletters}
                renderItem={(item: any) => (
                    <List.Item className="dark:border-gray-700">
                        <Collapse className={`custom-collapse ${darkModeClass}`}>
                            <Panel
                                header={
                                    <div>
                                        <h3 className="font-semibold dark:text-white">{item.title}</h3>
                                        <span className="text-sm text-gray-500 dark:text-gray-300">
                                            {new Date(item.sentDate).toLocaleDateString()} - {item.category}
                                        </span>
                                    </div>
                                }
                                key="1"
                                className={`custom-panel ${darkModeClass}`}
                            >
                                <div className="dark:text-gray-300 custom-content" dangerouslySetInnerHTML={{ __html: item.content }} />
                            </Panel>
                        </Collapse>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default NewsletterHistory;