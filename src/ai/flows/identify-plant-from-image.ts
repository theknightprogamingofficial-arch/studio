
'use server';
/**
 * @fileOverview Identifies a plant species from an image.
 *
 * - identifyPlantFromImage - A function that identifies a plant from an image.
 */

import {ai} from '@/ai/genkit';
import { IdentifyPlantFromImageInputSchema, IdentifyPlantFromImageOutputSchema, type IdentifyPlantFromImageInput } from '@/lib/types';


export async function identifyPlantFromImage(
  input: IdentifyPlantFromImageInput
) {
  return identifyPlantFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPlantFromImagePrompt',
  input: {schema: IdentifyPlantFromImageInputSchema},
  output: {schema: IdentifyPlantFromImageOutputSchema},
  prompt: `You are an expert botanist.  You will identify the plant in the image and provide its common name, latin name, and a fun fact about the plant.  Return the data as a JSON object.

Image: {{media url=photoDataUri}}
`,
});

const identifyPlantFromImageFlow = ai.defineFlow(
  {
    name: 'identifyPlantFromImageFlow',
    inputSchema: IdentifyPlantFromImageInputSchema,
    outputSchema: IdentifyPlantFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
