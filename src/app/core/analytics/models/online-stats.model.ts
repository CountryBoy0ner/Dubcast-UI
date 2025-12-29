export interface OnlineStatsDto {
  totalOnline: number;
  onlinePerTrack?: Record<string, number>; // у тебя deprecated, можно игнорировать
  generatedAt?: string; // ISO date-time
}
