/**
 * LLM abstraction – provider-agnostic types.
 * Feature code uses only these types and the public API from lib/llm.
 */

export type LLMProvider = 'gemini' | 'openai' | 'ollama';

export interface GenerateStructuredOptions {
  /** User prompt (or main content). */
  prompt: string;
  /** Optional system / instruction prompt. */
  systemPrompt?: string;
  /**
   * Optional schema hint for structured JSON output. Passed as a hint in the prompt;
   * provider (LangChain) returns JSON that is parsed and typed as T.
   */
  schema?: object;
  /** Model name override (optional; provider may have a default). */
  model?: string;
}
