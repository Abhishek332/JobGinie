import Features from '@/components/features';
import HeroSection from '@/components/hero-section';
import './globals.css';

export default function Home() {
  return (
    <>
      <div className="grid-bg"></div>
      <HeroSection />
      <Features />
    </>
  );
}
