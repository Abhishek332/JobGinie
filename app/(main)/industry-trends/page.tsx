import { redirect } from 'next/navigation';
import React from 'react';

import DashboardView from './_components/dashboard-view';
import { getIndustryTrends } from '@/actions/industry-trends';
import { getUserOnboardingStatus } from '@/actions/user';

const IndustryTrends = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();
  const industryInsights = await getIndustryTrends('Software Development');

  if (!isOnboarded) {
    redirect('/onboarding');
  }

  return (
    <div>
      <DashboardView insights={industryInsights} />
    </div>
  );
};

export default IndustryTrends;
