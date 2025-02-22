import React from 'react';

import SectionHeader from './section-header';
import { Card, CardContent } from './ui/card';
import { features } from '@/data/features';

const Features = () => {
  return (
    <section className="w-full bg-background py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader title="Powerful Features for Your Career Success" />
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 transition-colors duration-300 hover:border-primary"
            >
              <CardContent className="flex flex-col items-center pt-6 text-center">
                <div className="flex flex-col items-center justify-center">
                  {feature.icon}
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
