import React from 'react';

import SectionWrapper from './section-wrapper';

const StatsSection = () => {
  return (
    <SectionWrapper className="bg-muted/60">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center md:grid-cols-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <h3 className="text-4xl font-bold">50+</h3>
          <p className="text-muted-foreground">Industries Covered</p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <h3 className="text-4xl font-bold">1000+</h3>
          <p className="text-muted-foreground">Interview Questions</p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <h3 className="text-4xl font-bold">95%</h3>
          <p className="text-muted-foreground">Success Rate</p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <h3 className="text-4xl font-bold">24/7</h3>
          <p className="text-muted-foreground">AI Support</p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default StatsSection;
