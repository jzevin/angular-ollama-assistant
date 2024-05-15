import { Message } from 'ollama';

export interface LocalChatMessage extends Message {
  timestamp: Date;
  role: 'user' | 'assistant';
  avatar?: string;
}

export interface LocalChatViewModel {
  messages: LocalChatMessage[];
  prompt: string;
  loading: boolean;
  selectedModel: 'llama3:8b' | 'llama2:13b' | 'gemma:latest' | 'mistral:latest' | 'moondream:latest';
  shouldAnswerAsMarkdown: boolean;
}

export interface SavedChats {
  [key: string]: LocalChatViewModel[];
}