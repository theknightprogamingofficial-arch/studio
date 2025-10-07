'use server';
/**
 * @fileOverview Identifies a plant species from an image.
 *
 * - identifyPlantFromImage - A function that identifies a plant from an image.
 * - IdentifyPlantFromImageInput - The input type for the identifyPlantFromImage function.
 * - IdentifyPlantFromImageOutput - The return type for the identifyPlantFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPlantFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyPlantFromImageInput = z.infer<typeof IdentifyPlantFromImageInputSchema>;

const IdentifyPlantFromImageOutputSchema = z.object({
  commonName: z.string().describe('The common name of the identified plant.'),
  latinName: z.string().describe('The Latin name of the identified plant.'),
  funFact: z.string().describe('A fun fact about the plant.'),
});
export type IdentifyPlantFromImageOutput = z.infer<typeof IdentifyPlantFromImageOutputSchema>;

export async function identifyPlantFromImage(
  input: IdentifyPlantFromImageInput
): Promise<IdentifyPlantFromImageOutput> {
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
