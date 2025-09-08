"use client";

import { ProfessionalNavbar } from "@/components/ui/professional-navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { UserTypeSection } from "@/components/ui/user-type-section";
import { FeaturesSection } from "@/components/ui/features-section";
import { ProfessionalFooter } from "@/components/ui/professional-footer";
import { HowItWorksSection } from "@/components/ui/how-it-works-section";
// The TechStackSection import has been removed

export default function Home() {
  return (
    <div className="min-h-screen text-white overflow-hidden">
      <ProfessionalNavbar />
      
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <UserTypeSection />
        <HowItWorksSection />
        {/* The <TechStackSection /> component has been removed */}
      </main>
      
      <ProfessionalFooter />
    </div>
  );
}