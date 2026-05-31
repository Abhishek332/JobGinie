'use client';

import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { uploadResumePdf } from '@/actions/resume-session';
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
import useFetch from '@/hooks/useFetch';
import {
  MAX_RESUME_PDF_SIZE_BYTES,
  RESUME_PDF_MIME_TYPE,
} from '@/types/resume-flow';

interface ResumeUploadFormProps {
  sessionId: string;
  jobTitle: string;
}

function validatePdfFile(file: File): string | null {
  if (
    file.type !== RESUME_PDF_MIME_TYPE &&
    !file.name.toLowerCase().endsWith('.pdf')
  ) {
    return 'Only PDF files are allowed.';
  }

  if (file.size > MAX_RESUME_PDF_SIZE_BYTES) {
    return 'File must be 5 MB or smaller.';
  }

  if (file.size === 0) {
    return 'The selected file is empty.';
  }

  return null;
}

export default function ResumeUploadForm({
  sessionId,
  jobTitle,
}: ResumeUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const { data, loading, fn: submitUpload } = useFetch(uploadResumePdf);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setClientError(file ? validatePdfFile(file) : null);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError(null);

    if (!selectedFile) {
      setClientError('Please select a PDF file.');
      return;
    }

    const error = validatePdfFile(selectedFile);
    if (error) {
      setClientError(error);
      return;
    }

    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('file', selectedFile);
    await submitUpload(formData);
  };

  useEffect(() => {
    if (!data || loading) return;

    if (data.success) {
      toast.success('Resume uploaded and parsed successfully.');
      router.push(`/resume-for-job/analysis?sessionId=${data.sessionId}`);
      return;
    }

    toast.error(data.error);
  }, [data, loading, router]);

  return (
    <div className="flex items-center justify-center bg-background py-10">
      <Card className="mx-2 w-full max-w-lg">
        <CardHeader>
          <CardTitle className="gradient-title text-2xl md:text-3xl">
            Upload resume
          </CardTitle>
          <CardDescription>
            Upload your resume PDF for <strong>{jobTitle}</strong>. We&apos;ll
            parse it on the server for fit and gap analysis next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="resumePdf">Resume PDF</Label>
              <Input
                ref={fileInputRef}
                id="resumePdf"
                type="file"
                accept={RESUME_PDF_MIME_TYPE}
                onChange={onFileChange}
              />
              <p className="text-sm text-muted-foreground">
                PDF only, up to 5 MB. Text-based PDFs work best.
              </p>
              {selectedFile && !clientError && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
              {clientError && (
                <p className="text-sm text-red-500">{clientError}</p>
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
                  Uploading and parsing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Continue to analysis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
