
'use server';

/**
 * @fileOverview A conversational AI for answering any question about a user's plant.
 *
 * - plantChat - A function that handles the conversation with the plant expert AI.
 */

import {ai} from '@/ai/genkit';
import { PlantChatMessageSchema, PlantChatInputSchema, PlantChatOutputSchema, type PlantChatInput } from '@/lib/types';

export async function plantChat(input: PlantChatInput) {
  return plantChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plantChatPrompt',
  input: {schema: PlantChatInputSchema},
  output: {schema: PlantChatMessageSchema},
  prompt: `You are LeafWise, a friendly and knowledgeable plant expert. A user is asking a question about their plant. Engage in a helpful, conversational way to answer their question. You can answer questions about plant care, identification, problems, or anything else related to the plant.

  Plant name: {{{plantName}}}
  {{#if careGuide}}
  Care Guide: {{{careGuide}}}
  {{/if}}

  Conversation History:
  {{#each chatHistory}}
  {{role}}: {{content}}
  {{/each}}
  
  User's latest question: {{{userQuestion}}}

  Based on the entire conversation, provide a helpful and conversational response. If you have enough information, answer their question. If not, ask clarifying questions.`,
});

const plantChatFlow = ai.defineFlow({
  name: 'plantChatFlow',
  inputSchema: PlantChatInputSchema,
  outputSchema: PlantChatOutputSchema,
}, async (input) => {
  const llmResponse = await prompt(input, {
    history: input.chatHistory.map(m => ({
      role: m.role,
      content: [{ text: m.content }],
    })),
  });

  const output = llmResponse.output;
  if (!output) {
    throw new Error("The model did not return a response.");
  }
  return output;
});
