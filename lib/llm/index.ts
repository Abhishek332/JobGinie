/**
 * Public API for the LLM abstraction.
 * Use only this module and types from lib/llm in feature code (actions, pages).
 * Backed by LangChain; provider switch via env and credentials only.
 */

import { generateStructuredWithLangChain } from './providers/langchain-gemini';
import type { LLMProvider } from './types';

export type { GenerateStructuredOptions, LLMProvider } from './types';

function getProvider(): LLMProvider {
  const raw = process.env.LLM_PROVIDER?.trim()?.toLowerCase();
  if (raw === 'openai' || raw === 'ollama') {
    return raw;
  }
  return 'gemini';
}

/**
 * Call the configured LLM with a prompt and optional schema; returns parsed structured output.
 * Provider is selected via LLM_PROVIDER env (default: gemini). Uses LangChain under the hood.
 */
export async function generateStructured<T = unknown>(
  options: import('./types').GenerateStructuredOptions,
): Promise<T> {
  const provider = getProvider();

  switch (provider) {
    case 'gemini':
      return generateStructuredWithLangChain<T>(options);
    case 'openai':
    case 'ollama':
      throw new Error(
        `LLM provider "${provider}" is not implemented yet. Set LLM_PROVIDER=gemini or add implementation in lib/llm/providers.`,
      );
    default:
      return generateStructuredWithLangChain<T>(options);
  }
}
