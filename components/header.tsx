import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import {
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PenBox,
  StarsIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface NavTextWithIconProps {
  title: string;
  iconStart: React.ComponentType<{ className: string }>;
  iconEnd?: React.ComponentType<{ className: string }>;
  hideTextForSmallScreen?: boolean;
}

const NavTextWithIcon = ({
  title,
  iconStart: IconStart,
  iconEnd: IconEnd,
  hideTextForSmallScreen = false,
}: NavTextWithIconProps) => {
  return (
    <>
      <IconStart className="size-4" />
      <span className={hideTextForSmallScreen ? 'hidden md:block' : ''}>
        {title}
      </span>
      {IconEnd && <IconEnd className="size-4" />}
    </>
  );
};

const Header = () => {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <Image
            src="/assets/logo.webp"
            alt="JobGenie Logo"
            width={60}
            height={60}
          />
        </Link>

        <div className="flex items-center space-x-2">
          <SignedIn>
            <Link href="/market-trends">
              <Button variant="outline">
                <NavTextWithIcon
                  iconStart={LayoutDashboard}
                  title="Market Trends"
                  hideTextForSmallScreen
                />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <NavTextWithIcon
                    iconStart={StarsIcon}
                    title="Helper Tools"
                    iconEnd={ChevronDown}
                    hideTextForSmallScreen
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link
                    href="/resume-builder"
                    className="flex items-center gap-2"
                  >
                    <NavTextWithIcon
                      iconStart={FileText}
                      title="Resume Builder"
                    />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/ai-cover-leter"
                    className="flex items-center gap-2"
                  >
                    <NavTextWithIcon
                      iconStart={PenBox}
                      title="Cover Letter Generator"
                    />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/interview-preparation"
                    className="flex items-center gap-2"
                  >
                    <NavTextWithIcon
                      iconStart={GraduationCap}
                      title="Interview Prep"
                    />
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign in</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-10 w-10',
                  userButtonPopoverCard: 'shadow-xl',
                  userPreviewMainIdentifier: 'font-semibold',
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
