import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': google('gemini-1.5-flash'),
        'chat-model-reasoning': wrapLanguageModel({
          model: google('gemini-1.5-flash'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': google('gemini-1.5-flash'),
        'artifact-model': google('gemini-1.5-flash'),
        'gemini-1.5-pro-latest': google('gemini-1.5-pro-latest'),
        'gemini-1.5-flash': google('gemini-1.5-flash'),
      },
    });
