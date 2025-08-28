// src/components/dashboard/MobileDashboardTables.tsx
import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { Button } from "../ui/button";
import { Order, Invoice } from '../../interfaces/common';

interface MobileDashboardTablesProps {
  recentOrders: Order[];
  recentInvoices: Invoice[];
  handleDownloadInvoice: (invoice: Invoice) => Promise<void>;
}

const MobileDashboardTables: React.FC<MobileDashboardTablesProps> = ({
  recentOrders,
  recentInvoices,
  handleDownloadInvoice
}) => {
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


  return (
    <div className="md:hidden space-y-6">
      {/* Ostatnie zamówienia */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Ostatnie zamówienia</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {recentOrders.map((order, index) => (
            <Link href={`/dashboard/orders/${order._id}`} key={order._id}>
              <div className={`p-4 flex justify-between items-center ${index !== recentOrders.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                }`}>
                <div>
                  <p className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    {order.items && order.items.length > 0 ? order.items[0].topic : 'Brak tytułu'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <ChevronRight className="ml-2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/orders" className="flex items-center">
              Wszystkie zamówienia
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Ostatnie faktury */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Ostatnie faktury</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {recentInvoices.slice(0, 3).map((invoice, index) => (
            <div key={invoice._id} className={`p-4 flex justify-between items-center ${index !== Math.min(recentInvoices.length, 3) - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
              }`}>
              <div>
                <p className="font-medium">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {invoice.amount.toFixed(2).replace('.', ',')} zł
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadInvoice(invoice)}
                className="bg-blue-500 hover:bg-blue-600 text-gray-800 dark:text-white dark:bg-blue-600 dark:hover:bg-blue-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                disabled={!invoice.pdfUrl && !invoice.stripeSessionId}
              >
                <FileText className="mr-2 h-4 w-4" />
                Pobierz
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/payment-history" className="flex items-center">
              Wszystkie faktury
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboardTables;