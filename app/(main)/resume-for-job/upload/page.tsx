import { redirect } from 'next/navigation';

import ResumeUploadForm from '../_components/resume-upload-form';
import { getResumeSessionForUser } from '@/actions/resume-session';
import { getUserOnboardingStatus } from '@/actions/user';

export default async function ResumeForJobUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect('/onboarding');

  const { sessionId } = await searchParams;
  if (!sessionId) redirect('/resume-for-job');

  const session = await getResumeSessionForUser(sessionId);
  if (!session) redirect('/resume-for-job');

  return (
    <ResumeUploadForm
      sessionId={session.id}
      jobTitle={session.jobTitle}
    />
  );
}
