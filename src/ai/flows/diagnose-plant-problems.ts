'use server';

/**
 * @fileOverview A conversational AI for diagnosing plant problems and providing care advice.
 *
 * - diagnosePlantProblems - A function that handles the plant diagnosis process.
 * - DiagnosePlantProblemsInput - The input type for the diagnosePlantProblems function.
 * - DiagnosePlantProblemsOutput - The return type for the diagnosePlantProblems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DiagnosePlantProblemsInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
  problemDescription: z.string().describe('A detailed description of the plant’s problems.'),
  careGuide: z.string().optional().describe('Care guide for the plant if available.'),
});
export type DiagnosePlantProblemsInput = z.infer<typeof DiagnosePlantProblemsInputSchema>;

const DiagnosePlantProblemsOutputSchema = z.object({
  diagnosis: z.string().describe('A detailed diagnosis of the plant’s problems and care advice.'),
});
export type DiagnosePlantProblemsOutput = z.infer<typeof DiagnosePlantProblemsOutputSchema>;

export async function diagnosePlantProblems(input: DiagnosePlantProblemsInput): Promise<DiagnosePlantProblemsOutput> {
  return diagnosePlantProblemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantProblemsPrompt',
  input: {schema: DiagnosePlantProblemsInputSchema},
  output: {schema: DiagnosePlantProblemsOutputSchema},
  prompt: `You are an expert botanist specializing in diagnosing plant illnesses.  A user has described a problem with their plant.

  Plant name: {{{plantName}}}
  Problem description: {{{problemDescription}}}
  Care Guide: {{{careGuide}}}

  Based on the information provided, provide a detailed diagnosis of the plant’s problems and tailored care advice. Be conversational.`, // Changed prompt to be conversational
});

const diagnosePlantProblemsFlow = ai.defineFlow({
  name: 'diagnosePlantProblemsFlow',
  inputSchema: DiagnosePlantProblemsInputSchema,
  outputSchema: DiagnosePlantProblemsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
