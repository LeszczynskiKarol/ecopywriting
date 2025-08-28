// src/components/dashboard/ClientSideTopUpModal.tsx
import dynamic from 'next/dynamic';
import React from 'react';

const TopUpModal = dynamic(() => import('./TopUpModal'), { ssr: false });

interface ClientSideTopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ClientSideTopUpModal: React.FC<ClientSideTopUpModalProps> = ({ isOpen, onClose }) => {
    return <TopUpModal isOpen={isOpen} onClose={onClose} />;
};

export default ClientSideTopUpModal;