//src/components/WebSocketReady.tsx
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import Loader from './ui/Loader';

const WebSocketReady: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useWebSocket();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (socket) {
            setIsReady(true);
        }
    }, [socket]);

    if (!isReady) {
        return <Loader />;
    }

    return <>{children}</>;
};

export default WebSocketReady;