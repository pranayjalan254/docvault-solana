import React from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { WhyDocVault } from "./components/WhyDocVault";
import { MeetTheTeam } from "./components/MeetTheTeam";
import { Footer } from "./components/Footer";
import { GlobalStyles } from "./styles/GlobalStyles";

const App: React.FC = () => {
  return (
    <>
      <GlobalStyles />
      <Navbar />
      <HeroSection />
      <WhyDocVault />
      <MeetTheTeam />
      <Footer />
    </>
  );
};

export default App;
