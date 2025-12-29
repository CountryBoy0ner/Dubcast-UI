import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessageDto } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  constructor(private http: HttpClient) {}

  getLastMessages(limit = 50): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`/api/chat/messages?limit=${limit}`);
  }

  getPage(page = 0, size = 50) {
    return this.http.get<ChatMessageDto[]>(`/api/chat/messages/page?page=${page}&size=${size}`);
  }

  send(message: string): Observable<ChatMessageDto> {
    return this.http.post<ChatMessageDto>('/api/chat/messages', { message });
  }
}
