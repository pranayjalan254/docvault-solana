import Footer from "./Footer";
import HeroSection from "./HeroSection/HeroSection";
import MeetTheTeam from "./MeetTheTeam/MeetTheTeam";
import Navbar from "./Navbar/Navbar";
import WhyDocVault from "./WhyDocVault/WhyDocVault";

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <WhyDocVault />
      <MeetTheTeam />
      <Footer />
    </div>
  );
};
export default LandingPage;
