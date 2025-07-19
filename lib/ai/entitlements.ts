import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: [
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'chat-model',
      'chat-model-reasoning',
    ],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'chat-model',
      'chat-model-reasoning',
    ],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
