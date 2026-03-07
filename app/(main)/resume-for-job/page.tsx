import { FileText } from 'lucide-react';
import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Placeholder for the resume-for-job flow. Step 3 will add the job details form.
 */
export default function ResumeForJobPlaceholderPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex justify-center">
            <FileText className="size-12 text-primary" />
          </div>
          <CardTitle className="text-center">Resume for this job</CardTitle>
          <CardDescription className="text-center">
            Resume flow – Step 3 will add the job details form here. You’ll be
            able to enter job details, upload your resume PDF, get fit & gap
            analysis, and build an ATS-friendly resume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Coming next in the implementation plan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
