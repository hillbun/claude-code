import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProductsSection from "@/components/ProductsSection";
import RecruitmentSection from "@/components/RecruitmentSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <RecruitmentSection />
      <ContactSection />
    </main>
  );
}
