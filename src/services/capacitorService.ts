import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { Article } from '../types';

export const isNativeCapacitor = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const getCapacitorPlatform = (): string => {
  try {
    return Capacitor.getPlatform();
  } catch {
    return 'web';
  }
};

/**
 * Initialize native Android Status Bar and UI tweaks when running in Capacitor
 */
export const initCapacitorNativeUI = async () => {
  if (!isNativeCapacitor()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0B0E14' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (err) {
    console.warn('Capacitor StatusBar init note:', err);
  }
};

/**
 * Native Haptic Feedback Helpers
 */
export const triggerHapticLight = async () => {
  try {
    if (isNativeCapacitor()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch {}
};

export const triggerHapticMedium = async () => {
  try {
    if (isNativeCapacitor()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  } catch {}
};

export const triggerHapticSuccess = async () => {
  try {
    if (isNativeCapacitor()) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  } catch {}
};

/**
 * Native Network Monitoring
 */
export const initCapacitorNetworkListener = async (
  onNetworkChange: (connected: boolean, connectionType: string) => void
) => {
  if (!isNativeCapacitor()) return () => {};

  try {
    const status = await Network.getStatus();
    onNetworkChange(status.connected, status.connectionType);

    const listener = await Network.addListener('networkStatusChange', (status) => {
      onNetworkChange(status.connected, status.connectionType);
    });

    return () => {
      listener.remove();
    };
  } catch {
    return () => {};
  }
};

/**
 * Native Android FCM Push Notifications via Capacitor
 */
export const initCapacitorPushNotifications = async (
  onPushReceived: (
  title: string,
  body: string,
  articleId?: string,
  link?: string
) => void
  if (!isNativeCapacitor() || Capacitor.getPlatform() !== 'android') return;

  try {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
      return;
    }

    await PushNotifications.register();

    await PushNotifications.addListener('registration', (token) => {
      console.log('Capacitor Native FCM Token:', token.value);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      onPushReceived(
  notification.title || "📢 Native FlashNews Alert",
  notification.body || "New article available.",
  notification.data?.articleId,
  notification.data?.link
);
      triggerHapticSuccess();
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const notification = action.notification;
      onPushReceived(
  notification.title || "📢 Native FlashNews Alert",
  notification.body || "New article available.",
  notification.data?.articleId,
  notification.data?.link
);
    });
  } catch (err) {
    console.warn('Capacitor Push init note:', err);
  }
};

/**
 * Native SharedPreferences Storage for Offline Room Cache & Bookmarks
 */
const BOOKMARKS_KEY = 'flashnews_native_bookmarks_v1';
const ARTICLES_CACHE_KEY = 'flashnews_native_articles_v1';

export const saveNativeBookmarks = async (bookmarkIds: string[]) => {
  try {
    if (isNativeCapacitor()) {
      await Preferences.set({
        key: BOOKMARKS_KEY,
        value: JSON.stringify(bookmarkIds)
      });
    } else {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarkIds));
    }
  } catch {}
};

export const loadNativeBookmarks = async (): Promise<string[]> => {
  try {
    if (isNativeCapacitor()) {
      const { value } = await Preferences.get({ key: BOOKMARKS_KEY });
      return value ? JSON.parse(value) : [];
    } else {
      const val = localStorage.getItem(BOOKMARKS_KEY);
      return val ? JSON.parse(val) : [];
    }
  } catch {
    return [];
  }
};

export const saveNativeArticlesCache = async (articles: Article[]) => {
  try {
    if (isNativeCapacitor()) {
      await Preferences.set({
        key: ARTICLES_CACHE_KEY,
        value: JSON.stringify(articles)
      });
    } else {
      localStorage.setItem(ARTICLES_CACHE_KEY, JSON.stringify(articles));
    }
  } catch {}
};

export const loadNativeArticlesCache = async (): Promise<Article[] | null> => {
  try {
    if (isNativeCapacitor()) {
      const { value } = await Preferences.get({ key: ARTICLES_CACHE_KEY });
      return value ? JSON.parse(value) : null;
    } else {
      const val = localStorage.getItem(ARTICLES_CACHE_KEY);
      return val ? JSON.parse(val) : null;
    }
  } catch {
    return null;
  }
};
