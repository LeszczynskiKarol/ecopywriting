// src/context/WebSocketContext.tsx
'use client'
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext<{
  socket: Socket | null,
  reinitializeSocket: () => void
}>({
  socket: null,
  reinitializeSocket: () => { }
});


export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, getToken } = useAuth();


  const connectSocket = useCallback(() => {
    console.log('Attempting to connect socket. User:', user, 'Token:', getToken());
    if (typeof window === 'undefined') {
      console.log('Cannot connect socket: window is undefined');
      return null;
    }
    if (!user || !user.id) {
      console.log('Cannot connect socket: user is not available');
      return null;
    }
    const token = getToken();
    if (!token) {
      console.log('No token available, not connecting socket');
      return null;
    }
    console.log('Creating new socket connection');
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: false,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      newSocket.emit('join_user_room', user.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.connect();
    return newSocket;
  }, [user, getToken]);

  useEffect(() => {
    if (typeof window !== 'undefined' && user && user.id && getToken()) {
      console.log('User and token available, initializing socket');
      const newSocket = connectSocket();
      if (newSocket) {
        setSocket(newSocket);
      }
    } else {
      console.log('Conditions not met for socket initialization');
    }
  }, [user, getToken, connectSocket]);

  useEffect(() => {
    if (user && getToken()) {
      console.log('User and token available, initializing socket');
      const newSocket = connectSocket();
      if (newSocket) {
        setSocket(newSocket);
      }
    } else {
      console.log('User or token not available, cannot initialize socket');
    }
  }, [user, getToken]);

  const joinUserRoom = useCallback(() => {
    if (socket && user && user.id) {
      console.log('Joining user room:', user.id);
      socket.emit('join_user_room', user.id);
    }
  }, [socket, user]);

  const reinitializeSocket = useCallback(() => {
    console.log('Reinitializing socket');
    if (socket) {
      console.log('Disconnecting existing socket');
      socket.disconnect();
    }
    const newSocket = connectSocket();
    if (newSocket) {
      console.log('New socket created');
      setSocket(newSocket);
    } else {
      console.log('Failed to create new socket');
    }
  }, [connectSocket, socket]);



  useEffect(() => {
    if (socket && user) {
      joinUserRoom();
    }
  }, [socket, user, joinUserRoom]);

  useEffect(() => {
    if (user && !socket) {
      console.log('Initializing WebSocket connection');
      const newSocket = connectSocket();
      if (newSocket) {
        newSocket.on('connect', () => {
          console.log('WebSocket connected successfully');
        });
        newSocket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
        });
        setSocket(newSocket);
      }
    }
  }, [user, connectSocket]);


  useEffect(() => {
    if (socket && user) {
      joinUserRoom();
    }
  }, [socket, user, joinUserRoom]);

  return (
    <WebSocketContext.Provider value={{ socket, reinitializeSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);