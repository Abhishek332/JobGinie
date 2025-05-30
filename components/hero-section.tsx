'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

import { Button } from './ui/button';

const HeroSection = () => {
  const imageRef1 = useRef(null);
  const imageRef2 = useRef(null);
  const imageRef3 = useRef(null);

  useEffect(() => {
    const imageElement1 = imageRef1.current as unknown as HTMLDivElement;
    const imageElement2 = imageRef2.current as unknown as HTMLDivElement;
    const imageElement3 = imageRef3.current as unknown as HTMLDivElement;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement1.classList.add('scrolled');
        imageElement2.classList.add('scrolled');
        imageElement3.classList.add('scrolled');
      } else {
        imageElement1.classList.remove('scrolled');
        imageElement2.classList.remove('scrolled');
        imageElement3.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="size-full">
      <div className="text-center">
        <div className="hero-image-wrapper flex items-center justify-between px-10 py-28 md:px-28">
          <div
            ref={imageRef1}
            className="hero-image hidden md:block"
          >
            <Image
              src="/assets/hero.png"
              alt="Hero Image"
              width={450}
              height={450}
              className="-scale-x-100"
              objectFit="contain"
            />
          </div>
          <div className="mx-auto">
            <h1 className="gradient-title text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl">
              Your AI Coach For
              <br />
              Job Hunt
            </h1>
            <p className="mx-auto mt-8 max-w-[600px] text-muted-foreground md:text-xl">
              Analyze Resumes, Track Industry Trends, and Ace Mock Interviews –
              All in One Place!
            </p>
            <div className="mt-10">
              <Link href="/industry-trends">
                <Button
                  size="lg"
                  className="px-8"
                >
                  Boost Your Career with AI
                </Button>
              </Link>
            </div>
          </div>
          <div
            ref={imageRef2}
            className="hero-image hidden md:block"
          >
            <Image
              src="/assets/hero.png"
              alt="Hero Image"
              width={450}
              height={450}
              objectFit="contain"
            />
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div
            ref={imageRef3}
            className="hero-image"
          >
            <Image
              src="/assets/banner2.webp"
              width={920}
              height={720}
              alt="Dashboard Preview"
              className="mx-auto rounded-lg border shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
