import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import SectionHeader from './section-header';
import SectionWrapper from './section-wrapper';
import { Button } from './ui/button';

const CallToActions = () => {
  return (
    <SectionWrapper className="bg-muted/50">
      <SectionHeader
        title="Land Your Dream Job with AI-Powered Guidance"
        desc="Resume reviews, interview prep, and career insights—powered by AI. Get personalized recommendations and accelerate your job search."
      />
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Link
          href="/resume-analyzer"
          passHref
        >
          <Button size="lg">
            Try AI Resume Review
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </Link>
        <Link
          href="/industry-trends"
          passHref
        >
          <Button
            size="lg"
            variant="outline"
          >
            Explore JobGenie
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
};

export default CallToActions;
