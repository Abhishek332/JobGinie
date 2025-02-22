import React from 'react';

import SectionHeader from './section-header';
import SectionWrapper from './section-wrapper';
import { howItWorks } from '@/data/howItWorks';

const HowItWorks = () => {
  return (
    <SectionWrapper>
      <SectionHeader
        title="How It Works"
        desc="Four simple steps to accelerate your career growth"
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {howItWorks.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center space-y-4 text-center"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default HowItWorks;
