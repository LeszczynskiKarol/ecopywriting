// src/app/dashboard/orders/page.tsx
'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SuccessModal from '../../../components/modals/SuccessModal';


interface OrderHistoryProps {
  onOrderSuccess: (details: {
    orderNumber: string;
    totalPrice: number;
    discount: number;
    itemsCount: number;
  }) => void;
}

const OrderHistory = dynamic<OrderHistoryProps>(() => import('../../../components/dashboard/OrderHistory'), {
  loading: () => <Loader />,
  ssr: false
});

const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function OrdersPage() {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '',
    totalPrice: 0,
    discount: 0,
    itemsCount: 0,
    sessionId: ''
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');

    if (sessionId) {
      fetchOrderDetails(sessionId);
    } else if (success === 'true') {
      const orderNumber = searchParams.get('orderNumber');
      const totalPrice = searchParams.get('totalPrice');
      const discount = searchParams.get('discount');
      const itemsCount = searchParams.get('itemsCount');

      if (orderNumber && totalPrice && discount && itemsCount) {
        setOrderDetails({
          orderNumber,
          totalPrice: parseFloat(totalPrice),
          discount: parseFloat(discount),
          itemsCount: parseInt(itemsCount, 10),
          sessionId: sessionId || ''
        });
        setIsSuccessModalOpen(true);
      }
    }
    // Usuń parametry z URL
    router.replace('/dashboard/orders');
  }, [searchParams, router]);

  const fetchOrderDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrderDetails({
          orderNumber: data.orderNumber,
          totalPrice: data.totalPrice,
          discount: data.appliedDiscount,
          itemsCount: data.items.length,
          sessionId: sessionId
        });
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
    setShowToast(true);
  };

  const handleOrderSuccess = (details: {
    orderNumber: string;
    totalPrice: number;
    discount: number;
    itemsCount: number;
  }) => {
    console.log('Order success handled:', details);
  };

  return (
    <div>
      <Suspense fallback={<Loader />}>
        <OrderHistory onOrderSuccess={handleOrderSuccess} />
      </Suspense>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        orderNumber={orderDetails.orderNumber}
        totalPrice={orderDetails.totalPrice}
        discount={orderDetails.discount}
        itemsCount={orderDetails.itemsCount}
        sessionId={orderDetails.sessionId}
      />
    </div>
  );
}