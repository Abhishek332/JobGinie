import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'JobHunt AI Assistant: Your Personalized Job Search Companion',
  description:
    'Discover the power of JobHunt AI Assistant—an intelligent tool that helps you find the perfect job. Get tailored job recommendations, optimize your resume, and enhance your job search strategy with cutting-edge AI technology.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html
        lang="en"
        suppressHydrationWarning
      >
        <body className={`${inter.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <footer className="bg-muted/50 py-8">
              <div className="container mx-auto px-4">
                <p className="text-center text-gray-200">
                  Copyright &copy; {new Date().getFullYear()}. Created by:{' '}
                  <a
                    className="underline"
                    href="https://github.com/abhishek332"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abhishek Porwal
                  </a>
                </p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
