export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function notify(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/icons/icon-192.png' });
  } catch {
    /* Notifications can throw in some contexts (e.g. no service worker yet) — fail silently. */
  }
}

export const notifications = {
  goalCompleted: () => notify('Goal complete 🎉', "You've hit your study goal for today."),
  streakContinued: (days: number) => notify('Streak alive', `${days} days in a row. Keep it going.`),
  breakReminder: () => notify('Time for a short break', "You've been focused for a while — stretch and reset."),
  dailyReminder: () => notify('Study reminder', "You haven't logged a session today yet."),
};
