
'use server';

/**
 * @fileOverview A conversational AI for diagnosing plant problems and providing care advice.
 *
 * - diagnosePlantProblems - A function that handles the plant diagnosis process.
 */

import {ai} from '@/ai/genkit';
import { DiagnoseLogMessageSchema, DiagnosePlantProblemsInputSchema, DiagnosePlantProblemsOutputSchema, type DiagnosePlantProblemsInput } from '@/lib/types';

export async function diagnosePlantProblems(input: DiagnosePlantProblemsInput) {
  return diagnosePlantProblemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantProblemsPrompt',
  input: {schema: DiagnosePlantProblemsInputSchema},
  output: {schema: DiagnoseLogMessageSchema},
  prompt: `You are an expert botanist specializing in diagnosing plant illnesses. A user is asking for help with their plant. Engage in a conversation to help them identify and solve the issue.

  Plant name: {{{plantName}}}
  {{#if careGuide}}
  Care Guide: {{{careGuide}}}
  {{/if}}

  Conversation History:
  {{#each chatHistory}}
  {{#if (eq role 'user')}}User: {{content}}{{/if}}
  {{#if (eq role 'model')}}AI: {{content}}{{/if}}
  {{/each}}
  
  User's latest message: {{{problemDescription}}}

  Based on the entire conversation, provide a helpful and conversational response. If you have enough information, offer a diagnosis and care advice. If not, ask clarifying questions.`,
});

const diagnosePlantProblemsFlow = ai.defineFlow({
  name: 'diagnosePlantProblemsFlow',
  inputSchema: DiagnosePlantProblemsInputSchema,
  outputSchema: DiagnosePlantProblemsOutputSchema,
}, async (input) => {
  const llmResponse = await prompt.generate({
    input: input,
    history: input.chatHistory.map(m => ({
      role: m.role,
      content: [{ text: m.content }],
    })),
  });

  const output = llmResponse.output();
  if (!output) {
    throw new Error("The model did not return a response.");
  }
  return output;
});
