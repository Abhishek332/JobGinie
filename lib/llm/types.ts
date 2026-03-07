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
   * Schema for structured JSON output. Format is provider-specific.
   * For Gemini: use schema shape with Type.OBJECT etc. from @google/genai (only in providers/gemini.ts).
   */
  schema?: object;
  /** Model name override (optional; provider may have a default). */
  model?: string;
}
