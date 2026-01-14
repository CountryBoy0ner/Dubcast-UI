export interface NowPlayingResponse {
  playing: boolean;
  title?: string;
  artworkUrl?: string;
  startedAt?: string;
  durationSeconds?: number;
  trackUrl?: string;
  trackId?: number | null;
  playlistTitle?: string | null;
  likesCount?: number; // NEW
}
