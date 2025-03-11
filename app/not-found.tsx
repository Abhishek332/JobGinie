import { Ghost } from 'lucide-react';
import Link from 'next/link';

import { Button } from '../components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-gray-900">
      <div className="max-w-xl rounded-2xl p-10 text-center shadow-lg backdrop-blur">
        <Ghost className="mx-auto size-16 text-muted-foreground" />
        <h1 className="gradient-title my-3 text-3xl font-bold md:text-5xl">
          Oops! Page Not Found
        </h1>
        <p className="mb-8 text-gray-600">
          It looks like you&apos;ve wandered off track. Let’s get you back!
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
