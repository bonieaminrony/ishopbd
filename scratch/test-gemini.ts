import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenAI({ apiKey });
  
  const models = [
    'gemini-2.5-flash',
    'gemini-3.6-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-flash-preview'
  ];

  for (const model of models) {
    try {
      console.log(`\nTesting model "${model}"...`);
      const response = await genAI.models.generateContent({
        model,
        contents: 'Hi! Say "Working!" if you hear me.'
      });
      console.log(`✅ [${model}] SUCCESS! Response:`, response.text);
    } catch (err: any) {
      console.log(`❌ [${model}] ERROR:`, err.message || err);
    }
  }
}

main();
