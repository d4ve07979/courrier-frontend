// src/hooks/useNotifications.ts
import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../auth/useAuth';
import type { Notification } from '../api/notificationApi';

const WS_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8097') + '/ws-notifications';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!user || !user.email) return;

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
      },
      debug: (str) => {
        // console.log('STOMP:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ WebSocket connecté pour les notifications');
      client.subscribe(`/user/${user.email}/queue/notifications`, (message) => {
        try {
          const newNotif: Notification = JSON.parse(message.body);
          setNotifications((prev) => {
            if (prev.some(n => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
        } catch (err) {
          console.error('Erreur parsing notification', err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('❌ Erreur STOMP:', frame.headers['message']);
    };

    client.onWebSocketError = (error) => {
      console.error('❌ Erreur WebSocket:', error);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log('WebSocket déconnecté');
      }
    };
  }, [user]);

  return { notifications, setNotifications };
};