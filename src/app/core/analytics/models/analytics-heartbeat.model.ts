export interface AnalyticsHeartbeatMessage {
  page: string;
  listening: boolean;
  trackId?: number | null;
}
