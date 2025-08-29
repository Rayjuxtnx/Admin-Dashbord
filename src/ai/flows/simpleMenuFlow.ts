'use server';
/**
 * @fileOverview A sample flow for menu management.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const simpleMenuFlow = ai.defineFlow(
  {
    name: 'simpleMenuFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (name) => {
    const {text} = await ai.generate({
      prompt: `You are a friendly restaurant assistant. Say hello to the user, whose name is ${name}.`,
    });
    return text;
  }
);
