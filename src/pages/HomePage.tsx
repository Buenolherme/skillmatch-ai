import { HeroSection } from '../components/HeroSection';
import { HowItWorks } from '../components/HowItWorks';
import { Benefits } from '../components/Benefits';
import { ScoutSection } from '../components/home/ScoutSection';
import { HomeCTASection } from '../components/home/HomeCTASection';

export function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <Benefits />
      <ScoutSection />
      <HomeCTASection />
    </div>
  );
}
