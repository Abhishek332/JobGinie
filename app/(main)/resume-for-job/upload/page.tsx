import { redirect } from 'next/navigation';

import { getUserOnboardingStatus } from '@/actions/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Placeholder for upload step. Step 4 will add PDF upload UI.
 * Expects sessionId in searchParams (from Step 3 redirect).
 */
export default async function ResumeForJobUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect('/onboarding');

  const { sessionId } = await searchParams;
  if (!sessionId) redirect('/resume-for-job');

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upload resume</CardTitle>
          <CardDescription>
            Step 4 will add the PDF upload form here. Session: {sessionId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You’ll upload your resume PDF and we’ll parse it for fit & gap
            analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
