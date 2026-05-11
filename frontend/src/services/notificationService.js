/**
 * Service to handle Web Push Notifications and local alerts
 */
const notificationService = {
  /**
   * Request permission for notifications
   */
  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  /**
   * Send a local notification
   */
  sendLocalNotification: (title, options = {}) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });
    }
  },

  /**
   * Check if push is supported
   */
  isPushSupported: () => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }
};

export default notificationService;
