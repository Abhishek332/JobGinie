import Image from 'next/image';
import React from 'react';

import SectionHeader from './section-header';
import SectionWrapper from './section-wrapper';
import { Card, CardContent } from './ui/card';
import { testimonials } from '@/data/testimonial';

const Testimonials = () => {
  return (
    <SectionWrapper>
      <SectionHeader title="What Our Users Say" />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            className="bg-background"
          >
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-4">
                <div className="mb-4 flex items-center space-x-4">
                  <div className="relative size-12 shrink-0">
                    <Image
                      width={40}
                      height={40}
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="rounded-full border-2 border-primary/20 object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                    <p className="text-sm text-primary">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
                <blockquote>
                  <p className="relative italic text-muted-foreground">
                    <span className="absolute -left-2 -top-4 text-3xl text-primary">
                      &quot;
                    </span>
                    {testimonial.quote}
                    <span className="absolute -bottom-4 text-3xl text-primary">
                      &quot;
                    </span>
                  </p>
                </blockquote>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default Testimonials;
