
import { z } from 'zod';

export type JournalEntry = {
  id: string;
  date: string;
  note: string;
  photoDataUri?: string;
};

export type Plant = {
  id: string;
  commonName: string;
  latinName: string;
  funFact: string;
  photoDataUri: string;
  lastWateringDate?: string;
  journalEntries?: JournalEntry[];
};

export type IdentifiedPlant = Omit<Plant, 'id' | 'lastWateringDate' | 'journalEntries'>;

export type AppContextType = {
  garden: Plant[];
  addPlant: (plant: Omit<Plant, 'id'| 'journalEntries'>) => void;
  updatePlant: (updatedPlant: Plant) => void;
  removePlant: (plantId: string) => void;
  addJournalEntry: (plantId: string, entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  isInitialized: boolean;
  identifiedPlant: IdentifiedPlant | null;
  setIdentifiedPlant: (plant: IdentifiedPlant | null) => void;
};

// Schemas for identify-plant-from-image.ts
export const IdentifyPlantFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyPlantFromImageInput = z.infer<typeof IdentifyPlantFromImageInputSchema>;

export const IdentifyPlantFromImageOutputSchema = z.object({
  commonName: z.string().describe('The common name of the identified plant.'),
  latinName: z.string().describe('The Latin name of the identified plant.'),
  funFact: z.string().describe('A fun fact about the plant.'),
});
export type IdentifyPlantFromImageOutput = z.infer<typeof IdentifyPlantFromImageOutputSchema>;

// Schemas for get-plant-care-guide.ts
export const GetPlantCareGuideInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
});
export type GetPlantCareGuideInput = z.infer<typeof GetPlantCareGuideInputSchema>;

export const GetPlantCareGuideOutputSchema = z.object({
  watering: z.string().describe('How often to water the plant.'),
  sunlight: z.string().describe('The amount of sunlight the plant needs.'),
  soil: z.string().describe('The type of soil the plant requires.'),
  fertilizer: z.string().describe('The type and frequency of fertilizer the plant needs.'),
  isIndoor: z.boolean().describe('Whether the plant is typically an indoor plant.'),
  isOutdoor: z.boolean().describe('Whether the plant is typically an outdoor plant.'),
  extraTips: z.string().describe('Any other important care tips for the plant.'),
});
export type GetPlantCareGuideOutput = z.infer<typeof GetPlantCareGuideOutputSchema>;


// Schemas for diagnose-plant-problems.ts
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const DiagnosePlantProblemsInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
  chatHistory: z.array(ChatMessageSchema).describe('The conversation history.'),
  problemDescription: z.string().describe('The user\'s latest message describing the plant’s problems.'),
  careGuide: z.string().optional().describe('Care guide for the plant if available.'),
});
export type DiagnosePlantProblemsInput = z.infer<typeof DiagnosePlantProblemsInputSchema>;

export const DiagnosePlantProblemsOutputSchema = z.object({
  diagnosis: z.string().describe('A detailed diagnosis of the plant’s problems and care advice.'),
});
export type DiagnosePlantProblemsOutput = z.infer<typeof DiagnosePlantProblemsOutputSchema>;

// A Zod schema for the log message.
export const DiagnoseLogMessageSchema = z.object({
  diagnosis: z.string().describe('A detailed diagnosis of the plant’s problems and care advice.'),
});
