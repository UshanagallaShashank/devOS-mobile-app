import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Task } from './db';

const CHANNEL = 'devos-tasks';

export function setupNotificationHandler() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {}
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('[notif] permission:', status);
    return status === 'granted';
  } catch (e) {
    console.log('[notif] permission error:', e);
    return false;
  }
}

export async function notifyTasksReady(tasks: Task[]) {
  const pending = tasks.filter(t => !t.done);
  if (pending.length === 0) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'DevOS — Tasks ready',
        body: `${pending.length} task${pending.length > 1 ? 's' : ''} lined up for today`,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: CHANNEL }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        repeats: false,
      },
    });
    console.log('[notif] fired tasks-ready for', pending.length, 'tasks');
  } catch (e) {
    console.log('[notif] error:', e);
  }
}

export async function scheduleDailyReminder(pendingCount: number) {
  if (pendingCount === 0) return;
  try {
    await Notifications.cancelScheduledNotificationAsync('daily').catch(() => {});
    const trigger = new Date();
    trigger.setHours(9, 0, 0, 0);
    if (trigger <= new Date()) trigger.setDate(trigger.getDate() + 1);
    await Notifications.scheduleNotificationAsync({
      identifier: 'daily',
      content: {
        title: 'DevOS — Good morning',
        body: `${pendingCount} task${pendingCount > 1 ? 's' : ''} waiting for you today`,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: CHANNEL }),
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
    });
  } catch (e) {
    console.log('[notif] daily error:', e);
  }
}

export async function scheduleTaskNotification(task: Task) {
  if (!task.start_time) return;
  try {
    const parts = task.start_time.trim().split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return;
    const fire = new Date();
    fire.setHours(h, m, 0, 0);
    fire.setMinutes(fire.getMinutes() - 20); // 20 mins before
    if (fire <= new Date()) return;
    await Notifications.scheduleNotificationAsync({
      identifier: `task-${task.id}`,
      content: {
        title: 'Starting in 20 mins',
        body: task.label,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: CHANNEL }),
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fire },
    });
  } catch {}
}

export async function cancelTaskNotification(taskId: string) {
  await Notifications.cancelScheduledNotificationAsync(`task-${taskId}`).catch(() => {});
}

export async function scheduleAllTaskNotifications(tasks: Task[]) {
  const pending = tasks.filter(t => !t.done);
  await scheduleDailyReminder(pending.length);
  await Promise.all(pending.map(scheduleTaskNotification));
}
