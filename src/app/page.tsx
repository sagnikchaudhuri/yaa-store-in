import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MarqueeDivider from "@/components/layout/MarqueeDivider";
import Hero from "@/components/home/Hero";
import FeaturedDrops from "@/components/home/FeaturedDrops";
import AboutSection from "@/components/home/AboutSection";
import CommunitySection from "@/components/home/CommunitySection";
import DropsSignup from "@/components/home/DropsSignup";
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <MarqueeDivider />
        <FeaturedDrops />
        <AboutSection />
        <CommunitySection />
        <DropsSignup />
      </main>
      <Footer />
    </>
  );
}
