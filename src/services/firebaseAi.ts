import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import firebaseConfig from '../../firebase-applet-config.json';

const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export async function askGeminiViaFirebase(prompt: string, context?: string): Promise<string> {
  try {
    const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
    const finalPrompt = context ? `${context}\n\n${prompt}` : prompt;
    const result = await model.generateContent(finalPrompt);
    return result.response.text().trim();
  } catch (error) {
    console.warn('Firebase AI Logic unavailable, falling back to backend.', error);
    return '';
  }
}
