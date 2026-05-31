import { redirect } from 'next/navigation';

import { getResumeSessionForUser } from '@/actions/resume-session';
import { getUserOnboardingStatus } from '@/actions/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Placeholder for analysis step. Step 5 will run fit + gap analysis here.
 */
export default async function ResumeForJobAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect('/onboarding');

  const { sessionId } = await searchParams;
  if (!sessionId) redirect('/resume-for-job');

  const session = await getResumeSessionForUser(sessionId);
  if (!session?.parsedResumeText)
    redirect(`/resume-for-job/upload?sessionId=${sessionId}`);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Analysis</CardTitle>
          <CardDescription>
            Step 5 will run fit and gap analysis for {session.jobTitle}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Resume text has been parsed and saved. Analysis UI and LLM scoring
            come next.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
