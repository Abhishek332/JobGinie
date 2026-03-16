/**
 * LangChain-based Gemini implementation of the LLM abstraction.
 * No direct @google/genai in feature code; this file uses @langchain/google-genai.
 */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

import type { GenerateStructuredOptions } from '../types';

const FALLBACK_MODEL = 'gemini-2.0-flash-lite';

function getApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GOOGLE_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      'Missing Gemini API key. Set GEMINI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or GOOGLE_API_KEY in env.',
    );
  }
  return key.trim();
}

function getModel(): string {
  const envModel = (
    process.env.GEMINI_MODEL ??
    process.env.LLM_MODEL ??
    ''
  ).trim();
  return envModel || FALLBACK_MODEL;
}

export async function generateStructuredWithLangChain<T = unknown>(
  options: GenerateStructuredOptions,
): Promise<T> {
  const { prompt, systemPrompt, schema, model: optionModel } = options;
  const model = optionModel ?? getModel();
  const apiKey = getApiKey();

  const chat = new ChatGoogleGenerativeAI({
    model,
    apiKey,
    temperature: 0,
  });

  const systemContent = [
    'You must respond with valid JSON only. No markdown code blocks, no explanation, no extra text.',
    systemPrompt ?? '',
    schema
      ? `Respond with a JSON object matching this structure: ${JSON.stringify(schema)}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const messages = [
    ...(systemContent ? [new SystemMessage(systemContent)] : []),
    new HumanMessage(prompt),
  ];

  const response = await chat.invoke(messages);
  const text =
    typeof response.content === 'string'
      ? response.content
      : String(response.content ?? '').trim();

  if (!text) {
    throw new Error('LLM returned no text in response');
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `LLM response was not valid JSON: ${text.slice(0, 200)}...`,
    );
  }
}
