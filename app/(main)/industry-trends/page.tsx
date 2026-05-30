import { redirect } from 'next/navigation';
import React from 'react';

import DashboardView from './_components/dashboard-view';
import { getIndustryTrends } from '@/actions/industry-trends';
import { getUserOnboardingStatus } from '@/actions/user';

const IndustryTrends = async () => {
  const { isOnboarded, industry } = await getUserOnboardingStatus();

  if (!isOnboarded || !industry) {
    redirect('/onboarding');
  }

  const industryInsights = await getIndustryTrends(industry);

  return (
    <div>
      <DashboardView
        insights={
          industryInsights as React.ComponentProps<
            typeof DashboardView
          >['insights']
        }
      />
    </div>
  );
};

export default IndustryTrends;
