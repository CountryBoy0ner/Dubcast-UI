export interface TrackLikeStateResponse {
  trackId: number;
  likesCount: number;
  liked: boolean;
}

export interface TrackLikeMeResponse {
  liked: boolean;
}

export interface TrackLikesChangedEvent {
  trackId: number;
  likesCount: number;
}
