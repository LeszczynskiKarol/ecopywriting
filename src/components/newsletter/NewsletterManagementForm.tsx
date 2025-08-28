// src/components/newsletter/NewsletterMagamenetForm.tsx
'use client'
import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const NewsletterManagementForm = () => {
    const [form] = Form.useForm();
    const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const categories = ['Nowości', 'Promocje', 'Porady', 'Branżowe', 'Technologia'];

    const verifyEmail = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/newsletter/status?email=${encodeURIComponent(email)}`);
            if (response.ok) {
                const data = await response.json();
                setIsSubscribed(data.isSubscribed);
                if (data.isSubscribed) {
                    form.setFieldsValue({ categories: data.preferences?.categories || [] });
                }
                setIsEmailVerified(true);
            } else {
                throw new Error('Failed to fetch subscription status');
            }
        } catch (error) {
            console.error('Error verifying email:', error);
            message.error('Wystąpił błąd podczas weryfikacji email');
        } finally {
            setIsLoading(false);
        }
    };

    const onFinish = async (values: any) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/newsletter/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    isSubscribed: true,
                    preferences: { categories: values.categories }
                }),
            });

            if (response.ok) {
                message.success('Wysłano link potwierdzający na Twój adres email. Sprawdź swoją skrzynkę odbiorczą.');
                setIsSubscribed(true);
            } else {
                throw new Error('Failed to update subscription');
            }
        } catch (error) {
            console.error('Error managing subscription:', error);
            message.error('Wystąpił błąd podczas aktualizacji subskrypcji');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnsubscribe = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/newsletter/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    isSubscribed: false,
                }),
            });

            if (response.ok) {
                message.success('Wypisano z newslettera');
                setIsSubscribed(false);
                form.resetFields(['categories']);
            } else {
                throw new Error('Failed to unsubscribe');
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
            message.error('Wystąpił błąd podczas wypisywania z newslettera');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md mt-8">
            <Form form={form} name="newsletter_management" onFinish={onFinish} layout="vertical">
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Proszę podać adres email' },
                        { type: 'email', message: 'Nieprawidłowy format adresu email' }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="Adres email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Item>

                {!isEmailVerified && (
                    <Form.Item>
                        <Button type="primary" onClick={verifyEmail} loading={isLoading}>
                            Sprawdź status subskrypcji
                        </Button>
                    </Form.Item>
                )}

                {isEmailVerified && !isSubscribed && (
                    <div>
                        <p>Nie ma Cię na liście naszych subskrybentów. Zapisz się do newslettera i otrzymuj wartościowe treści!</p>
                        <Form.Item name="categories" label="Kategorie">
                            <Checkbox.Group options={categories} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={isLoading}>
                                Subskrybuj
                            </Button>
                        </Form.Item>
                    </div>
                )}

                {isEmailVerified && isSubscribed && (
                    <>
                        <Form.Item name="categories" label="Kategorie">
                            <Checkbox.Group options={categories} />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={isLoading}>
                                Aktualizuj preferencje
                            </Button>
                        </Form.Item>

                        <Form.Item>
                            <Button danger onClick={handleUnsubscribe} loading={isLoading}>
                                Wypisz się z newslettera
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form>
        </div>
    );
};

export default NewsletterManagementForm;