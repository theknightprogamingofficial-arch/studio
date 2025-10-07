import { config } from 'dotenv';
config();

import '@/ai/flows/identify-plant-from-image.ts';
import '@/ai/flows/predict-watering-schedule.ts';
import '@/ai/flows/diagnose-plant-problems.ts';