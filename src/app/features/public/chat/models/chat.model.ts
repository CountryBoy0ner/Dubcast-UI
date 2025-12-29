export interface ChatMessageDto {
  id: number;
  username?: string | null;
  text: string;
  createdAt: string;
}

export interface PagedChatResponse {
  content: ChatMessageDto[];
  page: number;
  size: number;
  totalElements: number;
}
