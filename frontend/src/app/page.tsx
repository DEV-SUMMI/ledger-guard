import { AppDemo } from "@/components/AppDemo";
import { Cta } from "@/components/Cta";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";
import { Security } from "@/components/Security";
import { Stats } from "@/components/Stats";

export default function Home() {
  return (
    <div className="min-h-screen bg-vault-bg text-vault-text overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
      <Security />
      <AppDemo />
      <Cta />
      <Footer />
    </div>
  );
}
