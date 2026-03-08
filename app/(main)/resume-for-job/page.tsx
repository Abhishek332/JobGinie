import { redirect } from 'next/navigation';

import JobDetailsForm from './_components/job-details-form';
import { getUserOnboardingStatus } from '@/actions/user';

export default async function ResumeForJobPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect('/onboarding');
  }

  return <JobDetailsForm />;
}
