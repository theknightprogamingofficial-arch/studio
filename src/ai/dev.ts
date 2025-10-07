import { config } from 'dotenv';
config();

import '@/ai/flows/identify-plant-from-image.ts';
import '@/ai/flows/diagnose-plant-problems.ts';
import '@/ai/flows/get-plant-care-guide.ts';
