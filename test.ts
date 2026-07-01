import { identifyPlantFromImage } from './src/ai/flows/identify-plant-from-image';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import * as path from 'path';

async function test() {
  try {
    console.log("Reading image...");
    const imagePath = "C:\\Users\\sahil\\.gemini\\antigravity\\brain\\72b21454-e691-4378-b629-da638c6c2ffd\\plant_image_1782899360257.jpg";
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64Image}`;

    console.log("Calling identifyPlantFromImage flow...");
    const result = await identifyPlantFromImage({ photoDataUri: dataUri });
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error during plant recognition test:", error);
  }
}

test();
