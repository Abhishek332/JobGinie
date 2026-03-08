'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createResumeSession } from '@/actions/resume-session';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useFetch from '@/hooks/useFetch';
import {
  jobDetailsSchema,
  type JobDetailsFormData,
} from '@/lib/validation.schema';

export default function JobDetailsForm() {
  const router = useRouter();
  const { data, loading, fn: submitSession } = useFetch(createResumeSession);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<JobDetailsFormData>({
    resolver: zodResolver(jobDetailsSchema),
    defaultValues: {
      jobTitle: '',
      jobDescription: '',
      yearsRequired: undefined,
    },
  });

  const onSubmit = (formData: JobDetailsFormData) => {
    submitSession(formData);
  };

  useEffect(() => {
    if (!data || loading) return;
    if (data.success && 'sessionId' in data) {
      toast.success('Job details saved. Upload your resume next.');
      router.push(`/resume-for-job/upload?sessionId=${data.sessionId}`);
      return;
    }
    if (!data.success && 'error' in data) {
      toast.error(data.error);
    }
  }, [data, loading, router]);

  return (
    <div className="flex items-center justify-center bg-background py-10">
      <Card className="mx-2 w-full max-w-lg">
        <CardHeader>
          <CardTitle className="gradient-title text-2xl md:text-3xl">
            Job details
          </CardTitle>
          <CardDescription>
            Enter the role you’re applying for. We’ll use this to analyze your
            resume and build an ATS-friendly version.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior Frontend Engineer"
                {...register('jobTitle')}
              />
              {errors.jobTitle && (
                <p className="text-sm text-red-500">
                  {errors.jobTitle.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the full job description here..."
                className="min-h-[180px] resize-y"
                {...register('jobDescription')}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500">
                  {errors.jobDescription.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsRequired">
                Years of experience required (optional)
              </Label>
              <Input
                id="yearsRequired"
                type="number"
                min={0}
                max={50}
                placeholder="e.g. 5"
                {...register('yearsRequired')}
              />
              {errors.yearsRequired && (
                <p className="text-sm text-red-500">
                  {errors.yearsRequired.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue to upload resume'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
