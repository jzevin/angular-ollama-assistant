import { Injectable } from '@angular/core';
import { LocalChatViewModel } from '../models/local-chat.model';

@Injectable({
  providedIn: 'root',
})
export class LocalChatStorageService {
  private KEY_PREFIX = 'zev-ai-chat-';

  saveChatState(chatViewModel: LocalChatViewModel): void {
    const timestamp = chatViewModel.messages[chatViewModel.messages.length - 1].timestamp;
    const key = this.KEY_PREFIX + timestamp.toISOString();
    localStorage.setItem(key, JSON.stringify(chatViewModel));
  }

  getChatState(key: string): LocalChatViewModel | null {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
  }

  getAllChatStates(): LocalChatViewModel[] {
    const chatStates: LocalChatViewModel[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.KEY_PREFIX)) {
        const chatState = this.getChatState(key);
        if (chatState) {
          chatStates.push(chatState);
        }
      }
    }
    return chatStates;
  }

  getKetPrefix(): string {
    return this.KEY_PREFIX;
  }
}