import React, { Suspense } from 'react';
import { BarLoader } from 'react-spinners';

const PagesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container mx-auto mb-20 mt-24 px-5">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="gradient-title text-6xl font-bold">Industry Trends</h1>
      </div>
      <Suspense
        fallback={
          <BarLoader
            className="mt-4"
            color="gray"
            width={'100%'}
          />
        }
      >
        {children}
      </Suspense>
    </div>
  );
};

export default PagesLayout;
