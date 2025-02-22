import React from 'react';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const SectionWrapper = ({ children, className = '' }: SectionWrapperProps) => {
  return (
    <section className={`w-full bg-background py-12 md:py-24 ${className}`}>
      <div className="container mx-auto px-4 md:px-6">{children}</div>
    </section>
  );
};

export default SectionWrapper;
