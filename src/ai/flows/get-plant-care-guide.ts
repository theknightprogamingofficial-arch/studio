
'use server';

/**
 * @fileOverview Generates a detailed care guide for a specific plant.
 *
 * - getPlantCareGuide - A function that returns a plant care guide.
 */

import {ai} from '@/ai/genkit';
import { GetPlantCareGuideInputSchema, GetPlantCareGuideOutputSchema, type GetPlantCareGuideInput } from '@/lib/types';


export async function getPlantCareGuide(input: GetPlantCareGuideInput) {
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
