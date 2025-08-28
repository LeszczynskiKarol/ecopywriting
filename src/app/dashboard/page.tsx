// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { FileText, ChevronRight, Wallet, ShoppingCart, DollarSign } from 'lucide-react';
import Link from 'next/link';
import MobileDashboardTables from '../../components/dashboard/MobileDashboardTables';
import { Order, Invoice } from '../../interfaces/common';


export default function Dashboard() {

  const { user, getToken } = useAuth();
  const [stats, setStats] = useState<{ totalOrders: number; totalSpent: number }>({ totalOrders: 0, totalSpent: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
    }
  }, [user]);



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'zakończone':
        return 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'w trakcie':
        return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };



  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = getToken(); // Użyj getToken z AuthContext
        if (!token) {
          console.error('No token available');
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        const [statsRes, ordersRes, invoicesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/stats`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/recent`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/recent-invoices`, { headers })
        ]);

        const [statsData, ordersData, invoicesData] = await Promise.all([
          statsRes.json(),
          ordersRes.json(),
          invoicesRes.json()
        ]);

        setStats(statsData.data || { totalOrders: 0, totalSpent: 0 });
        setRecentOrders(ordersData.data || []);
        setRecentInvoices(invoicesData.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, getToken]);


  const handleDownloadInvoice = async (invoice: Invoice) => {
    console.log('Attempting to download invoice:', invoice);
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
      return;
    }
    if (!invoice.stripeSessionId) {
      console.error('Brak stripeSessionId dla faktury:', invoice);
      alert('Brak identyfikatora sesji dla tej faktury.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/${invoice.stripeSessionId}/invoice`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Invoice download response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Invoice download data:', data);
        if (data.success && data.invoiceUrl) {
          window.open(data.invoiceUrl, '_blank');
        } else {
          throw new Error(data.message || 'Nie udało się pobrać linku do faktury');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Błąd podczas pobierania linku do faktury');
      }
    } catch (error) {
      console.error('Błąd podczas pobierania faktury:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Wystąpił błąd podczas pobierania faktury. Spróbuj ponownie później.');
      }
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
        Hej, {user?.name}!
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gray-100 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-700 dark:text-gray-200">
              <Wallet className="mr-2 h-5 w-5 text-blue-500" />
              Saldo konta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user?.accountBalance?.toFixed(2).replace('.', ',')} zł</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-100 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-700 dark:text-gray-200">
              <ShoppingCart className="mr-2 h-5 w-5 text-blue-500" />
              Wszystkie zamówienia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.totalOrders ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-100 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-700 dark:text-gray-200">
              <DollarSign className="mr-2 h-5 w-5 text-blue-500" />
              Wartość zamówień
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.totalSpent?.toFixed(2).replace('.', ',') ?? '0,00'} zł
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Widok mobilny */}
      <MobileDashboardTables
        recentOrders={recentOrders}
        recentInvoices={recentInvoices}
        handleDownloadInvoice={handleDownloadInvoice}
      />

      {/* Widok desktopowy */}
      <div className="hidden md:grid md:grid-cols-1 md:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ostatnie zamówienia</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Temat</TableHead>
                    <TableHead className="w-1/6">Data</TableHead>
                    <TableHead className="w-1/6">Status</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/orders/${order._id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {order.items && order.items[0] && order.items[0].topic
                            ? order.items[0].topic
                            : 'Brak tytułu'}
                        </Link>
                      </TableCell>                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">Brak ostatnich zamówień</p>
            )}
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild href="/dashboard/orders">
                <span className="flex items-center">
                  Wszystkie zamówienia
                  <ChevronRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ostatnie faktury</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices && recentInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>

                    <TableHead className="w-1/3">Data</TableHead>
                    <TableHead className="w-1/4">Kwota</TableHead>
                    <TableHead className="w-1/4">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.slice(0, 3).map((invoice) => (
                    <TableRow key={invoice._id}>

                      <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.amount.toFixed(2).replace('.', ',')} zł</TableCell>

                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="bg-blue-600 hover:bg-blue-700 text-gray-800 dark:text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                          disabled={!invoice.pdfUrl && !invoice.stripeSessionId}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {invoice.pdfUrl || invoice.stripeSessionId ? 'Pobierz' : 'Niedostępna'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                </TableBody>

              </Table>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">Brak ostatnich faktur</p>
            )}
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild href="/dashboard/payment-history">
                <span className="flex items-center">
                  Wszystkie faktury
                  <ChevronRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
