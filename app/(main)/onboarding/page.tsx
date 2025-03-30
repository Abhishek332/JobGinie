import { redirect } from 'next/navigation';
import React from 'react';

import OnboardingForm from './_components/onboarding-form';
import { getUserOnboardingStatus } from '@/actions/user';
import { industries } from '@/data/industries';

const Onboarding = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect('/market-trends');
  }

  return (
    <div>
      <OnboardingForm industries={industries} />
    </div>
  );
};

export default Onboarding;
