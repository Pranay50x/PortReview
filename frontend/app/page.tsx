"use client";

import { FloatingParticles } from "@/components/ui/floating-particles";
import { AnimatedGridBackground } from "@/components/ui/animated-grid-background";
import { ProfessionalNavbar } from "@/components/ui/professional-navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { UserTypeSection } from "@/components/ui/user-type-section";
import { FeaturesSection } from "@/components/ui/features-section";
import { ProfessionalFooter } from "@/components/ui/professional-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      <AnimatedGridBackground />
      <FloatingParticles />
      <ProfessionalNavbar />
      
      <main className="relative z-10">
        <HeroSection />
        <UserTypeSection />
        <FeaturesSection />
      </main>
      
      <ProfessionalFooter />
    </div>
  );
}
