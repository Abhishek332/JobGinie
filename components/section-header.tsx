import React from 'react';

interface SectionTitleProps {
  title: string;
  desc?: string;
}

const SectionHeader = ({ title, desc }: SectionTitleProps) => {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <h2 className="mb-4 text-3xl font-bold tracking-tighter">{title}</h2>
      {desc && <p className="text-muted-foreground">{desc}</p>}
    </div>
  );
};

export default SectionHeader;
