'use server';
/**
 * @fileOverview A flow for menu-related AI tasks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const menuFlow = ai.defineFlow(
  {
    name: 'menuFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const {text} = await ai.generate({
      prompt: `Tell me a fun fact about ${subject}.`,
    });
    return text;
  }
);
