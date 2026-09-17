import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isServerlessMesh: boolean;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isServerlessMesh: false,
  backendUrl: '',
  setBackendUrl: () => {}
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [backendUrl, setBackendUrlState] = useState<string>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryServer = urlParams.get('server');
      if (queryServer) {
        localStorage.setItem('connectsphere_backend_url', queryServer);
        return queryServer;
      }
      return localStorage.getItem('connectsphere_backend_url') || (import.meta as any).env?.VITE_BACKEND_URL || '';
    } catch (e) {
      return '';
    }
  });

  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const setBackendUrl = (newUrl: string) => {
    setBackendUrlState(newUrl);
    if (newUrl) {
      localStorage.setItem('connectsphere_backend_url', newUrl);
    } else {
      localStorage.removeItem('connectsphere_backend_url');
    }
  };

  useEffect(() => {
    // Determine target server URL
    let targetUrl = backendUrl;
    if (!targetUrl && isLocalhost) {
      targetUrl = 'http://localhost:5000';
    }

    if (!targetUrl && isGitHubPages) {
      // Running completely serverless on GitHub Pages with Global PeerJS Mesh
      setSocket(null);
      setIsConnected(false);
      return;
    }

    let socketInstance: Socket | null = null;
    try {
      socketInstance = io(targetUrl || undefined, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1500,
        autoConnect: true,
        timeout: 5000
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('connect_error', () => {
        setIsConnected(false);
      });

      setSocket(socketInstance);
    } catch (err) {
      console.warn('Socket connection error, running on Global PeerJS Mesh:', err);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [backendUrl, isGitHubPages, isLocalhost]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        isServerlessMesh: !isConnected,
        backendUrl,
        setBackendUrl
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
