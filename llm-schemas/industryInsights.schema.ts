// will use this schema for forcing LLM to generate content in a specific format

import { Type } from '@google/genai';

export const IndustryInsightSchemaForLLM = {
  type: Type.OBJECT,
  properties: {
    salaryRanges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: {
            type: Type.STRING,
          },
          min: {
            type: Type.NUMBER,
          },
          max: {
            type: Type.NUMBER,
          },
          median: {
            type: Type.NUMBER,
          },
          location: {
            type: Type.STRING,
          },
        },
      },
    },
    growthRate: {
      type: Type.NUMBER,
    },
    demandLevel: {
      type: Type.STRING,
      enum: ['High', 'Medium', 'Low'],
    },
    topSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    marketOutlook: {
      type: Type.STRING,
      enum: ['Positive', 'Neutral', 'Negative'],
    },
    keyTrends: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    recommendedSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
  },
};
