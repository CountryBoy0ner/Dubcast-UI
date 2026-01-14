export interface ScheduleTrackDto {
  id: number;
  soundcloudUrl: string;
  title: string;
  durationSeconds: number;
  artworkUrl?: string | null;
  likesCount?: number;
}

export interface ScheduleEntryDto {
  id: number;
  track: ScheduleTrackDto;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  playlistId?: number | null;
}
