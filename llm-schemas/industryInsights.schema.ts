// Schema hint for LLM to generate industry insights in a specific format (used with LangChain).

/** Shape returned by the LLM (and valid for Prisma industryInsight.create data). */
export type IndustryInsightFromLLM = {
  salaryRanges?: {
    role: string;
    min: number;
    max: number;
    median: number;
    location?: string;
  }[];
  growthRate?: number;
  demandLevel?: 'High' | 'Medium' | 'Low';
  topSkills?: string[];
  marketOutlook?: 'Positive' | 'Neutral' | 'Negative';
  keyTrends?: string[];
  recommendedSkills?: string[];
};

/** Plain-object schema hint for generateStructured (stringified into the prompt). */
export const IndustryInsightSchemaForLLM = {
  type: 'object',
  properties: {
    salaryRanges: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          role: { type: 'string' },
          min: { type: 'number' },
          max: { type: 'number' },
          median: { type: 'number' },
          location: { type: 'string' },
        },
      },
    },
    growthRate: { type: 'number' },
    demandLevel: { type: 'string', enum: ['High', 'Medium', 'Low'] },
    topSkills: { type: 'array', items: { type: 'string' } },
    marketOutlook: {
      type: 'string',
      enum: ['Positive', 'Neutral', 'Negative'],
    },
    keyTrends: { type: 'array', items: { type: 'string' } },
    recommendedSkills: { type: 'array', items: { type: 'string' } },
  },
} as const;
