export const DEFAULT_CHAT_MODEL: string = 'gemini-1.5-flash';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: "Google's fast and efficient model for most tasks.",
  },
  {
    id: 'gemini-1.5-pro-latest',
    name: 'Gemini 1.5 Pro',
    description: "Google's most capable model, optimized for complex tasks.",
  },
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat (fallback)',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning (fallback)',
  },
];
