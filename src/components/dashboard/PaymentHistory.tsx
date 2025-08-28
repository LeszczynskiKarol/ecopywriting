// src/components/dashboard/PaymentHistory.tsx 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent } from "../ui/card";
import { useMediaQuery } from 'react-responsive';

interface Payment {
    _id: string;
    amount: number;
    paidAmount: number;
    type: 'top_up' | 'order_payment';
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    stripeSessionId: string; // Dodaj to pole
    relatedOrder?: {
        _id: string;
        status: string;
    };
    invoice?: {
        id: string;

    };
}



const PaymentHistory: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentsPerPage] = useState(10);
    const [sortField, setSortField] = useState<keyof Payment>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [typeFilter, setTypeFilter] = useState('all');
    const { user } = useAuth();
    const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const formatPrice = (price: number) => {
        return price.toLocaleString('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace('.', ',') + ' zł';
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPayments(data.data);
            } else {
                throw new Error('Błąd pobierania historii płatności');
            }
        } catch (error) {
            setError('Wystąpił błąd podczas ładowania historii płatności.');
            console.error('Błąd:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadInvoice = async (payment: Payment) => {
        if (!payment.stripeSessionId) {
            alert('Brak identyfikatora sesji dla tej płatności.');
            return;
        }

        setDownloadingInvoice(payment._id);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/${payment.stripeSessionId}/invoice`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.invoiceUrl) {
                    window.open(data.invoiceUrl, '_blank');
                } else {
                    throw new Error(data.message || 'Nie udało się pobrać linku do faktury');
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Błąd podczas pobierania linku do faktury');
            }
        } catch (error: unknown) {
            console.error('Błąd podczas pobierania linku do faktury:', error);
            alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas pobierania faktury. Spróbuj ponownie później.');
        } finally {
            setDownloadingInvoice(null);
        }


    };

    const handleSort = (field: keyof Payment) => {
        setSortField(field);
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    const filteredAndSortedPayments = payments
        .filter(payment => typeFilter === 'all' || payment.type === typeFilter)
        .sort((a, b) => {
            if (a[sortField] === undefined || b[sortField] === undefined) return 0;
            if (a[sortField]! < b[sortField]!) return sortDirection === 'asc' ? -1 : 1;
            if (a[sortField]! > b[sortField]!) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = filteredAndSortedPayments.slice(indexOfFirstPayment, indexOfLastPayment);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const renderPaymentStatus = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Opłacona</span>;
            case 'pending':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Oczekująca</span>;
            case 'failed':
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">Nieudana</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">Nieznany</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const MobilePaymentTable = () => (
        <div className="space-y-4">

            {currentPayments.map((payment) => (
                <Card key={payment._id} className="dark:bg-gray-800 border dark:border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">{new Date(payment.createdAt).toLocaleDateString()}</span>
                            {renderPaymentStatus(payment.status)}
                        </div>
                        <div className="mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{payment.type === 'top_up' ? 'Doładowanie konta' : 'Płatność za teksty'}</span>
                        </div>
                        <div className="mb-2">
                            <span className="font-bold">{formatPrice(payment.paidAmount)}</span>
                        </div>
                        {payment.stripeSessionId ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadInvoice(payment)}
                                disabled={downloadingInvoice === payment._id}
                                className="bg-blue-600 hover:bg-blue-700 text-gray-800 dark:text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                            >


                                {downloadingInvoice === payment._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                )}
                                {downloadingInvoice === payment._id ? 'Pobieranie...' : 'Pobierz'}
                            </Button>
                        ) : (
                            <span className="text-gray-400">Faktura niedostępna</span>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div>


                <h1 className="text-2xl font-bold mb-6">Płatności</h1>
                <Card>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-64">
                            <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-xl font-semibold text-gray-500">Brak płatności</p>
                            <p className="text-gray-400">Nie masz jeszcze żadnych płatności w historii.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>

            <h1 className="text-2xl font-bold mb-6">Płatności</h1>
            <Card>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-[180px] p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="all">Wszystkie typy</option>
                            <option value="top_up">Doładowanie</option>
                            <option value="order_payment">Zamówienie</option>
                        </select>
                    </div>

                    {isMobile ? (
                        <MobilePaymentTable />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('createdAt')}
                                        >
                                            Data
                                            {sortField === 'createdAt' && (sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Typ</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('paidAmount')}
                                        >
                                            Kwota
                                            {sortField === 'paidAmount' && (sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Faktura</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentPayments.map((payment) => (
                                    <TableRow key={payment._id}>
                                        <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{payment.type === 'top_up' ? 'Doładowanie konta' : 'Zamówienie tekstów'}</TableCell>
                                        <TableCell>{formatPrice(payment.paidAmount)}</TableCell>
                                        <TableCell>{renderPaymentStatus(payment.status)}</TableCell>
                                        <TableCell>
                                            {payment.stripeSessionId ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownloadInvoice(payment)}
                                                    disabled={downloadingInvoice === payment._id}
                                                    className="bg-blue-600 hover:bg-blue-700 text-gray-800 dark:text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                                                >
                                                    {downloadingInvoice === payment._id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <FileText className="h-4 w-4 mr-2" />
                                                    )}
                                                    {downloadingInvoice === payment._id ? 'Pobieranie...' : 'Pobierz'}
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400">Niedostępna</span>
                                            )}
                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <div className="flex justify-between items-center mt-4">
                        <Button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            variant="outline"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Poprzednia
                        </Button>
                        <span>Strona {currentPage} z {Math.ceil(filteredAndSortedPayments.length / paymentsPerPage)}</span>
                        <Button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === Math.ceil(filteredAndSortedPayments.length / paymentsPerPage)}
                            variant="outline"
                        >
                            Następna
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentHistory;