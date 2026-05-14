'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import NotificationService, { Notification, NotificationType } from '@/lib/notificationService';

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <Check className="w-5 h-5" />;
    case 'error':
      return <AlertCircle className="w-5 h-5" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5" />;
    case 'info':
      return <Info className="w-5 h-5" />;
  }
};

const getColorClasses = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'error':
      return 'bg-red-500/10 border-red-500/20 text-red-400';
    case 'warning':
      return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'info':
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
  }
};

export const ToastContainer = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const unsubscribe = NotificationService.subscribe((notification) => {
      setNotifications(prev => [...prev, notification]);

      // Auto-remove after duration
      if (notification.duration) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 100 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto mb-4"
          >
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm ${getColorClasses(notification.type)}`}
            >
              <div className="mt-0.5">
                {getIconForType(notification.type)}
              </div>
              <div className="flex-1 text-sm font-medium">
                {notification.message}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
