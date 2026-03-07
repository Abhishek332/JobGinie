/**
 * Gemini (free tier) implementation of the LLM abstraction.
 * Only this file should import @google/genai for the resume/analysis feature.
 */

import { GoogleGenAI, Type } from '@google/genai';

/** Minimal schema for verification only (e.g. scripts or /api/verify-llm). */
export const VERIFY_LLM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING },
  },
} as const;

import type { GenerateStructuredOptions } from '../types';

const DEFAULT_MODEL = 'gemini-1.5-flash';

function getApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      'Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in env.',
    );
  }
  return key.trim();
}

export async function generateStructuredWithGemini<T = unknown>(
  options: GenerateStructuredOptions<T>,
): Promise<T> {
  const { prompt, systemPrompt, schema, model = DEFAULT_MODEL } = options;
  const apiKey = getApiKey();

  const ai = new GoogleGenAI({ apiKey });

  const contents = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const config: {
    responseMimeType: string;
    responseSchema?: object;
  } = {
    responseMimeType: 'application/json',
  };
  if (schema) {
    config.responseSchema = schema;
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config,
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error('Gemini returned no text in response');
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Gemini response was not valid JSON: ${text.slice(0, 200)}...`,
    );
  }
}
