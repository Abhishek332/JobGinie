import React from 'react';

interface SectionTitleProps {
  title: string;
}

const SectionTitle = ({ title }: SectionTitleProps) => {
  return (
    <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter">
      {title}
    </h2>
  );
};

export default SectionTitle;
