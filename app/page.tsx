import CallToActions from '@/components/cta';
import FAQs from '@/components/faqs';
import Features from '@/components/features';
import HeroSection from '@/components/hero-section';
import './globals.css';
import HowItWorks from '@/components/how-it-works';
import StatsSection from '@/components/stats-section';
import Testimonials from '@/components/testimonials';

export default function Home() {
  return (
    <>
      <div className="grid-bg"></div>
      <HeroSection />
      <Features />
      <StatsSection />
      <HowItWorks />
      <Testimonials />
      <FAQs />
      <CallToActions />
    </>
  );
}
