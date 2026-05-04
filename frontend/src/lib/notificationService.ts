/**
 * Notification service for displaying user-friendly messages
 * Provides toast-like notifications for success, error, warning, and info messages
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// Global notification listeners
const listeners: Set<(notification: Notification) => void> = new Set();

// Queue to store notifications
const notificationQueue: Notification[] = [];

class NotificationService {
  /**
   * Subscribe to notifications
   */
  static subscribe(listener: (notification: Notification) => void): () => void {
    listeners.add(listener);
    // Notify of any queued notifications
    notificationQueue.forEach(listener);
    notificationQueue.length = 0;
    return () => listeners.delete(listener);
  }

  /**
   * Emit a notification to all listeners
   */
  private static emit(notification: Notification) {
    if (listeners.size === 0) {
      // Queue if no listeners
      notificationQueue.push(notification);
    } else {
      listeners.forEach(listener => listener(notification));
    }
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show success notification
   */
  static success(message: string, duration: number = 3000) {
    this.emit({
      id: this.generateId(),
      type: 'success',
      message,
      duration,
    });
  }

  /**
   * Show error notification
   */
  static error(message: string, duration: number = 5000) {
    this.emit({
      id: this.generateId(),
      type: 'error',
      message,
      duration,
    });
  }

  /**
   * Show warning notification
   */
  static warning(message: string, duration: number = 4000) {
    this.emit({
      id: this.generateId(),
      type: 'warning',
      message,
      duration,
    });
  }

  /**
   * Show info notification
   */
  static info(message: string, duration: number = 3000) {
    this.emit({
      id: this.generateId(),
      type: 'info',
      message,
      duration,
    });
  }
}

export default NotificationService;
