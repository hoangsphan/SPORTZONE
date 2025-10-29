import Header from "../Header";
import HeroSection from "./components/HeroSection";
import FeaturedFacilitiesSection from "./components/FeaturedFacilitiesSection";
import WhyChooseUsSection from "./components/WhyChooseUsSection";
import FeedbackSection from "./components/FeedbackSection";
import Footer from "./components/Footer";

const HomePage = () => {
  return (
    <div className="font-inter bg-white text-[#1a1a1a] min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedFacilitiesSection />
      <WhyChooseUsSection />
      <FeedbackSection />
      <Footer />
    </div>
  );
};

export default HomePage;
