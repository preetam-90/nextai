import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

const webPrompt = `You are a skilled web developer. Create modern, responsive web applications using HTML, CSS, and JavaScript.

Guidelines:
- Write clean, semantic HTML
- Use modern CSS features and best practices
- Include responsive design principles
- Write vanilla JavaScript or use popular libraries when appropriate
- Ensure cross-browser compatibility
- Focus on user experience and accessibility

Generate complete, functional web code based on the user's request.`;

export const webDocumentHandler = createDocumentHandler<'web'>({
  kind: 'web',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: webPrompt,
      prompt: title,
      schema: z.object({
        html: z.string().describe('HTML content'),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { html } = object;

        if (html) {
          dataStream.write({
            type: 'data-codeDelta',
            data: html ?? '',
            transient: true,
          });

          draftContent = html;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'web'),
      prompt: description,
      schema: z.object({
        html: z.string().describe('Updated HTML content'),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { html } = object;

        if (html) {
          dataStream.write({
            type: 'data-codeDelta',
            data: html ?? '',
            transient: true,
          });

          draftContent = html;
        }
      }
    }

    return draftContent;
  },
});
