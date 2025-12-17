export interface NowPlayingResponse {
  playing: boolean;
  title?: string;
  artworkUrl?: string;
  startedAt?: string;        // ISO date-time
  durationSeconds?: number;
  trackUrl?: string;
  trackId?: number | null;
  playlistTitle?: string | null;
}
