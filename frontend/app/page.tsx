"use client";

import { ProfessionalNavbar } from "@/components/ui/professional-navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { UserTypeSection } from "@/components/ui/user-type-section";
import { FeaturesSection } from "@/components/ui/features-section";
import { ProfessionalFooter } from "@/components/ui/professional-footer";

export default function Home() {
  return (
    <div className="min-h-screen text-white overflow-hidden">
      {/* All other background components have been removed */}
      <ProfessionalNavbar />
      
      <main >
        <HeroSection />
        <UserTypeSection />
        <FeaturesSection />
      </main>
      
      <ProfessionalFooter />
    </div>
  );
}
