// lib/notification-system.ts

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  timeoutId?: number;
}

class NotificationManager {
  private notifications: Map<string, ScheduledNotification> = new Map();
  private permission: NotificationPermission = 'default';

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        // Test notification to confirm it works
        new Notification('Notifications Enabled! 🔔', {
          body: 'You will now receive activity reminders',
          icon: '/icon.png', // Add your app icon path
          badge: '/badge.png',
        });
        return true;
      } else {
        alert('Please enable notifications in your browser settings to receive reminders.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  scheduleNotification(
    id: string,
    title: string,
    body: string,
    scheduledTime: Date
  ): boolean {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Cancel existing notification with same ID
    this.cancelNotification(id);

    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Send immediately if time has passed
      this.sendNotification(title, body);
      return true;
    }

    // Schedule for future
    const timeoutId = window.setTimeout(() => {
      this.sendNotification(title, body);
      this.notifications.delete(id);
    }, delay);

    this.notifications.set(id, {
      id,
      title,
      body,
      scheduledTime,
      timeoutId,
    });

    console.log(`📅 Notification scheduled for ${scheduledTime.toLocaleString()}`);
    console.log(`⏱️ Will trigger in ${Math.round(delay / 1000)} seconds`);

    return true;
  }

  private sendNotification(title: string, body: string) {
    if (this.permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'activity-reminder',
        requireInteraction: true, // Keeps notification visible
      });

      // Play sound (optional)
      this.playNotificationSound();

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      console.log('🔔 Notification sent:', title, body);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('/notification.mp3'); // Add a notification sound file
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (error) {
      console.log('Sound not available');
    }
  }

  cancelNotification(id: string) {
    const notification = this.notifications.get(id);
    if (notification?.timeoutId) {
      clearTimeout(notification.timeoutId);
      this.notifications.delete(id);
      console.log('🚫 Notification cancelled:', id);
    }
  }

  cancelAll() {
    this.notifications.forEach((notif) => {
      if (notif.timeoutId) {
        clearTimeout(notif.timeoutId);
      }
    });
    this.notifications.clear();
    console.log('🚫 All notifications cancelled');
  }

  sendTestNotification() {
    this.sendNotification(
      '🧪 Test Notification',
      'If you see this, notifications are working!'
    );
  }

  getScheduled(): ScheduledNotification[] {
    return Array.from(this.notifications.values());
  }

  hasPermission(): boolean {
    return this.permission === 'granted';
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Helper functions for easier use
export async function requestNotificationPermission(): Promise<boolean> {
  return notificationManager.requestPermission();
}

export function scheduleActivityNotification(
  activityId: string,
  activityName: string,
  time: string // Format: "HH:MM" or "HH:MM AM/PM"
): boolean {
  const scheduledTime = parseTimeToDate(time);
  
  return notificationManager.scheduleNotification(
    activityId,
    '⏰ Activity Reminder',
    `Time to: ${activityName}`,
    scheduledTime
  );
}

export function cancelActivityNotification(activityId: string) {
  notificationManager.cancelNotification(activityId);
}

// Parse time string to Date object
function parseTimeToDate(timeStr: string): Date {
  const now = new Date();
  const scheduledTime = new Date();
  
  // Handle both 24h and 12h formats
  let hours: number, minutes: number;
  
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    // 12-hour format
    const isPM = timeStr.includes('PM');
    const cleanTime = timeStr.replace(/AM|PM/gi, '').trim();
    const [hourStr, minStr] = cleanTime.split(':');
    hours = parseInt(hourStr);
    minutes = parseInt(minStr) || 0;
    
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  } else {
    // 24-hour format
    const [hourStr, minStr] = timeStr.split(':');
    hours = parseInt(hourStr);
    minutes = parseInt(minStr) || 0;
  }
  
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  // If the time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  return scheduledTime;
}

// Test function - you can call this to test notifications immediately
export function testNotification() {
  notificationManager.sendTestNotification();
}