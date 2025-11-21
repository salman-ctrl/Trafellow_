"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import socket from '@/lib/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('userOnline', user.user_id);

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Socket connected');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('❌ Socket disconnected');
      });

      // Listen for new DM notifications (global)
      socket.on('new_dm_notification', (data) => {
        console.log('New DM notification:', data);
        // You can show a toast notification here if user is not in chat page
        if (!window.location.pathname.includes('/messages')) {
          toast.success(`Pesan baru dari ${data.sender_name}`);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};