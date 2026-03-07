/**
 * Verification endpoint for the LLM abstraction.
 * GET /api/verify-llm – calls generateStructured with a trivial prompt and returns the result.
 * Use when env (LLM_PROVIDER, GEMINI_API_KEY) is set; confirms provider works.
 */

import { NextResponse } from 'next/server';

import { generateStructured } from '@/lib/llm';
import { VERIFY_LLM_SCHEMA } from '@/lib/llm/providers/gemini';

export async function GET() {
  try {
    const result = await generateStructured<{ message: string }>({
      prompt: 'Reply with exactly one short greeting sentence.',
      schema: VERIFY_LLM_SCHEMA as object,
    });
    return NextResponse.json({
      ok: true,
      provider: process.env.LLM_PROVIDER ?? 'gemini',
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
