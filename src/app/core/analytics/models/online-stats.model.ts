export interface OnlineStatsDto {
  totalOnline: number;
  onlinePerTrack?: Record<string, number>;
  generatedAt?: string;
}
