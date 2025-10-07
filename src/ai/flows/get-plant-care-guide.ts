'use server';

/**
 * @fileOverview Generates a detailed care guide for a specific plant.
 *
 * - getPlantCareGuide - A function that returns a plant care guide.
 * - GetPlantCareGuideInput - The input type for the getPlantCareGuide function.
 * - GetPlantCareGuideOutput - The return type for the getPlantCareGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GetPlantCareGuideInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
});
export type GetPlantCareGuideInput = z.infer<typeof GetPlantCareGuideInputSchema>;

const GetPlantCareGuideOutputSchema = z.object({
  watering: z.string().describe('How often to water the plant.'),
  sunlight: z.string().describe('The amount of sunlight the plant needs.'),
  soil: z.string().describe('The type of soil the plant requires.'),
  fertilizer: z.string().describe('The type and frequency of fertilizer the plant needs.'),
  isIndoor: z.boolean().describe('Whether the plant is typically an indoor plant.'),
  isOutdoor: z.boolean().describe('Whether the plant is typically an outdoor plant.'),
  extraTips: z.string().describe('Any other important care tips for the plant.'),
});
export type GetPlantCareGuideOutput = z.infer<typeof GetPlantCareGuideOutputSchema>;

export async function getPlantCareGuide(input: GetPlantCareGuideInput): Promise<GetPlantCareGuideOutput> {
  return getPlantCareGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getPlantCareGuidePrompt',
  input: {schema: GetPlantCareGuideInputSchema},
  output: {schema: GetPlantCareGuideOutputSchema},
  prompt: `You are an expert botanist. A user wants a care guide for their plant.

Plant name: {{{plantName}}}

Provide a detailed care guide covering the following aspects:
- Watering frequency and amount.
- Sunlight requirements (e.g., direct, indirect, low light).
- Soil requirements (e.g., well-draining, peat-based).
- Fertilizer needs (e.g., type, frequency during growing season).
- Whether it's primarily an indoor or outdoor plant.
- Any other important tips for keeping the plant healthy.
`,
});

const getPlantCareGuideFlow = ai.defineFlow({
  name: 'getPlantCareGuideFlow',
  inputSchema: GetPlantCareGuideInputSchema,
  outputSchema: GetPlantCareGuideOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
