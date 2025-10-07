'use server';

/**
 * @fileOverview Predicts the next watering date for a plant based on its species and last watering date.
 *
 * - predictWateringSchedule - A function that predicts the next watering date.
 * - PredictWateringScheduleInput - The input type for the predictWateringSchedule function.
 * - PredictWateringScheduleOutput - The return type for the predictWateringSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictWateringScheduleInputSchema = z.object({
  plantSpecies: z.string().describe('The species of the plant.'),
  lastWateringDate: z.string().describe('The last watering date of the plant (ISO format).'),
});
export type PredictWateringScheduleInput = z.infer<typeof PredictWateringScheduleInputSchema>;

const PredictWateringScheduleOutputSchema = z.object({
  predictedWateringDate: z.string().describe('The predicted next watering date (ISO format).'),
  reasoning: z.string().describe('The AI reasoning behind the predicted watering schedule.'),
});
export type PredictWateringScheduleOutput = z.infer<typeof PredictWateringScheduleOutputSchema>;

export async function predictWateringSchedule(input: PredictWateringScheduleInput): Promise<PredictWateringScheduleOutput> {
  return predictWateringScheduleFlow(input);
}

const careGuideTool = ai.defineTool({
  name: 'getPlantCareGuide',
  description: 'Retrieves the care guide for a specific plant species, including watering frequency.',
  inputSchema: z.object({
    plantSpecies: z.string().describe('The species of the plant to get the care guide for.'),
  }),
  outputSchema: z.string().describe('A care guide document for the plant.'),
}, async (input) => {
  // TODO: replace with actual care guide retrieval logic from database or external source.
  // For now, return a canned response.
  if (input.plantSpecies.toLowerCase().includes('orchid')) {
    return `Orchids typically need watering every 1-2 weeks, allowing the soil to dry out completely between waterings.`;
  } else if (input.plantSpecies.toLowerCase().includes('succulent')) {
    return `Succulents need very little watering, typically every 2-4 weeks, depending on the environment.  Ensure well-draining soil.`;
  } else if (input.plantSpecies.toLowerCase().includes('fern')) {
    return `Ferns like consistently moist soil, so water them every 1-3 days.`;
  }
  return `Water the plant when the top inch of soil feels dry.  Ensure good drainage.`;
});

const prompt = ai.definePrompt({
  name: 'predictWateringSchedulePrompt',
  input: {schema: PredictWateringScheduleInputSchema},
  output: {schema: PredictWateringScheduleOutputSchema},
  tools: [careGuideTool],
  prompt: `You are a plant care expert. Given the plant species and the last watering date, predict the next watering date and explain your reasoning.

Plant Species: {{{plantSpecies}}}
Last Watering Date: {{{lastWateringDate}}}

Consider the following:
- General watering guidelines for the plant species (use the getPlantCareGuide tool).
- Environmental factors that might affect watering frequency (e.g., season, humidity, sunlight).

Format the predicted watering date in ISO format.
`,
});

const predictWateringScheduleFlow = ai.defineFlow(
  {
    name: 'predictWateringScheduleFlow',
    inputSchema: PredictWateringScheduleInputSchema,
    outputSchema: PredictWateringScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
