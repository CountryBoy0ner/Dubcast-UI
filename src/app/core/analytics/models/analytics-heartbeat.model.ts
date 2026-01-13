export interface AnalyticsHeartbeatMessage {
  page: string; // например "/radio"
  listening: boolean; // true = слушаю
  trackId?: number | null; // текущий трек, можно null
}
