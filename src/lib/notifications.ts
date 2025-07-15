import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });
      console.log('FCM Token:', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const setupNotificationListener = () => {
  const { toast } = useToast();
  
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    toast({
      title: payload.notification?.title || 'New Notification',
      description: payload.notification?.body || 'You have a new notification',
    });
  });
};

export const sendNotification = async (token: string, title: string, body: string, data?: any) => {
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        title,
        body,
        data,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};