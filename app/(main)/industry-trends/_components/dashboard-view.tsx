'use client';
import { IndustryInsight } from '@prisma/client';
import React from 'react';

interface DashboardViewProps {
  insights: IndustryInsight;
}

const DashboardView = ({ insights }: DashboardViewProps) => {
  console.log(insights);
  return <div>DashboardView</div>;
};

export default DashboardView;
