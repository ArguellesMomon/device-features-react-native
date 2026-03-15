import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Show notifications even while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Request permission + create Android channel ──────────────────────────────
export const setupNotifications = async (): Promise<boolean> => {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission denied');
      return false;
    }

    // Android needs a channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('travel-diary', {
        name: 'Travel Diary',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4a90d9',
      });
    }

    return true;
  } catch (e) {
    console.error('[Notifications] Setup error:', e);
    return false;
  }
};

// ─── Fire an immediate local notification after saving an entry ───────────────
export const sendEntrySavedNotification = async (
  address: string
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✈️ Travel Entry Saved!',
        body: `Your memory at "${address}" has been added to your diary.`,
        sound: true,
      },
      trigger: null, // fires immediately
    });
  } catch (e) {
    // Non-critical — entry is already saved, just log the error
    console.error('[Notifications] Failed to send:', e);
  }
};