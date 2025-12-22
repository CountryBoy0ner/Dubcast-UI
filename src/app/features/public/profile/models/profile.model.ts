export interface UserProfileResponse {
  username?: string | null;
  bio?: string | null;
}

export interface UpdateUsernameRequest {
  username: string;
}

export interface UpdateBioRequest {
  bio?: string | null;
}
